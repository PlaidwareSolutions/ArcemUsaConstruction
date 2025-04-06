import * as fs from 'fs';
import * as path from 'path';
import { db } from '../server/db';
import * as schema from '../shared/schema';

// Define the tables we're most interested in exporting
// This helps prioritize the most important data
const PRIORITY_TABLES = [
  'users',
  'projects',
  'project_gallery',
  'services',
  'service_gallery',
  'blog_posts',
  'blog_categories',
  'blog_tags',
  'blog_post_categories',
  'blog_post_tags',
  'blog_gallery',
  'team_members',
  'job_postings',
  'testimonials',
  'messages',
  'quote_requests',
  'quote_request_attachments',
  'newsletter_subscribers'
];

/**
 * This script exports all data from the database tables to JSON files
 * Each table's data is exported to a separate file in the /exports directory
 */
async function exportAllData() {
  console.log('Starting data export...');
  
  // Create exports directory if it doesn't exist
  const exportDir = path.join(process.cwd(), 'exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
    console.log(`Created exports directory at ${exportDir}`);
  }
  
  try {
    // Get all tables from the schema
    const tableNames = Object.keys(schema).filter(key => {
      const value = (schema as any)[key];
      // Filter out non-table exports (like relations, enums, etc.)
      return typeof value === 'object' && value !== null && 'name' in value;
    });
    
    console.log(`Found ${tableNames.length} tables to export`);
    
    // Create a mapping of table objects by their name
    const tableMap: Record<string, { schemaKey: string, table: any }> = {};
    
    console.log("Debug: Analyzing schema tables...");
    for (const name of tableNames) {
      const table = (schema as any)[name];
      if (table && 'name' in table) {
        // Convert the table name to a reliable string
        let tableNameStr: string;
        try {
          // Try various methods of getting a string representation
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
                console.log(`  Warning: Could not get table name string for ${name}, using schema key instead`);
              }
            }
          } else {
            // Fallback to using the schema key
            tableNameStr = name.toLowerCase();
            console.log(`  Warning: No valid name property for ${name}, using schema key instead`);
          }
          
          console.log(`  Table ${name} -> "${tableNameStr}"`);
          tableMap[tableNameStr] = { schemaKey: name, table };
        } catch (err) {
          console.error(`  Error getting name for table ${name}:`, err);
        }
      }
    }
    
    // Sort tables - priority tables first, then alphabetically
    const sortedTableNames = [...PRIORITY_TABLES]
      .filter(name => tableMap[name]) // Ensure the table exists in our schema
      .concat(
        Object.keys(tableMap)
          .filter(name => !PRIORITY_TABLES.includes(name))
          .sort()
      );
    
    console.log(`Prepared ${sortedTableNames.length} tables for export`);
    console.log(`Priority tables: ${PRIORITY_TABLES.filter(t => tableMap[t]).join(', ')}`);
    
    // Export data from each table
    let totalTablesExported = 0;
    let totalRecordsExported = 0;
    
    for (let tableKey of sortedTableNames) {
      try {
        const { schemaKey, table } = tableMap[tableKey];
        // Use tableKey as the safe table name string since we've already processed it
        console.log(`[${totalTablesExported + 1}/${sortedTableNames.length}] Exporting data from ${tableKey}...`);
        
        // Execute a select query to get all data from the table
        // First check if the table exists
        let tableExists = false;
        let actualTableName = tableKey; // Store the actual table name which might be different
        
        // Check if table exists in the database
        try {
          const checkResult = await db.execute(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = '${tableKey}'
            );
          `);
          
          tableExists = checkResult[0]?.exists === true;
          
          if (!tableExists) {
            // Try schema case variations
            const checkResult2 = await db.execute(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = '${schemaKey.toLowerCase()}'
              );
            `);
            
            if (checkResult2[0]?.exists === true) {
              tableExists = true;
              actualTableName = schemaKey.toLowerCase();
              console.log(`  Found table using schema key: ${actualTableName}`);
            }
          }
          
          if (!tableExists) {
            console.log(`  Table ${tableKey} does not exist in the database. Skipping.`);
            // Skip this table, but continue with the next one
            console.log(`➖ Skipped table ${tableKey}`);
            throw new Error("TABLE_NOT_FOUND"); // Will be caught by the outer catch and won't halt the loop
          }
        } catch (checkError) {
          if (checkError instanceof Error && checkError.message === "TABLE_NOT_FOUND") {
            // This is our own error, rethrow it
            throw checkError;
          } else {
            // This is an unexpected error
            console.error(`  Error checking if table exists: ${checkError instanceof Error ? checkError.message : String(checkError)}`);
            // Skip this table
            throw new Error("TABLE_CHECK_ERROR");
          }
        }
        
        // Now try to get the data
        let data;
        try {
          // Try to do a select * from the table
          data = await db.select().from(table);
        } catch (selectError) {
          console.log(`  Warning: Error during standard select, attempting with raw query: ${selectError instanceof Error ? selectError.message : String(selectError)}`);
          
          // If that fails, try a raw query to get all rows
          try {
            data = await db.execute(`SELECT * FROM ${actualTableName}`);
            console.log(`  Successfully retrieved data using raw query.`);
          } catch (rawError) {
            console.error(`  Failed raw query as well: ${rawError instanceof Error ? rawError.message : String(rawError)}`);
            
            // Don't throw, just skip this table
            console.warn(`  Skipping table ${tableKey} due to errors.`);
            console.log(`➖ Skipped table ${tableKey}`);
            throw new Error("QUERY_ERROR");
          }
        }
        
        // Write the data to a JSON file
        const filePath = path.join(exportDir, `${actualTableName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        totalRecordsExported += data.length;
        totalTablesExported++;
        
        console.log(`✅ Exported ${data.length} records from ${actualTableName}`);
      } catch (error) {
        // Only log if it's not one of our special error types
        if (!(error instanceof Error) || 
            (error.message !== "TABLE_NOT_FOUND" && 
             error.message !== "QUERY_ERROR" && 
             error.message !== "TABLE_CHECK_ERROR")) {
          console.error(`❌ Error exporting data from ${tableKey}:`, error);
          console.error(`Detail:`, error instanceof Error ? error.message : String(error));
        }
      }
    }
    
    console.log(`Data export completed successfully!`);
    console.log(`Exported ${totalRecordsExported} total records from ${totalTablesExported} tables`);
    console.log(`All data has been exported to the ${exportDir} directory`);
  } catch (error) {
    console.error('❌ Error during data export:', error);
    console.error('Detail:', error instanceof Error ? error.message : String(error));
  }
}

// Create a corresponding import function to restore the data
async function importAllData() {
  console.log('Starting data import...');
  
  const exportDir = path.join(process.cwd(), 'exports');
  if (!fs.existsSync(exportDir)) {
    console.error('❌ Exports directory not found!');
    return;
  }
  
  try {
    // Get all table files from the exports directory
    const tableFiles = fs.readdirSync(exportDir).filter(file => file.endsWith('.json'));
    
    console.log(`Found ${tableFiles.length} table data files to import`);
    
    // Use our priority tables list to determine the order
    // This list is already ordered by dependencies
    const importOrder = [
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
    
    // Sort files based on the import order
    tableFiles.sort((a, b) => {
      const aName = path.basename(a, '.json');
      const bName = path.basename(b, '.json');
      
      const aIndex = importOrder.indexOf(aName);
      const bIndex = importOrder.indexOf(bName);
      
      // If table is not in import order, put it at the end
      const indexA = aIndex === -1 ? 999 : aIndex;
      const indexB = bIndex === -1 ? 999 : bIndex;
      
      return indexA - indexB;
    });
    
    console.log('Import order:');
    tableFiles.forEach((file, idx) => {
      console.log(`  ${idx + 1}. ${path.basename(file, '.json')}`);
    });
    
    // Create a mapping of schema tables by name for faster lookup
    const tableMap: Record<string, { schemaKey: string, table: any }> = {};
    
    console.log("Debug: Analyzing schema tables for import...");
    for (const key of Object.keys(schema)) {
      const val = (schema as any)[key];
      if (val && typeof val === 'object' && 'name' in val) {
        // Convert the table name to a reliable string
        let tableNameStr: string;
        try {
          // Try various methods of getting a string representation
          if (typeof val.name === 'string') {
            tableNameStr = val.name;
          } else if (val.name && typeof val.name.toString === 'function') {
            tableNameStr = val.name.toString();
            // Check if toString returned [object Object]
            if (tableNameStr === '[object Object]') {
              // Try to access the literal value
              if ('_value' in val.name) {
                tableNameStr = String(val.name._value);
              } else {
                // Last resort - use the schema key
                tableNameStr = key.toLowerCase();
                console.log(`  Warning: Could not get table name string for ${key}, using schema key instead`);
              }
            }
          } else {
            // Fallback to using the schema key
            tableNameStr = key.toLowerCase();
            console.log(`  Warning: No valid name property for ${key}, using schema key instead`);
          }
          
          console.log(`  Table ${key} -> "${tableNameStr}"`);
          tableMap[tableNameStr] = { schemaKey: key, table: val };
        } catch (err) {
          console.error(`  Error getting name for table ${key}:`, err);
        }
      }
    }
    
    // Import data for each table
    let totalTablesImported = 0;
    let totalRecordsImported = 0;
    
    for (const file of tableFiles) {
      const tableName = path.basename(file, '.json');
      console.log(`[${totalTablesImported + 1}/${tableFiles.length}] Importing data into ${tableName}...`);
      
      // Find the corresponding table in schema using our map
      const tableInfo = tableMap[tableName];
      
      if (!tableInfo) {
        console.warn(`⚠️ Table ${tableName} not found in schema, skipping`);
        continue;
      }
      
      try {
        // Read data from JSON file
        const filePath = path.join(exportDir, file);
        const dataString = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(dataString);
        
        if (data.length > 0) {
          console.log(`  Processing ${data.length} records...`);
          
          // Insert data in chunks to avoid query size limits
          const chunkSize = 50; // Smaller chunk size for safer imports
          let insertedCount = 0;
          
          for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            try {
              // Insert data into table
              await db.insert(tableInfo.table).values(chunk);
              insertedCount += chunk.length;
              
              // Show progress for large tables
              if (data.length > 100 && i % 100 === 0) {
                console.log(`  Progress: ${Math.min(i + chunkSize, data.length)}/${data.length} records`);
              }
            } catch (chunkError) {
              console.error(`  ❌ Error inserting chunk ${i}-${i + chunk.length - 1}:`, 
                chunkError instanceof Error ? chunkError.message : String(chunkError));
              
              // Try inserting records one by one to salvage what we can
              console.log(`  Attempting to insert records individually...`);
              for (const record of chunk) {
                try {
                  await db.insert(tableInfo.table).values([record]);
                  insertedCount++;
                } catch (recordError) {
                  console.error(`    ❌ Failed to insert record:`, 
                    recordError instanceof Error ? recordError.message : String(recordError));
                }
              }
            }
          }
          
          totalRecordsImported += insertedCount;
          totalTablesImported++;
          
          console.log(`✅ Imported ${insertedCount} of ${data.length} records into ${tableName}`);
        } else {
          console.log(`ℹ️ No data to import for ${tableName}`);
          totalTablesImported++;
        }
      } catch (error) {
        console.error(`❌ Error importing data into ${tableName}:`, 
          error instanceof Error ? error.message : String(error));
      }
    }
    
    console.log(`Import completed!`);
    console.log(`Imported ${totalRecordsImported} total records across ${totalTablesImported} tables`);
  } catch (error) {
    console.error('❌ Error during data import:', 
      error instanceof Error ? error.message : String(error));
  }
}

// Main execution path for ES modules
// Check if this is the main entry point (via import.meta)
const isMainModule = import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  // Check for command line arguments
  const args = process.argv.slice(2);
  const shouldImport = args.includes('--import');
  
  if (shouldImport) {
    importAllData().then(() => process.exit(0)).catch(err => {
      console.error(err);
      process.exit(1);
    });
  } else {
    exportAllData().then(() => process.exit(0)).catch(err => {
      console.error(err);
      process.exit(1);
    });
  }
}

export { exportAllData, importAllData };