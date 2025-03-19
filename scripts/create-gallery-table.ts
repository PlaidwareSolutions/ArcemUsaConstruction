import { db } from "../server/db.js";
import { sql } from "drizzle-orm";

async function createProjectGalleryTable() {
  try {
    console.log("Creating project_gallery table...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS project_gallery (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        caption TEXT,
        display_order INTEGER DEFAULT 0
      );
    `);
    
    console.log("project_gallery table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating project_gallery table:", error);
    process.exit(1);
  }
}

createProjectGalleryTable();