import { db } from "../server/db";
import { serviceGallery, services } from "../shared/schema";
import { sql } from "drizzle-orm";

async function addServiceGalleryImages() {
  try {
    console.log("Adding service gallery images to all services...");
    
    // Get all services
    const allServices = await db.select().from(services);
    
    // For each service, add multiple images to the gallery
    for (const service of allServices) {
      console.log(`Processing service: ${service.title}`);
      
      // Add construction-projects.jpg to this service's gallery
      const existingProjectImage = await db.select()
        .from(serviceGallery)
        .where(sql`${serviceGallery.serviceId} = ${service.id} AND ${serviceGallery.imageUrl} = ${"/uploads/services/construction-projects.jpg"}`);
      
      if (existingProjectImage.length === 0) {
        await db.insert(serviceGallery).values({
          serviceId: service.id,
          imageUrl: "/uploads/services/construction-projects.jpg",
          alt: `${service.title} construction projects by ARCEMUSA`,
          order: 1
        });
        console.log(`Added construction-projects.jpg to service: ${service.title}`);
      } else {
        console.log(`Service ${service.title} already has construction-projects.jpg`);
      }
      
      // Add our-passion-led-us-here.jpg to this service's gallery
      const existingPassionImage = await db.select()
        .from(serviceGallery)
        .where(sql`${serviceGallery.serviceId} = ${service.id} AND ${serviceGallery.imageUrl} = ${"/uploads/services/our-passion-led-us-here.jpg"}`);
      
      if (existingPassionImage.length === 0) {
        await db.insert(serviceGallery).values({
          serviceId: service.id,
          imageUrl: "/uploads/services/our-passion-led-us-here.jpg",
          alt: `${service.title} passion-driven services by ARCEMUSA`,
          order: 2
        });
        console.log(`Added our-passion-led-us-here.jpg to service: ${service.title}`);
      } else {
        console.log(`Service ${service.title} already has our-passion-led-us-here.jpg`);
      }
    }
    
    console.log("Service gallery images added successfully!");
  } catch (error) {
    console.error("Error adding service gallery images:", error);
  } finally {
    process.exit(0);
  }
}

// Run the function
addServiceGalleryImages();