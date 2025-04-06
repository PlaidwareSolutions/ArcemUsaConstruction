import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function addCaptionToServiceGallery() {
  try {
    console.log("Starting migration: Adding caption column to service_gallery table");

    // Check if the column already exists to avoid errors
    const checkColumnQuery = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'service_gallery' AND column_name = 'caption';
    `;
    
    const columnExists = await db.execute(sql.raw(checkColumnQuery));
    
    if (columnExists && columnExists.length > 0) {
      console.log("Caption column already exists in service_gallery table. Skipping migration.");
      return;
    }

    // Add the column
    const alterTableQuery = `
      ALTER TABLE service_gallery
      ADD COLUMN caption TEXT;
    `;
    
    await db.execute(sql.raw(alterTableQuery));
    
    console.log("Migration completed successfully: Added caption column to service_gallery table");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run the migration
addCaptionToServiceGallery()
  .then(() => {
    console.log("Caption column migration completed");
    process.exit(0);
  })
  .catch(err => {
    console.error("Caption column migration failed:", err);
    process.exit(1);
  });