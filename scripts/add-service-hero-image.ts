import { db } from "../server/db";
import { serviceGallery, services } from "../shared/schema";
import { sql } from "drizzle-orm";

async function addServiceHeroImage() {
  try {
    console.log("Adding service hero image to all services...");
    
    // Get all services
    const allServices = await db.select().from(services);
    
    // For each service, add the hero image to the gallery
    for (const service of allServices) {
      // Check if the service already has this image
      const existingImage = await db.select()
        .from(serviceGallery)
        .where(sql`${serviceGallery.serviceId} = ${service.id} AND ${serviceGallery.imageUrl} = ${"/uploads/services/services.jpg"}`);
      
      if (existingImage.length === 0) {
        // Add the hero image to this service's gallery
        await db.insert(serviceGallery).values({
          serviceId: service.id,
          imageUrl: "/uploads/services/services.jpg",
          alt: `${service.title} services by ARCEMUSA`,
          order: 0
        });
        console.log(`Added hero image to service: ${service.title}`);
      } else {
        console.log(`Service ${service.title} already has the hero image.`);
      }
    }
    
    console.log("Service hero images added successfully!");
  } catch (error) {
    console.error("Error adding service hero images:", error);
  } finally {
    process.exit(0);
  }
}

// Run the function
addServiceHeroImage();