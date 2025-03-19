import { db } from "../server/db";
import { serviceGallery } from "../shared/schema";
import { eq } from "drizzle-orm";

async function updateServiceGallery() {
  try {
    console.log("Updating service gallery with correct image paths...");
    
    // First delete existing entries for these services to avoid duplicates
    await db.delete(serviceGallery)
      .where(eq(serviceGallery.serviceId, 4)); // Architectural Design
      
    await db.delete(serviceGallery)
      .where(eq(serviceGallery.serviceId, 5)); // Project Management
      
    await db.delete(serviceGallery)
      .where(eq(serviceGallery.serviceId, 6)); // Construction Consultation

    // Add updated entries with correct image paths
    
    // Service 4: Architectural Design
    await db.insert(serviceGallery).values([
      {
        serviceId: 4,
        imageUrl: "/images/slider1.png",
        alt: "Architectural blueprint and 3D rendering",
        order: 1
      },
      {
        serviceId: 4,
        imageUrl: "/images/slider2.png",
        alt: "Architectural model of modern building",
        order: 2
      },
      {
        serviceId: 4,
        imageUrl: "/images/image_1741509665889.png", // New image
        alt: "Advanced architectural concept design",
        order: 3
      }
    ]);

    // Service 5: Project Management
    await db.insert(serviceGallery).values([
      {
        serviceId: 5,
        imageUrl: "/images/slider3.png",
        alt: "Construction project manager reviewing plans",
        order: 1
      },
      {
        serviceId: 5,
        imageUrl: "/images/slider4.png",
        alt: "Project timeline and scheduling dashboard",
        order: 2
      },
      {
        serviceId: 5,
        imageUrl: "/images/image_1741509691873.png", // New image
        alt: "Construction project team coordination",
        order: 3
      }
    ]);

    // Service 6: Construction Consultation
    await db.insert(serviceGallery).values([
      {
        serviceId: 6,
        imageUrl: "/images/slider5.png",
        alt: "Construction consultant meeting with clients",
        order: 1
      },
      {
        serviceId: 6,
        imageUrl: "/images/image_1741432012642.png",
        alt: "Construction site consultation and review",
        order: 2
      }
    ]);

    console.log("Service gallery updated successfully!");
  } catch (error) {
    console.error("Error updating service gallery:", error);
  } finally {
    process.exit(0);
  }
}

updateServiceGallery();