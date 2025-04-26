
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function createSiteSettingsAndIndexes() {
  try {
    console.log("Creating site_settings table and indexes...");

    // Create table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) NOT NULL UNIQUE,
        value TEXT,
        category VARCHAR(255) DEFAULT 'general',
        label VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'text',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
    `);

    // Insert social media settings
    await db.execute(sql`
      INSERT INTO site_settings (key, value, category, label, description, type)
      VALUES 
        ('social_facebook', 'https://facebook.com/arcemusa', 'social_media', 'Facebook URL', 'Facebook page URL for the footer', 'url'),
        ('social_twitter', 'https://twitter.com/arcemusa', 'social_media', 'Twitter URL', 'Twitter profile URL for the footer', 'url'),
        ('social_instagram', 'https://instagram.com/arcemusa', 'social_media', 'Instagram URL', 'Instagram profile URL for the footer', 'url'),
        ('social_linkedin', 'https://linkedin.com/company/arcemusa', 'social_media', 'LinkedIn URL', 'LinkedIn company page URL for the footer', 'url'),
        ('social_youtube', '', 'social_media', 'YouTube URL', 'YouTube channel URL for the footer', 'url')
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        category = EXCLUDED.category,
        label = EXCLUDED.label,
        description = EXCLUDED.description,
        type = EXCLUDED.type,
        updated_at = CURRENT_TIMESTAMP;
    `);

    console.log("Site settings table and indexes created successfully.");
  } catch (error) {
    console.error("Error creating site settings:", error);
    throw error;
  }
}

// Run the migration
createSiteSettingsAndIndexes()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
