import { db } from "../server/db";
import * as schema from "../shared/schema";
import { InsertProjectGallery, InsertProject } from "../shared/schema";
import { eq } from "drizzle-orm";
import { FileManager } from "../server/utils/fileManager";

async function testImagePreservation() {
  console.log("Testing image preservation logic...");

  try {
    // 1. Create a dummy project
    const dummyImageUrl = "https://placekitten.com/800/600";
    const projectData1: InsertProject = {
      title: "Test Project 1",
      description: "Test description",
      category: "Commercial",
      image: dummyImageUrl, // Image is required
      featured: false
    };
    
    const [project1] = await db.insert(schema.projects)
      .values(projectData1)
      .returning();
    
    console.log(`Created test project 1: ${project1.id}`);

    // 2. Create a dummy project 2
    const projectData2: InsertProject = {
      title: "Test Project 2",
      description: "Test description 2",
      category: "Residential",
      image: dummyImageUrl, // Image is required
      featured: false
    };
    
    const [project2] = await db.insert(schema.projects)
      .values(projectData2)
      .returning();
    
    console.log(`Created test project 2: ${project2.id}`);

    // 3. Add the same image URL to both projects' galleries
    const sharedImageUrl = "https://example.com/shared-test-image.jpg";
    const uniqueImageUrl = "https://example.com/unique-test-image.jpg";
    
    // 4. Add shared image to project 1
    const galleryData1: InsertProjectGallery = {
      projectId: project1.id,
      imageUrl: sharedImageUrl,
      caption: "Shared test image",
      displayOrder: 1,
      isFeature: false
    };
    
    const [project1Gallery1] = await db.insert(schema.projectGallery)
      .values(galleryData1)
      .returning();
    
    console.log(`Added shared image to project 1: ${project1Gallery1.id}`);

    // 5. Add shared image to project 2
    const galleryData2: InsertProjectGallery = {
      projectId: project2.id,
      imageUrl: sharedImageUrl,
      caption: "Shared test image",
      displayOrder: 1,
      isFeature: false
    };
    
    const [project2Gallery1] = await db.insert(schema.projectGallery)
      .values(galleryData2)
      .returning();
    
    console.log(`Added shared image to project 2: ${project2Gallery1.id}`);

    // 6. Add unique image to project 1
    const galleryData3: InsertProjectGallery = {
      projectId: project1.id,
      imageUrl: uniqueImageUrl,
      caption: "Unique test image",
      displayOrder: 2,
      isFeature: false
    };
    
    const [project1Gallery2] = await db.insert(schema.projectGallery)
      .values(galleryData3)
      .returning();
    
    console.log(`Added unique image to project 1: ${project1Gallery2.id}`);

    // 7. Temporarily override the deleteFile function to log instead of actually delete
    const originalDeleteFile = FileManager.deleteFile;
    const deletedFiles: string[] = [];
    FileManager.deleteFile = async (url: string | null): Promise<boolean> => {
      if (url) {
        console.log(`Would delete file: ${url}`);
        deletedFiles.push(url);
      }
      return true;
    };

    // 8. Use our storage methods for all operations to test the logic
    const storage = new DBStorage();

    // First test: delete directly one of the shared images, it should preserve the file
    console.log("\nTEST 1: Delete shared image from project 1 (should preserve the file)");
    await storage.deleteProjectGalleryImage(project1Gallery1.id);
    
    // Recreate the deleted gallery image for project 1
    console.log("\nRecreating shared image for project 1");
    project1Gallery1 = await db.insert(schema.projectGallery).values({
      projectId: project1.id,
      imageUrl: sharedImageUrl,
      alt: "Shared Test Image",
      displayOrder: 0
    }).returning().then(results => results[0]);
    
    // Now test in a different order: delete unique image from project 1 first
    console.log("\nTEST 2: Delete unique image from project 1");
    await storage.deleteProjectGalleryImage(project1Gallery2.id);
    
    // Next delete all galleries from project 2
    console.log("\nTEST 3: Delete all galleries from project 2");
    await storage.deleteAllProjectGalleryImages(project2.id);
    
    // Finally, delete shared image from project 1 again, it should NOT delete the file
    console.log("\nTEST 4: Delete shared image from project 1 again (after project 2's gallery is gone)");
    await storage.deleteProjectGalleryImage(project1Gallery1.id);

    // 12. Check what files would have been deleted
    console.log("\nFILES THAT WOULD BE DELETED:");
    deletedFiles.forEach(file => console.log(`- ${file}`));

    // 13. Verify that shared image is not in the deleted files list
    const sharedImagePreserved = !deletedFiles.includes(sharedImageUrl);
    console.log(`\nSHARED IMAGE PRESERVED: ${sharedImagePreserved ? '✅ YES' : '❌ NO'}`);
    console.log(`UNIQUE IMAGE DELETED: ${deletedFiles.includes(uniqueImageUrl) ? '✅ YES' : '❌ NO'}`);

    // 14. Clean up test data
    await db.delete(schema.projectGallery)
      .where(eq(schema.projectGallery.projectId, project1.id))
      .execute();
    
    await db.delete(schema.projectGallery)
      .where(eq(schema.projectGallery.projectId, project2.id))
      .execute();
    
    await db.delete(schema.projects)
      .where(eq(schema.projects.id, project1.id))
      .execute();
    
    await db.delete(schema.projects)
      .where(eq(schema.projects.id, project2.id))
      .execute();

    // 15. Restore original deleteFile function
    FileManager.deleteFile = originalDeleteFile;

    console.log("\nTest completed and data cleaned up.");
  } catch (error) {
    console.error("Error during test:", error);
  }
}

// Import the DBStorage class
import { DBStorage } from "../server/dbStorage";

// Run the test
testImagePreservation().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});