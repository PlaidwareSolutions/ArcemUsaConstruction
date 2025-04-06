import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { serviceGallery } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function updateServiceGalleryCaptions() {
  try {
    console.log("Starting to update service gallery captions");

    // First, get all service gallery entries that have null captions
    const serviceGalleryEntries = await db.select().from(serviceGallery);
    
    console.log(`Found ${serviceGalleryEntries.length} service gallery entries`);
    
    let updatedCount = 0;
    
    // Update each entry with a null caption to have an empty string caption
    for (const entry of serviceGalleryEntries) {
      if (entry.caption === null) {
        await db.update(serviceGallery)
          .set({ caption: '' })
          .where(eq(serviceGallery.id, entry.id));
        
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} service gallery entries with empty captions`);
    
  } catch (error) {
    console.error("Error updating service gallery captions:", error);
    throw error;
  }
}

// Run the update
updateServiceGalleryCaptions()
  .then(() => {
    console.log("Service gallery caption update completed");
    process.exit(0);
  })
  .catch(err => {
    console.error("Service gallery caption update failed:", err);
    process.exit(1);
  });