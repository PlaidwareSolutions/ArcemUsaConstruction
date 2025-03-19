import { db } from "../server/db.js";
import { vendors, subcontractors } from "../shared/schema.js";
import { sql } from "drizzle-orm";

async function createTables() {
  console.log("Creating subcontractors and vendors tables...");
  
  try {
    // Check if vendors table exists
    const vendorsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'vendors'
      );
    `);
    
    // Check if subcontractors table exists
    const subcontractorsExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'subcontractors'
      );
    `);
    
    console.log("Vendors table exists:", vendorsExists[0].exists);
    console.log("Subcontractors table exists:", subcontractorsExists[0].exists);
    
    // Create vendors table if it doesn't exist
    if (!vendorsExists[0].exists) {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "vendors" (
          "id" SERIAL PRIMARY KEY,
          "company_name" TEXT NOT NULL,
          "contact_name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "phone" TEXT NOT NULL,
          "address" TEXT NOT NULL,
          "city" TEXT NOT NULL,
          "state" TEXT NOT NULL,
          "zip" TEXT NOT NULL,
          "website" TEXT,
          "supply_types" TEXT[] NOT NULL,
          "service_description" TEXT NOT NULL,
          "years_in_business" TEXT NOT NULL,
          "references" TEXT,
          "how_did_you_hear" TEXT,
          "status" TEXT DEFAULT 'pending',
          "notes" TEXT,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("Vendors table created successfully!");
    }
    
    // Create subcontractors table if it doesn't exist
    if (!subcontractorsExists[0].exists) {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "subcontractors" (
          "id" SERIAL PRIMARY KEY,
          "company_name" TEXT NOT NULL,
          "contact_name" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "phone" TEXT NOT NULL,
          "address" TEXT NOT NULL,
          "city" TEXT NOT NULL,
          "state" TEXT NOT NULL,
          "zip" TEXT NOT NULL,
          "website" TEXT,
          "service_types" TEXT[] NOT NULL,
          "service_description" TEXT NOT NULL,
          "years_in_business" TEXT NOT NULL,
          "insurance" BOOLEAN DEFAULT false,
          "bondable" BOOLEAN DEFAULT false,
          "licenses" TEXT,
          "references" TEXT,
          "how_did_you_hear" TEXT,
          "status" TEXT DEFAULT 'pending',
          "notes" TEXT,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("Subcontractors table created successfully!");
    }
    
    console.log("Table creation completed!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    process.exit(0);
  }
}

createTables();