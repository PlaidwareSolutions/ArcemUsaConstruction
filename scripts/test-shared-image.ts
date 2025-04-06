import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "../server/db";
import * as schema from "../shared/schema";
import { eq, ne, and } from "drizzle-orm";
import { FileManager } from "../server/utils/fileManager";
import { DBStorage } from "../server/dbStorage";

async function testSharedImage() {
  try {
    // 1. Hook into FileManager.deleteFile to track which files would be deleted
    const originalDeleteFile = FileManager.deleteFile;
    const deletedFiles: string[] = [];
    FileManager.deleteFile = async (fileUrl: string | null): Promise<boolean> => {
      if (fileUrl) {
        console.log(`Would delete file: ${fileUrl}`);
        deletedFiles.push(fileUrl);
      }
      return true;
    };

    // Use real database client for test
    const db = drizzle(pool, { schema });
    
    console.log("Testing image preservation logic...");

    // 2. Create two test projects
    const project1 = await db.insert(schema.projects).values({
      title: "Test Project 1",
      description: "A test project for image preservation",
      location: "Test Location",
      category: "Test",
      image: null,
      featured: false,
      startDate: new Date(),
      completionDate: new Date(),
      client: "Test Client",
      architect: "Test Architect",
      value: 100000,
      size: 1000,
      scope: "Test Scope",
      createdAt: new Date()
    }).returning().then(results => results[0]);
    
    console.log(`Created test project 1: ${project1.id}`);
    
    const project2 = await db.insert(schema.projects).values({
      title: "Test Project 2",
      description: "Another test project for image preservation",
      location: "Test Location 2",
      category: "Test",
      image: null,
      featured: false,
      startDate: new Date(),
      completionDate: new Date(),
      client: "Test Client 2",
      architect: "Test Architect 2",
      value: 200000,
      size: 2000,
      scope: "Test Scope 2",
      createdAt: new Date()
    }).returning().then(results => results[0]);
    
    console.log(`Created test project 2: ${project2.id}`);

    // 3. Define test image URLs
    const sharedImageUrl = "https://example.com/shared-test-image.jpg";
    
    // 4. Add shared image to both projects (using the same URL)
    const project1Gallery1 = await db.insert(schema.projectGallery).values({
      projectId: project1.id,
      imageUrl: sharedImageUrl,
      alt: "Shared Test Image",
      displayOrder: 0
    }).returning().then(results => results[0]);
    
    console.log(`Added shared image to project 1: ${project1Gallery1.id}`);
    
    const project2Gallery1 = await db.insert(schema.projectGallery).values({
      projectId: project2.id,
      imageUrl: sharedImageUrl,
      alt: "Shared Test Image",
      displayOrder: 0
    }).returning().then(results => results[0]);
    
    console.log(`Added shared image to project 2: ${project2Gallery1.id}`);
    
    // 5. Use storage class for operations
    const storage = new DBStorage();

    // 6. First, delete gallery for project 2
    console.log("\nTEST 1: Delete all galleries from project 2");
    await storage.deleteAllProjectGalleryImages(project2.id);
    
    // 7. Then, delete the image from project 1
    console.log("\nTEST 2: Delete shared image from project 1");
    await storage.deleteProjectGalleryImage(project1Gallery1.id);

    // 8. Check what files would have been deleted
    console.log("\nFILES THAT WOULD BE DELETED:");
    deletedFiles.forEach(file => console.log(`- ${file}`));

    // 9. Verify that shared image was preserved
    const sharedImagePreserved = !deletedFiles.includes(sharedImageUrl);
    console.log(`\nSHARED IMAGE PRESERVED: ${sharedImagePreserved ? '✅ YES' : '❌ NO'}`);

    // 10. Clean up test data
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

    // 11. Restore original deleteFile function
    FileManager.deleteFile = originalDeleteFile;

    console.log("\nTest completed and data cleaned up.");
  } catch (error) {
    console.error("Error during test:", error);
  }
}

// Run the test
testSharedImage().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});