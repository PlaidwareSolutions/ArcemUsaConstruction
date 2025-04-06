import { db } from '../server/db';
import * as schema from '../shared/schema';
import * as fs from 'fs';
import * as path from 'path';

/**
 * This script generates a complete DDL script to recreate the database with current schema and sequence values
 */
async function generateDDL() {
  console.log('Generating database DDL script...');
  
  try {
    // Get all tables from the schema
    const tableNames = Object.keys(schema).filter(key => {
      const value = (schema as any)[key];
      // Filter out non-table exports (like relations, enums, etc.)
      return typeof value === 'object' && value !== null && 'name' in value;
    });
    
    const tableMap: Record<string, { schemaKey: string, table: any }> = {};
    
    console.log("Analyzing schema tables...");
    for (const name of tableNames) {
      const table = (schema as any)[name];
      if (table && 'name' in table) {
        // Convert the table name to a reliable string
        let tableNameStr: string;
        try {
          if (typeof table.name === 'string') {
            tableNameStr = table.name;
          } else if (table.name && typeof table.name.toString === 'function') {
            tableNameStr = table.name.toString();
            // Check if toString returned [object Object]
            if (tableNameStr === '[object Object]') {
              // Try to access the literal value
              if ('_value' in table.name) {
                tableNameStr = String(table.name._value);
              } else {
                // Last resort - use the schema key
                tableNameStr = name.toLowerCase();
              }
            }
          } else {
            // Fallback to using the schema key
            tableNameStr = name.toLowerCase();
          }
          
          console.log(`Table ${name} -> "${tableNameStr}"`);
          tableMap[tableNameStr] = { schemaKey: name, table };
        } catch (err) {
          console.error(`Error getting name for table ${name}:`, err);
        }
      }
    }
    
    // Get the actual table names from the database
    const tableQuery = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);
    
    const dbTableNames = tableQuery.map(row => row.table_name as string);
    console.log(`Found ${dbTableNames.length} tables in the database`);
    
    // Generate DDL output
    let ddlContent = `-- Generated DDL for database - ${new Date().toISOString()}\n\n`;
    
    // Add drop commands first (in reverse order to avoid constraint conflicts)
    ddlContent += `-- Drop tables if they exist (reverse order to handle dependencies)\n`;
    [...dbTableNames].reverse().forEach(tableName => {
      ddlContent += `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
    });
    ddlContent += `\n-- Create tables\n`;
    
    // Define table order based on dependencies
    const tableOrder = [
      // These tables typically have no foreign key dependencies
      'users', 'blog_categories', 'blog_tags', 'team_members',
      
      // Tables with some dependencies
      'services', 'projects', 'blog_posts', 'job_postings',
      
      // Tables with more dependencies
      'testimonials', 'messages', 'newsletter_subscribers',
      
      // Join tables and tables with heavy dependencies
      'blog_post_categories', 'blog_post_tags', 'project_gallery', 'blog_gallery',
      'service_gallery', 'quote_requests', 'quote_request_attachments',
      'subcontractors', 'vendors'
    ];
    
    // Sort tables to handle dependencies properly
    const sortedTableNames = tableOrder
      .filter(name => dbTableNames.includes(name))
      .concat(dbTableNames.filter(name => !tableOrder.includes(name)));
    
    // Process each table sequentially
    for (const tableName of sortedTableNames) {
      try {
        // Get the create table DDL
        const createTableResult = await db.execute(`
          SELECT 
            column_name, 
            data_type, 
            character_maximum_length,
            is_nullable, 
            column_default
          FROM 
            information_schema.columns
          WHERE 
            table_schema = 'public' AND table_name = '${tableName}'
          ORDER BY 
            ordinal_position;
        `);
        
        // Start create table statement
        ddlContent += `\nCREATE TABLE "${tableName}" (\n`;
        
        // Add column definitions
        const columns = createTableResult.map(col => {
          let columnDef = `  "${col.column_name}" ${col.data_type}`;
          
          // Add length if applicable
          if (col.character_maximum_length !== null) {
            columnDef += `(${col.character_maximum_length})`;
          }
          
          // Add NOT NULL if applicable
          if (col.is_nullable === 'NO') {
            columnDef += ' NOT NULL';
          }
          
          // Add default value if applicable
          if (col.column_default !== null) {
            columnDef += ` DEFAULT ${col.column_default}`;
          }
          
          return columnDef;
        });
        
        // Get primary key information
        const pkResult = await db.execute(`
          SELECT a.attname
          FROM   pg_index i
          JOIN   pg_attribute a ON a.attrelid = i.indrelid
                               AND a.attnum = ANY(i.indkey)
          WHERE  i.indrelid = '"${tableName}"'::regclass
          AND    i.indisprimary;
        `);
        
        // Get unique constraints
        const uniqueResult = await db.execute(`
          SELECT
            tc.constraint_name,
            kcu.column_name
          FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
          WHERE tc.constraint_type = 'UNIQUE'
          AND tc.table_name = '${tableName}'
        `);
        
        // Add primary key constraint if found
        if (pkResult.length > 0) {
          const pkColumns = pkResult.map(row => `"${row.attname}"`).join(', ');
          columns.push(`  PRIMARY KEY (${pkColumns})`);
        }
        
        // Add unique constraints if found
        if (uniqueResult.length > 0) {
          // Group by constraint name
          const uniqueConstraints: Record<string, string[]> = {};
          
          uniqueResult.forEach(row => {
            const constraintName = row.constraint_name as string;
            const columnName = row.column_name as string;
            
            if (!uniqueConstraints[constraintName]) {
              uniqueConstraints[constraintName] = [];
            }
            uniqueConstraints[constraintName].push(columnName);
          });
          
          Object.entries(uniqueConstraints).forEach(([constraintName, cols]) => {
            const colNames = cols.map(col => `"${col}"`).join(', ');
            columns.push(`  CONSTRAINT "${constraintName}" UNIQUE (${colNames})`);
          });
        }
        
        // Complete the create table statement
        ddlContent += columns.join(",\n");
        ddlContent += `\n);\n`;
        
        // Only try to get sequence info if we have a primary key
        if (pkResult.length > 0) {
          // Get sequence information for this table
          try {
            const sequenceQuery = await db.execute(`
              SELECT
                pg_get_serial_sequence('${tableName}', '${pkResult[0]?.attname || 'id'}') as sequence_name;
            `);
            
            if (sequenceQuery[0]?.sequence_name) {
              const sequenceName = sequenceQuery[0].sequence_name;
              
              // Get current sequence value
              const currValQuery = await db.execute(`SELECT last_value FROM ${sequenceName};`);
              
              if (currValQuery[0]?.last_value) {
                ddlContent += `\n-- Set sequence value for ${tableName}\n`;
                ddlContent += `SELECT pg_catalog.setval('${sequenceName}', ${currValQuery[0].last_value}, true);\n`;
              }
            }
          } catch (err) {
            console.warn(`Couldn't get sequence info for ${tableName}: ${err.message}`);
          }
        }
        
        console.log(`✅ Generated DDL for table ${tableName}`);
      } catch (error) {
        console.error(`Error generating DDL for table ${tableName}:`, error);
      }
    }
    
    // Instead of querying for foreign keys which can be slow, we'll add the known constraints directly
    ddlContent += `\n-- Add foreign key constraints\n`;
    
    // Define known foreign key relationships
    const foreignKeys = [
      // blog_post_categories
      {
        table: "blog_post_categories",
        column: "post_id",
        refTable: "blog_posts",
        refColumn: "id",
        onDelete: "CASCADE"
      },
      {
        table: "blog_post_categories",
        column: "category_id",
        refTable: "blog_categories",
        refColumn: "id",
        onDelete: "CASCADE"
      },
      
      // blog_post_tags
      {
        table: "blog_post_tags",
        column: "post_id",
        refTable: "blog_posts",
        refColumn: "id",
        onDelete: "CASCADE"
      },
      {
        table: "blog_post_tags",
        column: "tag_id",
        refTable: "blog_tags",
        refColumn: "id",
        onDelete: "CASCADE"
      },
      
      // project_gallery
      {
        table: "project_gallery",
        column: "project_id",
        refTable: "projects",
        refColumn: "id",
        onDelete: "CASCADE"
      },
      
      // blog_gallery
      {
        table: "blog_gallery",
        column: "post_id",
        refTable: "blog_posts",
        refColumn: "id",
        onDelete: "CASCADE"
      },
      
      // service_gallery
      {
        table: "service_gallery",
        column: "service_id",
        refTable: "services",
        refColumn: "id",
        onDelete: "CASCADE"
      },
      
      // quote_request_attachments
      {
        table: "quote_request_attachments",
        column: "quote_request_id",
        refTable: "quote_requests",
        refColumn: "id",
        onDelete: "CASCADE"
      }
    ];
    
    console.log(`Adding ${foreignKeys.length} foreign key constraints`);
    
    // Add each foreign key constraint
    foreignKeys.forEach(fk => {
      const constraintName = `${fk.table}_${fk.column}_fkey`;
      const onDelete = fk.onDelete ? ` ON DELETE ${fk.onDelete}` : '';
      
      ddlContent += `ALTER TABLE "${fk.table}" ADD CONSTRAINT "${constraintName}" `;
      ddlContent += `FOREIGN KEY ("${fk.column}") REFERENCES "${fk.refTable}" ("${fk.refColumn}")${onDelete};\n`;
    });
    
    // Add known indexes directly instead of querying
    ddlContent += `\n-- Create indexes\n`;
    
    const indexes = [
      `CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique ON public.blog_posts USING btree (slug);`,
      `CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON public.users USING btree (username);`,
      `CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON public.session USING btree (expire);`
    ];
    
    indexes.forEach(idx => {
      ddlContent += `${idx}\n`;
    });
    
    // Write the DDL to a file
    const outputFile = path.join(process.cwd(), 'database-schema.sql');
    fs.writeFileSync(outputFile, ddlContent);
    
    console.log(`\nDDL generation completed!`);
    console.log(`Schema file written to: ${outputFile}`);
  } catch (error) {
    console.error('Error generating DDL:', error);
  }
}

// Execute if run directly
if (import.meta.url.endsWith(process.argv[1])) {
  generateDDL().then(() => {
    console.log('Done!');
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export { generateDDL };