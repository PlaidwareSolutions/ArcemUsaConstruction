import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addIsFeatureToProjectGallery() {
  console.log("Adding isFeature column to project_gallery table...");

  try {
    // Add the isFeature column with default value false
    await db.execute(sql`
      ALTER TABLE project_gallery 
      ADD COLUMN IF NOT EXISTS is_feature BOOLEAN DEFAULT FALSE;
    `);

    console.log("Column added successfully!");
  } catch (error) {
    console.error("Error adding column:", error);
  }
}

// Run the migration
addIsFeatureToProjectGallery()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });