import { createUploadthing, type FileRouter } from "uploadthing/server";
import { UploadThingError } from "uploadthing/server";
// Import the Express-specific route handler for proper Express integration
import { createRouteHandler } from "uploadthing/express";
import type { Request, Response, Router } from "express";

// Check UploadThing environment variables
if (!process.env.UPLOADTHING_SECRET || !process.env.UPLOADTHING_APP_ID) {
  console.error("⚠️ UploadThing environment variables are missing!");
  console.error("Make sure UPLOADTHING_SECRET and UPLOADTHING_APP_ID are set in your environment");
} else {
  console.log("UploadThing config loaded for app ID:", process.env.UPLOADTHING_APP_ID.slice(0, 6) + "...");
}

// Create the uploadthing instance
const f = createUploadthing();

interface Session {
  userId?: number;
  role?: 'admin' | 'user';
}

// Define authentication function to handle permissions
const isAuthenticated = (req: Request) => {
  if (!req.session || !req.isAuthenticated()) {
    throw new UploadThingError("Unauthorized");
  }
  
  return {
    userId: req.user?.id,
    role: req.user?.role || 'user'
  } as Session;
};

// Define the file router with authentication and validation
export const uploadRouter = {
  // Define a route for image upload
  imageUploader: f({ image: { maxFileSize: "16MB", maxFileCount: 10 } })
    // Set permissions and get metadata to identify the user
    .middleware(({ req }) => {
      try {
        // This code runs on your server before upload
        // Type assertion to solve type mismatch between Express.Request types
        const session = isAuthenticated(req as any);
        
        console.log("📤 Upload middleware executed for user:", session.userId);
        return { userId: session.userId };
      } catch (error) {
        console.error("❌ Upload authorization error:", error);
        throw new UploadThingError("Unauthorized");
      }
    })
    // Define upload completion handler
    .onUploadComplete(({ metadata, file }) => {
      // This code runs on your server after upload
      console.log(`✅ Upload complete from user ${metadata?.userId || 'unknown'}`);
      
      // Log file details for debugging
      console.log("📁 File details:", {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        key: file.key,
        url: file.url?.substring(0, 50) + "...",
        ufsUrl: file.ufsUrl ? (file.ufsUrl.substring(0, 50) + "...") : 'Not available'
      });
      
      return { 
        url: file.url, // Keep for backwards compatibility
        ufsUrl: file.ufsUrl || file.url, // Prefer the new URL property
        key: file.key,
        name: file.name,
        size: file.size
      };
    }),
    
  // Define a route for document uploads (images and PDFs) for quote requests
  quoteDocumentUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 3 },
    pdf: { maxFileSize: "8MB", maxFileCount: 3 }
  })
    .middleware(({ req }) => {
      try {
        const session = isAuthenticated(req as any);
        console.log("📤 Quote document upload middleware executed for user:", session.userId);
        return { userId: session.userId };
      } catch (error) {
        console.error("❌ Quote document upload authorization error:", error);
        throw new UploadThingError("Unauthorized");
      }
    })
    .onUploadComplete(({ metadata, file }) => {
      console.log(`✅ Quote document upload complete from user ${metadata?.userId || 'unknown'}`);
      
      console.log("📁 Quote document file details:", {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        key: file.key,
        type: file.name.split('.').pop(),
        url: file.url?.substring(0, 50) + "...",
        ufsUrl: file.ufsUrl ? (file.ufsUrl.substring(0, 50) + "...") : 'Not available'
      });
      
      return { 
        url: file.url,
        ufsUrl: file.ufsUrl || file.url,
        key: file.key,
        name: file.name,
        size: file.size
      };
    }),
};

// Custom error handler for diagnostic purposes
const logErrorsHandler = (err: Error) => {
  console.error("⚠️ UploadThing error:", err.message);
  if (err.stack) {
    console.error(err.stack.split("\n").slice(0, 3).join("\n"));
  }
};

// Export route handlers for Express integration
export function createUploadthingExpressHandler(router: FileRouter) {
  // Create the route handler which returns an Express Router
  const uploadRouter = createRouteHandler({ router });
  
  // Add a healthcheck endpoint to the router for debugging
  const originalRouter = uploadRouter;
  originalRouter.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'UploadThing API is ready',
      configured: !!(process.env.UPLOADTHING_APP_ID && process.env.UPLOADTHING_SECRET)
    });
  });
  
  // This function returns the Express router with preconfigured routes
  return originalRouter;
}

// Export the fileRouter type for the frontend
export type OurFileRouter = typeof uploadRouter;