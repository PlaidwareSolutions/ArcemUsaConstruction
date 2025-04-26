import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Migration script to create site_settings table
 */
async function createSiteSettingsTable() {
  try {
    console.log("Creating site_settings table...");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) NOT NULL UNIQUE,
        value TEXT,
        category VARCHAR(255),
        label VARCHAR(255),
        description TEXT,
        type VARCHAR(50) DEFAULT 'text',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("site_settings table created successfully.");

    // Add default social media settings
    console.log("Adding default social media settings...");

    const defaultSettings = [
      {
        key: "social_facebook",
        value: "https://facebook.com/arcemusa",
        category: "social_media",
        label: "Facebook URL",
        description: "Facebook page URL for the footer",
        type: "url",
      },
      {
        key: "social_twitter",
        value: "https://twitter.com/arcemusa",
        category: "social_media",
        label: "Twitter URL",
        description: "Twitter profile URL for the footer",
        type: "url",
      },
      {
        key: "social_instagram",
        value: "https://instagram.com/arcemusa",
        category: "social_media",
        label: "Instagram URL",
        description: "Instagram profile URL for the footer",
        type: "url",
      },
      {
        key: "social_linkedin",
        value: "https://linkedin.com/company/arcemusa",
        category: "social_media",
        label: "LinkedIn URL",
        description: "LinkedIn company page URL for the footer",
        type: "url",
      },
      {
        key: "social_youtube",
        value: "",
        category: "social_media",
        label: "YouTube URL",
        description: "YouTube channel URL for the footer",
        type: "url",
      },
    ];

    for (const setting of defaultSettings) {
      await db.execute(sql`
        INSERT INTO site_settings (key, value, category, label, description, type)
        VALUES (${setting.key}, ${setting.value}, ${setting.category}, ${setting.label}, ${setting.description}, ${setting.type})
        ON CONFLICT (key) DO UPDATE
        SET value = ${setting.value},
            category = ${setting.category},
            label = ${setting.label},
            description = ${setting.description},
            type = ${setting.type},
            updated_at = CURRENT_TIMESTAMP;
      `);
    }

    console.log("Default site settings added successfully.");
  } catch (error) {
    console.error("Error creating site_settings table:", error);
    throw error;
  }
}

// Run the migration
createSiteSettingsTable()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
