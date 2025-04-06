import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';
import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import * as schema from '../shared/schema';
import postgres from 'postgres';

const IMPORT_DIR = './database-export';
// Use a direct postgres connection for the raw operations
const directDb = postgres(process.env.DATABASE_URL || "", { max: 1 });

// Define tables in the order they should be imported (respecting foreign key constraints)
const tables = [
  { name: 'users', table: schema.users, useRawImport: false },
  { name: 'projects', table: schema.projects, useRawImport: false },
  { name: 'project_gallery', table: schema.projectGallery, useRawImport: false },
  { name: 'blog_categories', table: schema.blogCategories, useRawImport: true },
  { name: 'blog_tags', table: schema.blogTags, useRawImport: true },
  { name: 'blog_posts', table: schema.blogPosts, useRawImport: false },
  { name: 'blog_gallery', table: schema.blogGallery, useRawImport: false },
  { name: 'blog_post_categories', table: schema.blogPostCategories, useRawImport: false },
  { name: 'blog_post_tags', table: schema.blogPostTags, useRawImport: false },
  { name: 'testimonials', table: schema.testimonials, useRawImport: false },
  { name: 'services', table: schema.services, useRawImport: false },
  { name: 'service_gallery', table: schema.serviceGallery, useRawImport: true },
  { name: 'messages', table: schema.messages, useRawImport: false },
  { name: 'newsletter_subscribers', table: schema.newsletterSubscribers, useRawImport: true },
  { name: 'quote_requests', table: schema.quoteRequests, useRawImport: false },
  { name: 'quote_request_attachments', table: schema.quoteRequestAttachments, useRawImport: false },
  { name: 'subcontractors', table: schema.subcontractors, useRawImport: false },
  { name: 'vendors', table: schema.vendors, useRawImport: false },
  { name: 'job_postings', table: schema.jobPostings, useRawImport: false },
  { name: 'team_members', table: schema.teamMembers, useRawImport: false },
];

async function clearTable(tableName: string): Promise<void> {
  try {
    console.log(`Clearing table: ${tableName}`);
    // Using a raw SQL query with CASCADE to handle foreign key constraints
    await directDb`TRUNCATE TABLE ${directDb(tableName)} CASCADE`;
    console.log(`✅ Cleared table ${tableName}`);
  } catch (error) {
    console.error(`❌ Error clearing table ${tableName}:`, error);
    throw error;
  }
}

async function importTable(tableName: string, table: any, useRawImport: boolean = false): Promise<void> {
  try {
    const filePath = path.join(IMPORT_DIR, `${tableName}.json`);
    
    // Check if the import file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Import file for ${tableName} not found, skipping.`);
      return;
    }
    
    // Read the data from the JSON file
    const rawData = fs.readFileSync(filePath, 'utf8');
    const records = JSON.parse(rawData);
    
    if (!records.length) {
      console.log(`⚠️ No records found for ${tableName}, skipping.`);
      return;
    }
    
    console.log(`Importing ${records.length} records into ${tableName}...`);
    
    // Insert the records into the table
    if (records.length > 0) {
      try {
        if (useRawImport) {
          // Use raw SQL for tables with schema mismatches
          console.log(`Using raw SQL import for ${tableName} due to schema mismatch`);
          
          // Handle different tables with specific column requirements
          if (tableName === 'blog_categories') {
            for (const record of records) {
              await directDb`
                INSERT INTO blog_categories (id, name, slug, description)
                VALUES (${record.id}, ${record.name}, ${record.slug}, ${record.description})
              `;
            }
          } else if (tableName === 'blog_tags') {
            for (const record of records) {
              await directDb`
                INSERT INTO blog_tags (id, name, slug)
                VALUES (${record.id}, ${record.name}, ${record.slug})
              `;
            }
          } else if (tableName === 'service_gallery') {
            for (const record of records) {
              await directDb`
                INSERT INTO service_gallery (id, service_id, image_url, alt, "order", created_at)
                VALUES (
                  ${record.id}, 
                  ${record.service_id}, 
                  ${record.image_url}, 
                  ${record.alt}, 
                  ${record.order}, 
                  ${record.created_at}
                )
              `;
            }
          } else if (tableName === 'newsletter_subscribers') {
            for (const record of records) {
              await directDb`
                INSERT INTO newsletter_subscribers (id, email, first_name, last_name, subscribed, created_at)
                VALUES (
                  ${record.id}, 
                  ${record.email}, 
                  ${record.first_name}, 
                  ${record.last_name}, 
                  ${record.subscribed}, 
                  ${record.created_at}
                )
              `;
            }
          }
          
          console.log(`✅ Imported ${records.length} records into ${tableName} using raw SQL`);
        } else {
          // Use drizzle ORM for standard tables
          await db.insert(table).values(records);
          console.log(`✅ Imported ${records.length} records into ${tableName} using Drizzle ORM`);
        }
      } catch (error) {
        console.error(`❌ Error inserting records into ${tableName}:`, error);
        throw error;
      }
    }
  } catch (error) {
    console.error(`❌ Error importing table ${tableName}:`, error);
    throw error;
  }
}

async function verifyImportDirectory(): Promise<boolean> {
  if (!fs.existsSync(IMPORT_DIR)) {
    console.error(`❌ Import directory ${IMPORT_DIR} does not exist.`);
    return false;
  }
  
  // Check if there are JSON files in the directory
  const files = fs.readdirSync(IMPORT_DIR).filter(file => file.endsWith('.json'));
  
  if (files.length === 0) {
    console.error(`❌ No JSON files found in ${IMPORT_DIR}.`);
    return false;
  }
  
  return true;
}

async function getUserConfirmation(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise<boolean>((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function importAllData(): Promise<void> {
  console.log('Starting database import process...');
  
  // Verify that the import directory exists and contains files
  if (!await verifyImportDirectory()) {
    console.error('Import process aborted.');
    return;
  }
  
  // Ask for multiple confirmations before proceeding
  console.log('\n⚠️ IMPORTANT DATABASE OPERATION WARNING ⚠️');
  console.log('This script is designed ONLY for importing data into a NEW or EMPTY database.');
  console.log('It will DELETE ALL EXISTING DATA in the current database before importing.');
  console.log('DO NOT run this on your production database unless you are absolutely sure.');
  console.log('This is typically used when migrating to a new environment.\n');
  
  const initialConfirm = await getUserConfirmation(
    '⚠️ WARNING: Are you sure you want to delete all existing data in this database?'
  );
  
  if (!initialConfirm) {
    console.log('Import process aborted by user.');
    return;
  }
  
  const shouldProceed = await getUserConfirmation(
    '⚠️ FINAL WARNING: This operation cannot be undone. Type "yes" to confirm you want to proceed'
  );
  
  if (!shouldProceed) {
    console.log('Import process aborted by user.');
    return;
  }
  
  try {
    // Temporarily disable foreign key checks to allow clearing tables with circular dependencies
    await directDb`SET session_replication_role = replica`;
    
    // Clear each table
    for (const tableInfo of tables) {
      await clearTable(tableInfo.name);
    }
    
    // Re-enable foreign key checks
    await directDb`SET session_replication_role = DEFAULT`;
    
    // Import data into each table
    for (const tableInfo of tables) {
      await importTable(tableInfo.name, tableInfo.table, tableInfo.useRawImport);
    }
    
    console.log('\nImport completed successfully!');
  } catch (error) {
    console.error('Import process failed:', error);
    // Re-enable foreign key checks in case of failure
    await directDb`SET session_replication_role = DEFAULT`;
  } finally {
    // Close the direct database connection
    await directDb.end();
  }
}

// Run the import
importAllData().catch(error => {
  console.error('Import process failed:', error);
  directDb.end().then(() => process.exit(1));
});