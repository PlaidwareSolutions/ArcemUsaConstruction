import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createUploadthing } from "uploadthing/server";
import { uploadRouter, createUploadthingExpressHandler } from "./uploadthing";
import { setupAuth } from "./auth";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedAdminUser() {
  try {
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
    if (!adminPassword) {
      log("ADMIN_INITIAL_PASSWORD not set, skipping admin seeding");
      return;
    }

    const hashedPassword = await hashPassword(adminPassword);
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (!existingAdmin) {
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
        role: "admin",
        email: "admin@arcemusa.com"
      });
      log("Admin user created successfully");
    } else {
      await storage.updateUser(existingAdmin.id, {
        password: hashedPassword
      });
      log("Admin user password updated successfully");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
}

// Set UploadThing environment variables
if (!process.env.UPLOADTHING_SECRET || !process.env.UPLOADTHING_APP_ID) {
  console.warn("Warning: UploadThing environment variables are not set properly.");
  console.warn("Make sure UPLOADTHING_SECRET and UPLOADTHING_APP_ID are available in the environment.");
} else {
  console.log("UploadThing credentials detected:", {
    appId: process.env.UPLOADTHING_APP_ID.substring(0, 4) + "..." // Only log a small part for security
  });
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Parse cookies for easier access

// First, set up authentication to ensure session is available
setupAuth(app);

// Then initialize the UploadThing route handler - this returns an Express router
// with all the necessary routes preconfigured
const uploadthingRouter = createUploadthingExpressHandler(uploadRouter);

// Mount the UploadThing router at the /api/uploadthing path
// This automatically adds all the required routes (POST, etc.)
app.use("/api/uploadthing", uploadthingRouter);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await seedAdminUser();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
