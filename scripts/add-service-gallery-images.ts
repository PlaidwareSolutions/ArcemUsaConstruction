import { db } from "../server/db";
import { serviceGallery } from "../shared/schema";

async function addServiceGalleryImages() {
  try {
    console.log("Adding sample service gallery images...");
    
    // Service 1: Commercial Construction
    await db.insert(serviceGallery).values([
      {
        serviceId: 1,
        imageUrl: "/images/commercial1.jpg",
        alt: "Modern office building with glass façade",
        order: 1
      },
      {
        serviceId: 1,
        imageUrl: "/images/commercial2.jpg",
        alt: "Commercial retail space under construction",
        order: 2
      },
      {
        serviceId: 1,
        imageUrl: "/images/commercial3.jpg",
        alt: "Completed industrial warehouse facility",
        order: 3
      }
    ]);

    // Service 2: Residential Construction
    await db.insert(serviceGallery).values([
      {
        serviceId: 2,
        imageUrl: "/images/residential1.jpg",
        alt: "Custom luxury home exterior",
        order: 1
      },
      {
        serviceId: 2,
        imageUrl: "/images/residential2.jpg",
        alt: "Modern kitchen renovation",
        order: 2
      },
      {
        serviceId: 2,
        imageUrl: "/images/residential3.jpg",
        alt: "Backyard landscaping with pool",
        order: 3
      }
    ]);

    // Service 3: Renovation & Remodeling
    await db.insert(serviceGallery).values([
      {
        serviceId: 3,
        imageUrl: "/images/renovation1.jpg",
        alt: "Before and after kitchen renovation",
        order: 1
      },
      {
        serviceId: 3,
        imageUrl: "/images/renovation2.jpg",
        alt: "Bathroom remodeling project",
        order: 2
      },
      {
        serviceId: 3,
        imageUrl: "/images/renovation3.jpg",
        alt: "Commercial space renovation",
        order: 3
      }
    ]);

    // Use attached slider images for services 4, 5 and 6
    // Service 4: Architectural Design
    await db.insert(serviceGallery).values([
      {
        serviceId: 4,
        imageUrl: "/attached_assets/slider1.png",
        alt: "Architectural blueprint and 3D rendering",
        order: 1
      },
      {
        serviceId: 4,
        imageUrl: "/attached_assets/slider2.png",
        alt: "Architectural model of modern building",
        order: 2
      }
    ]);

    // Service 5: Project Management
    await db.insert(serviceGallery).values([
      {
        serviceId: 5,
        imageUrl: "/attached_assets/slider3.png",
        alt: "Construction project manager reviewing plans",
        order: 1
      },
      {
        serviceId: 5,
        imageUrl: "/attached_assets/slider4.png",
        alt: "Project timeline and scheduling dashboard",
        order: 2
      }
    ]);

    // Service 6: Construction Consultation
    await db.insert(serviceGallery).values([
      {
        serviceId: 6,
        imageUrl: "/attached_assets/slider5.png",
        alt: "Construction consultation meeting",
        order: 1
      },
      {
        serviceId: 6,
        imageUrl: "/attached_assets/image_1741432012642.png",
        alt: "Construction expert reviewing site plans",
        order: 2
      }
    ]);
    
    console.log("Sample service gallery images added successfully!");
  } catch (error) {
    console.error("Error adding service gallery images:", error);
  } finally {
    process.exit(0);
  }
}

addServiceGalleryImages();