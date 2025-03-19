import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createServiceGalleryTable() {
  try {
    console.log("Creating service_gallery table...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS service_gallery (
        id SERIAL PRIMARY KEY,
        service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        alt TEXT,
        "order" INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log("service_gallery table created successfully!");
  } catch (error) {
    console.error("Error creating service_gallery table:", error);
  } finally {
    process.exit(0);
  }
}

createServiceGalleryTable();