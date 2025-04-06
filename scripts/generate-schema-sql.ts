import fs from 'fs';
import postgres from 'postgres';

const SQL_FILE_PATH = './complete-schema.sql';
// Use a direct postgres connection
const directDb = postgres(process.env.DATABASE_URL || "", { max: 1 });

async function generateSchemaSql(): Promise<void> {
  console.log('Generating complete SQL schema...');
  
  try {
    // Query to generate the SQL for all tables, constraints, and indexes
    const schemaQuery = `
      SELECT 
        'CREATE TABLE ' || 
        quote_ident(col.table_schema) || '.' || quote_ident(col.table_name) || 
        E' (\n' || 
        string_agg(
          '  ' || quote_ident(col.column_name) || ' ' || col.data_type || 
          CASE WHEN col.is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
          CASE WHEN col.column_default IS NOT NULL THEN ' DEFAULT ' || col.column_default ELSE '' END,
          E',\n'
        ) || 
        CASE WHEN c.conname IS NOT NULL 
          THEN E',\n  CONSTRAINT ' || quote_ident(c.conname) || ' PRIMARY KEY (' || 
            string_agg(quote_ident(pk.attname), ', ' ORDER BY k.indisprimary DESC, k.indisunique DESC, pk.attnum) || ')'
          ELSE ''
        END ||
        E'\n);' as create_table_script
      FROM 
        information_schema.columns col
      LEFT JOIN pg_class t ON t.relname = col.table_name
      LEFT JOIN pg_namespace s ON s.nspname = col.table_schema AND t.relnamespace = s.oid
      LEFT JOIN pg_constraint c ON c.conrelid = t.oid AND c.contype = 'p'
      LEFT JOIN pg_index k ON k.indexrelid = c.conindid
      LEFT JOIN pg_attribute pk ON pk.attrelid = t.oid AND pk.attnum = ANY(k.indkey)
      WHERE 
        col.table_schema = 'public'
      GROUP BY 
        col.table_schema, col.table_name, c.conname
      ORDER BY 
        col.table_schema, col.table_name;
    `;
    
    const foreignKeyQuery = `
      SELECT 
        'ALTER TABLE ' || quote_ident(nsp.nspname) || '.' || quote_ident(cl.relname) || 
        ' ADD CONSTRAINT ' || quote_ident(conname) || ' ' || 
        pg_get_constraintdef(con.oid) || ';' as add_fk_script
      FROM 
        pg_constraint con
      JOIN pg_class cl ON con.conrelid = cl.oid
      JOIN pg_namespace nsp ON cl.relnamespace = nsp.oid
      WHERE 
        con.contype = 'f' AND
        nsp.nspname = 'public'
      ORDER BY 
        nsp.nspname, cl.relname, con.conname;
    `;
    
    const indexQuery = `
      SELECT 
        'CREATE INDEX ' || quote_ident(i.relname) || ' ON ' || 
        quote_ident(n.nspname) || '.' || quote_ident(t.relname) || ' ' || 
        pg_get_indexdef(i.oid, 0, false) || ';' as create_index_script
      FROM 
        pg_index idx
      JOIN pg_class i ON i.oid = idx.indexrelid
      JOIN pg_class t ON t.oid = idx.indrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      LEFT JOIN pg_constraint c ON c.conindid = idx.indexrelid
      WHERE 
        n.nspname = 'public' AND
        c.oid IS NULL AND
        i.relkind = 'i' AND
        idx.indisprimary = false
      ORDER BY 
        n.nspname, t.relname, i.relname;
    `;
    
    // Query to get sequence information and current values
    const sequenceQuery = `
      SELECT 
        'SELECT setval(' || quote_literal(quote_ident(n.nspname) || '.' || quote_ident(c.relname)) ||
        ', COALESCE((SELECT MAX(id) FROM ' || quote_ident(t.relname) || '), 0) + 1, false);' as sequence_script,
        c.relname as sequence_name,
        t.relname as table_name
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_depend d ON d.objid = c.oid
      JOIN pg_class t ON t.oid = d.refobjid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
      WHERE c.relkind = 'S'
      AND n.nspname = 'public'
      ORDER BY t.relname, c.relname;
    `;
    
    // Execute the queries
    const tableRows = await directDb.unsafe(schemaQuery);
    const fkRows = await directDb.unsafe(foreignKeyQuery);
    const indexRows = await directDb.unsafe(indexQuery);
    const sequenceRows = await directDb.unsafe(sequenceQuery);
    
    // Combine all scripts
    let sqlScript = '-- Complete database schema generated on ' + new Date().toISOString() + '\n\n';
    sqlScript += '-- Tables\n';
    tableRows.forEach((row: any) => {
      sqlScript += row.create_table_script + '\n\n';
    });
    
    sqlScript += '-- Foreign Keys\n';
    fkRows.forEach((row: any) => {
      sqlScript += row.add_fk_script + '\n';
    });
    sqlScript += '\n';
    
    sqlScript += '-- Indexes\n';
    indexRows.forEach((row: any) => {
      sqlScript += row.create_index_script + '\n';
    });
    sqlScript += '\n';
    
    sqlScript += '-- Sequence Reset Statements (Run after importing data)\n';
    sequenceRows.forEach((row: any) => {
      sqlScript += `-- Reset sequence for table ${row.table_name}\n`;
      sqlScript += row.sequence_script + '\n';
    });
    
    // Write the SQL script to a file
    fs.writeFileSync(SQL_FILE_PATH, sqlScript);
    
    console.log(`✅ SQL schema successfully generated and saved to ${SQL_FILE_PATH}`);
  } catch (error) {
    console.error('❌ Error generating SQL schema:', error);
    throw error;
  } finally {
    // Close the direct database connection
    await directDb.end();
  }
}

// Run the schema generation
generateSchemaSql().catch(error => {
  console.error('Schema generation failed:', error);
  directDb.end().then(() => process.exit(1));
});