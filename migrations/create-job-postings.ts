import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createJobPostingsTable() {
  try {
    console.log("Creating job_postings table...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS job_postings (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        department TEXT NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        responsibilities TEXT NOT NULL,
        requirements TEXT NOT NULL,
        benefits TEXT,
        salary TEXT,
        apply_url TEXT,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      )
    `);
    
    console.log("✅ job_postings table created successfully");
  } catch (error) {
    console.error("❌ Error creating job_postings table:", error);
    throw error;
  }
}

// Run the migration
createJobPostingsTable()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });