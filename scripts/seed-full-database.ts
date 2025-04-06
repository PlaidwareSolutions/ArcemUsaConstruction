import * as fs from 'fs';
import * as path from 'path';
import { db } from '../server/db';
import * as schema from '../shared/schema';

/**
 * This script imports a full database seed from the exports directory
 * It follows a specific order to handle relationships properly
 */
async function seedFullDatabase() {
  console.log('Starting full database seed...');
  
  const exportDir = path.join(process.cwd(), 'exports');
  if (!fs.existsSync(exportDir)) {
    console.error('❌ Exports directory not found! Run the export script first.');
    process.exit(1);
  }
  
  try {
    // Define the order in which tables should be seeded to respect foreign key constraints
    const seedOrder = [
      // Independent tables with no foreign keys
      'users',
      'blog_categories',
      'blog_tags',
      'team_members',
      
      // Tables with simple dependencies
      'services',
      'projects',
      'blog_posts',
      'job_postings',
      
      // Tables with more dependencies
      'testimonials',
      'messages',
      'contact_submissions',
      'newsletter_subscribers',
      
      // Join tables and heavily dependent tables
      'blog_post_categories',
      'blog_post_tags',
      'project_gallery',
      'blog_gallery',
      'service_gallery',
      'quote_requests',
      'quote_request_attachments',
      'subcontractor_applications',
      'vendor_applications'
    ];
    
    // Process each table in order
    for (const tableName of seedOrder) {
      const filePath = path.join(exportDir, `${tableName}.json`);
      
      // Skip if the file doesn't exist
      if (!fs.existsSync(filePath)) {
        console.log(`ℹ️ No data file found for ${tableName}, skipping.`);
        continue;
      }
      
      console.log(`Seeding ${tableName}...`);
      
      // Find the table key in the schema
      const tableKey = Object.keys(schema).find(key => {
        const val = (schema as any)[key];
        return val && typeof val === 'object' && 'name' in val && val.name === tableName;
      });
      
      if (!tableKey) {
        console.warn(`⚠️ Table ${tableName} not found in schema, skipping`);
        continue;
      }
      
      // Get the actual table object
      const tableObj = (schema as any)[tableKey];
      
      try {
        // Read data from the JSON file
        const dataString = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(dataString);
        
        if (data.length > 0) {
          console.log(`  Inserting ${data.length} records...`);
          
          // Insert in chunks to avoid oversized queries
          const chunkSize = 50;
          for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await db.insert(tableObj).values(chunk);
          }
          
          console.log(`✅ Successfully seeded ${data.length} records into ${tableName}`);
        } else {
          console.log(`ℹ️ No data to seed for ${tableName}`);
        }
      } catch (error) {
        console.error(`❌ Error seeding ${tableName}:`, error);
      }
    }
    
    // Process any remaining tables that weren't in the predefined order
    const existingFiles = fs.readdirSync(exportDir).filter(file => file.endsWith('.json'));
    for (const file of existingFiles) {
      const tableName = path.basename(file, '.json');
      
      // Skip if already processed
      if (seedOrder.includes(tableName)) {
        continue;
      }
      
      console.log(`Seeding additional table ${tableName}...`);
      
      // Find the table key in the schema
      const tableKey = Object.keys(schema).find(key => {
        const val = (schema as any)[key];
        return val && typeof val === 'object' && 'name' in val && val.name === tableName;
      });
      
      if (!tableKey) {
        console.warn(`⚠️ Table ${tableName} not found in schema, skipping`);
        continue;
      }
      
      // Get the actual table object
      const tableObj = (schema as any)[tableKey];
      
      try {
        // Read data from the JSON file
        const filePath = path.join(exportDir, file);
        const dataString = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(dataString);
        
        if (data.length > 0) {
          console.log(`  Inserting ${data.length} records...`);
          
          // Insert in chunks to avoid oversized queries
          const chunkSize = 50;
          for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await db.insert(tableObj).values(chunk);
          }
          
          console.log(`✅ Successfully seeded ${data.length} records into ${tableName}`);
        } else {
          console.log(`ℹ️ No data to seed for ${tableName}`);
        }
      } catch (error) {
        console.error(`❌ Error seeding ${tableName}:`, error);
      }
    }
    
    console.log('📊 Full database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
}

// Execute only if this script is run directly (ESM version)
const isMainModule = import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  seedFullDatabase().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export { seedFullDatabase };