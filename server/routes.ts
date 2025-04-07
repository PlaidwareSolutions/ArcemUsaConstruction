import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { FileManager, extractUploadThingKeyFromUrl } from "./utils/fileManager";
import { 
  insertProjectSchema,
  insertProjectGallerySchema,
  extendedInsertProjectSchema,
  insertBlogCategorySchema,
  insertBlogTagSchema,
  insertBlogPostSchema,
  insertBlogGallerySchema,
  extendedInsertBlogPostSchema,
  insertMessageSchema,
  insertTestimonialSchema,
  publicTestimonialSchema,
  insertNewsletterSubscriberSchema,
  insertQuoteRequestSchema,
  insertServiceSchema,
  newsletterSubscribers,
  insertServiceGallerySchema,
  insertSubcontractorSchema,
  insertVendorSchema,
  blogPosts,
  fileAttachmentSchema,
  quoteRequestWithAttachmentsSchema
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { setupAuth } from "./auth";
import { upload, getFileUrl } from "./utils/fileUpload";
import path from "path";
import { uploadThingService } from "./services/uploadthingService";

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Admin role middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden: Admin access required' });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication is already set up in server/index.ts
  // API routes prefix
  const apiRouter = "/api";
  
  // Blog categories
  app.get(`${apiRouter}/blog/categories`, async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      res.status(500).json({ message: "Failed to fetch blog categories" });
    }
  });
  
  app.post(`${apiRouter}/blog/categories`, isAdmin, async (req: Request, res: Response) => {
    try {
      const categoryData = insertBlogCategorySchema.parse(req.body);
      const category = await storage.createBlogCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error creating blog category:", error);
      res.status(500).json({ message: "Failed to create blog category" });
    }
  });
  
  // Blog tags
  app.get(`${apiRouter}/blog/tags`, async (_req: Request, res: Response) => {
    try {
      const tags = await storage.getBlogTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching blog tags:", error);
      res.status(500).json({ message: "Failed to fetch blog tags" });
    }
  });
  
  app.post(`${apiRouter}/blog/tags`, isAdmin, async (req: Request, res: Response) => {
    try {
      const tagData = insertBlogTagSchema.parse(req.body);
      const tag = await storage.createBlogTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tag data", errors: error.errors });
      }
      console.error("Error creating blog tag:", error);
      res.status(500).json({ message: "Failed to create blog tag" });
    }
  });
  
  // Projects Routes
  app.get(`${apiRouter}/projects`, async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  
  app.get(`${apiRouter}/projects/featured`, async (req: Request, res: Response) => {
    try {
      const projects = await storage.getFeaturedProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured projects" });
    }
  });
  
  app.get(`${apiRouter}/projects/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });
  
  // Admin-only endpoints for project management
  app.post(`${apiRouter}/projects`, isAdmin, async (req: Request, res: Response) => {
    try {
      // Parse using the extended schema that can include gallery images
      const projectData = extendedInsertProjectSchema.parse(req.body);
      
      // Extract gallery images from the request if they exist
      const galleryImages = projectData.galleryImages || [];
      
      // Remove galleryImages from project data before creating the project
      const { galleryImages: _, ...projectOnly } = projectData;
      
      // Create the project first
      const project = await storage.createProject(projectOnly);
      
      // If we have gallery images, add them to the project
      if (galleryImages.length > 0) {
        console.log(`Adding ${galleryImages.length} gallery images to new project ${project.id}`);
        
        for (let i = 0; i < galleryImages.length; i++) {
          const image = galleryImages[i];
          await storage.addProjectGalleryImage({
            projectId: project.id,
            imageUrl: image.imageUrl,
            caption: image.caption || '',
            displayOrder: image.displayOrder || i + 1,
            isFeature: image.isFeature || false,
          });
        }
        
        // If we have gallery images but no feature image is marked, set the first one as feature
        const hasFeatureImage = galleryImages.some(img => img.isFeature);
        if (!hasFeatureImage && galleryImages.length > 0) {
          const firstGalleryImage = await storage.getProjectGallery(project.id);
          if (firstGalleryImage.length > 0) {
            await storage.setProjectFeatureImage(project.id, firstGalleryImage[0].id);
          }
        }
      }
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error('Error creating project:', error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  
  app.put(`${apiRouter}/projects/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Extract gallery images from the request body
      const { galleryImages, ...projectData } = req.body;
      
      // Parse only the project data with the schema
      const validatedProjectData = insertProjectSchema.partial().parse(projectData);
      const project = await storage.updateProject(id, validatedProjectData);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Process gallery images if provided
      if (galleryImages && Array.isArray(galleryImages)) {
        console.log(`[PROJECT UPDATE] Processing ${galleryImages.length} gallery images for project ${id}`);
        
        // Get existing gallery for comparison
        const existingGallery = await storage.getProjectGallery(id);
        console.log(`[PROJECT UPDATE] Existing gallery has ${existingGallery.length} images`);
        
        // Create a map of existing gallery images by URL for efficient lookups
        const existingImagesByUrl = new Map();
        existingGallery.forEach(img => {
          if (img.imageUrl) {
            existingImagesByUrl.set(img.imageUrl, img);
          }
        });
        
        // Filter out existing images based on ID ('existing-' prefix) and really new images by URL
        const updatedExistingImages = [];
        const trulyNewImages = [];
        
        // First pass - categorize images as existing or truly new
        for (let i = 0; i < galleryImages.length; i++) {
          const image = galleryImages[i];
          const displayOrder = i + 1; // Maintain ordering by position in array
          
          if (image.id && image.id.toString().startsWith('existing-')) {
            // This is an existing image with an existing-ID format
            const imageId = parseInt(image.id.toString().replace('existing-', ''));
            updatedExistingImages.push({
              id: imageId,
              caption: image.caption || '',
              displayOrder,
              isFeature: image.isFeature === true
            });
          } else if (image.imageUrl) {
            // Check if this image URL is already in the existing gallery
            const existingImage = existingImagesByUrl.get(image.imageUrl);
            
            if (existingImage) {
              // This is an existing image by URL, not ID
              console.log(`[PROJECT UPDATE] Found existing image by URL: ${image.imageUrl.substring(0, 30)}...`);
              updatedExistingImages.push({
                id: existingImage.id,
                caption: image.caption || '',
                displayOrder,
                isFeature: image.isFeature === true
              });
            } else {
              // This is truly a new image that needs to be created
              console.log(`[PROJECT UPDATE] Identified new image: ${image.imageUrl.substring(0, 30)}...`);
              trulyNewImages.push({
                imageUrl: image.imageUrl,
                caption: image.caption || '',
                displayOrder,
                isFeature: image.isFeature === true
              });
            }
          }
        }
        
        console.log(`[PROJECT UPDATE] Found ${updatedExistingImages.length} existing images to update and ${trulyNewImages.length} new images to add`);
        
        // Create a set of existing image IDs to keep
        const existingIdsToKeep = new Set(updatedExistingImages.map(img => img.id));
        
        // Find IDs to delete (images that are no longer included)
        const idsToDelete = existingGallery
          .filter(img => !existingIdsToKeep.has(img.id))
          .map(img => img.id);
        
        console.log(`[PROJECT UPDATE] Found ${idsToDelete.length} images to delete`);
        
        // Step 1: Delete removed images
        for (const idToDelete of idsToDelete) {
          console.log(`[PROJECT UPDATE] Deleting image ${idToDelete}`);
          await storage.deleteProjectGalleryImage(idToDelete);
        }
        
        // Step 2: Update existing images
        let hasFeatureImage = false;
        
        for (const image of updatedExistingImages) {
          const existingImage = existingGallery.find(img => img.id === image.id);
          
          if (existingImage) {
            // Check if any properties have actually changed
            const captionChanged = existingImage.caption !== image.caption;
            const orderChanged = existingImage.displayOrder !== image.displayOrder;
            const featureChanged = existingImage.isFeature !== image.isFeature;
            
            // Only update if something has changed
            if (captionChanged || orderChanged || featureChanged) {
              console.log(`[PROJECT UPDATE] Updating image ${image.id} - changes: caption=${captionChanged}, order=${orderChanged}, feature=${featureChanged}`);
              
              await storage.updateProjectGalleryImage(image.id, {
                caption: image.caption,
                displayOrder: image.displayOrder,
                isFeature: image.isFeature
              });
            } else {
              console.log(`[PROJECT UPDATE] No changes for image ${image.id}, skipping update`);
            }
            
            // Set as feature image if marked
            if (image.isFeature) {
              hasFeatureImage = true;
              
              if (!existingImage.isFeature) {
                console.log(`[PROJECT UPDATE] Setting image ${image.id} as feature image`);
                await storage.setProjectFeatureImage(id, image.id);
              }
            }
          }
        }
        
        // Step 3: Add new images
        for (const newImage of trulyNewImages) {
          console.log(`[PROJECT UPDATE] Adding new image: ${newImage.imageUrl.substring(0, 50)}...`);
          
          const addedImage = await storage.addProjectGalleryImage({
            projectId: id,
            imageUrl: newImage.imageUrl,
            caption: newImage.caption,
            displayOrder: newImage.displayOrder,
            isFeature: newImage.isFeature
          });
          
          if (newImage.isFeature) {
            hasFeatureImage = true;
            console.log(`[PROJECT UPDATE] Setting new image ${addedImage.id} as feature image`);
            await storage.setProjectFeatureImage(id, addedImage.id);
          }
        }
        
        // Make sure at least one image is marked as feature
        if (!hasFeatureImage && (updatedExistingImages.length > 0 || trulyNewImages.length > 0)) {
          const updatedGallery = await storage.getProjectGallery(id);
          
          if (updatedGallery.length > 0) {
            console.log(`[PROJECT UPDATE] No feature image set, using first image as feature`);
            await storage.setProjectFeatureImage(id, updatedGallery[0].id);
          }
        }
      }
      
      // Get the updated project data
      const updatedProject = await storage.getProject(id);
      res.json(updatedProject);
    } catch (error) {
      console.error('[PROJECT UPDATE ERROR] Error updating project:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });
  
  app.delete(`${apiRouter}/projects/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  
  // Project Gallery Routes
  app.get(`${apiRouter}/projects/:projectId/gallery`, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      console.log("[DEBUG] Fetching gallery for project ID:", projectId);
      
      try {
        const images = await storage.getProjectGallery(projectId);
        console.log("[DEBUG] Gallery images:", images);
        res.json(images);
      } catch (error) {
        console.error("[ERROR] Error in getProjectGallery:", error);
        throw error;
      }
    } catch (error) {
      console.error("[ERROR] Gallery fetch error:", error);
      res.status(500).json({ message: "Failed to fetch project gallery" });
    }
  });
  
  app.post(`${apiRouter}/projects/:projectId/gallery`, isAdmin, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const galleryData = insertProjectGallerySchema.parse({
        ...req.body,
        projectId
      });
      
      console.log(`[DEBUG] Adding gallery image to project ${projectId}:`, {
        imageUrl: galleryData.imageUrl ? `${galleryData.imageUrl.substring(0, 30)}...` : 'null',
        caption: galleryData.caption,
        displayOrder: galleryData.displayOrder
      });
      
      try {
        const image = await storage.addProjectGalleryImage(galleryData);
        console.log(`[DEBUG] Successfully added gallery image:`, image);
        res.status(201).json(image);
      } catch (error) {
        console.error(`[ERROR] Failed to add gallery image:`, error);
        throw error;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid gallery image data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add gallery image" });
    }
  });
  
  app.put(`${apiRouter}/projects/gallery/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gallery image ID" });
      }
      
      const imageUpdate = req.body;
      const updatedImage = await storage.updateProjectGalleryImage(id, imageUpdate);
      
      if (!updatedImage) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      res.status(500).json({ message: "Failed to update gallery image" });
    }
  });
  
  app.put(`${apiRouter}/projects/:projectId/gallery/:imageId/set-feature`, isAdmin, async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const imageId = parseInt(req.params.imageId);
      
      if (isNaN(projectId) || isNaN(imageId)) {
        return res.status(400).json({ message: "Invalid project ID or image ID" });
      }
      
      const featureImage = await storage.setProjectFeatureImage(projectId, imageId);
      
      if (!featureImage) {
        return res.status(404).json({ message: "Gallery image not found or does not belong to this project" });
      }
      
      res.json(featureImage);
    } catch (error) {
      res.status(500).json({ message: "Failed to set feature image" });
    }
  });
  
  app.delete(`${apiRouter}/projects/gallery/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gallery image ID" });
      }
      
      // Get the gallery image to retrieve its URL before deletion
      const projectGalleryImages = await storage.getProjectGallery(-1); // This will return all gallery images
      const imageToDelete = projectGalleryImages.find(img => img.id === id);
      
      if (imageToDelete && imageToDelete.imageUrl) {
        // Delete the physical file
        await FileManager.safeDeleteFile(imageToDelete.imageUrl);
      }
      
      const result = await storage.deleteProjectGalleryImage(id);
      if (!result) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });
  
  // Blog Posts Routes
  // Public blog route for all published blogs
  app.get(`${apiRouter}/blog`, async (req: Request, res: Response) => {
    try {
      console.log("[DEBUG] Fetching published blog posts");
      try {
        // Query raw blog posts data directly from the database
        const posts = await db.execute(
          'SELECT * FROM blog_posts ORDER BY created_at DESC'
        );
        
        console.log(`[DEBUG] Found total ${posts.length} blog posts`);
        
        // Filter for published posts - handle string 't' or boolean true
        // In PostgreSQL, boolean true can be stored as 't' (string) or true (boolean)
        const publishedPosts = posts.filter(post => {
          const isPublished = String(post.published).toLowerCase() === 't' || 
                             String(post.published).toLowerCase() === 'true' || 
                             post.published === true;
          return isPublished;
        });
        console.log(`[DEBUG] Found ${publishedPosts.length} published blog posts`);
        
        if (posts.length > 0) {
          console.log("[DEBUG] Sample post data:", posts[0]);
          console.log("[DEBUG] Sample post 'published' value:", posts[0].published, "Type:", typeof posts[0].published);
        }
        
        res.json(publishedPosts);
      } catch (dbError) {
        console.error("[ERROR] Database error fetching published blog posts:", dbError);
        // Check if this is a database error with details
        if (dbError instanceof Error) {
          console.error("[ERROR] Error details:", dbError.message);
          console.error("[ERROR] Error stack:", dbError.stack);
        }
        throw dbError;
      }
    } catch (error) {
      console.error("[ERROR] Failed to fetch published blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get(`${apiRouter}/blog/all`, isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("[DEBUG] Fetching all blog posts for admin");
      
      // Use direct DB query for consistency with the main blog endpoint
      const allPosts = await db.execute(
        'SELECT * FROM blog_posts ORDER BY created_at DESC'
      );
      
      console.log(`[DEBUG] Found ${allPosts.length} total blog posts`);
      
      if (allPosts.length > 0) {
        console.log("[DEBUG] Sample admin post:", allPosts[0]);
      }
      
      res.json(allPosts);
    } catch (error) {
      console.error("[ERROR] Failed to fetch all blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });
  
  // Blog Categories Routes
  app.get(`${apiRouter}/blog/categories`, async (req: Request, res: Response) => {
    try {
      const categories = await storage.getBlogCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog categories" });
    }
  });
  
  app.post(`${apiRouter}/blog/categories`, isAdmin, async (req: Request, res: Response) => {
    try {
      const categoryData = insertBlogCategorySchema.parse(req.body);
      const category = await storage.createBlogCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  // Blog Tags Routes
  app.get(`${apiRouter}/blog/tags`, async (req: Request, res: Response) => {
    try {
      const tags = await storage.getBlogTags();
      res.json(tags);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog tags" });
    }
  });
  
  app.post(`${apiRouter}/blog/tags`, isAdmin, async (req: Request, res: Response) => {
    try {
      const tagData = insertBlogTagSchema.parse(req.body);
      const tag = await storage.createBlogTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tag data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tag" });
    }
  });
  
  // Get all categories for all blog posts in a single request (used for filtering)
  // NOTE: This route must come before dynamic parameter routes!
  app.get(`${apiRouter}/blog/all-categories`, async (_req: Request, res: Response) => {
    try {
      // Get all published blog posts
      const posts = await storage.getPublishedBlogPosts();
      
      // Create a mapping of post IDs to their categories
      const categoriesMap: Record<number, any[]> = {};
      
      // Fetch categories for each post in parallel
      await Promise.all(
        posts.map(async (post) => {
          try {
            const categories = await storage.getBlogPostCategories(post.id);
            categoriesMap[post.id] = categories;
          } catch (error) {
            console.error(`Error fetching categories for post ${post.id}:`, error);
            categoriesMap[post.id] = [];
          }
        })
      );
      
      res.json(categoriesMap);
    } catch (error) {
      console.error("Error fetching all blog post categories:", error);
      res.status(500).json({ message: "Failed to fetch all blog post categories" });
    }
  });
  
  // Get categories for a specific blog post - must come before the generic /:id route
  app.get(`${apiRouter}/blog/:postId/categories`, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      const categories = await storage.getBlogPostCategories(postId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching blog post categories:", error);
      res.status(500).json({ message: "Failed to fetch blog post categories" });
    }
  });
  
  // Get tags for a specific blog post - must come before the generic /:id route
  app.get(`${apiRouter}/blog/:postId/tags`, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      const tags = await storage.getBlogPostTags(postId);
      res.json(tags);
    } catch (error) {
      console.error("Error fetching blog post tags:", error);
      res.status(500).json({ message: "Failed to fetch blog post tags" });
    }
  });
  
  // Blog Gallery Routes
  app.get(`${apiRouter}/blog/:postId/gallery`, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      console.log(`[DEBUG] Fetching gallery for blog post ID: ${postId}`);
      
      const galleryImages = await storage.getBlogGallery(postId);
      
      console.log(`[DEBUG] Blog gallery images found: ${galleryImages.length}`);
      
      res.json(galleryImages);
    } catch (error) {
      console.error(`[ERROR] Failed to fetch blog gallery:`, error);
      res.status(500).json({ 
        message: "Failed to fetch blog gallery", 
        error: String(error) 
      });
    }
  });

  app.post(`${apiRouter}/blog/:postId/gallery`, isAdmin, async (req: Request, res: Response) => {
    try {
      console.log(`[BLOG GALLERY] Received add gallery image request for blog post:`, req.params.postId);
      console.log(`[BLOG GALLERY] Request body:`, req.body);
      
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        console.log(`[BLOG GALLERY ERROR] Invalid post ID: ${req.params.postId}`);
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      // Check if blog post exists
      const post = await storage.getBlogPost(postId);
      if (!post) {
        console.log(`[BLOG GALLERY ERROR] Blog post not found with ID: ${postId}`);
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      console.log(`[BLOG GALLERY] Found blog post:`, post.title);
      
      const galleryData = insertBlogGallerySchema.parse({
        ...req.body,
        postId
      });
      
      console.log(`[BLOG GALLERY] Validated gallery data:`, galleryData);
      
      const galleryImage = await storage.addBlogGalleryImage(galleryData);
      console.log(`[BLOG GALLERY] Successfully added gallery image:`, galleryImage);
      
      res.status(201).json(galleryImage);
    } catch (error) {
      console.error(`[BLOG GALLERY ERROR] Failed to add gallery image:`, error);
      
      if (error instanceof z.ZodError) {
        console.log(`[BLOG GALLERY ERROR] Validation errors:`, error.errors);
        return res.status(400).json({ message: "Invalid gallery data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to add gallery image" });
    }
  });

  app.put(`${apiRouter}/blog/gallery/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gallery image ID" });
      }
      
      const galleryData = insertBlogGallerySchema.partial().parse(req.body);
      const updatedImage = await storage.updateBlogGalleryImage(id, galleryData);
      
      if (!updatedImage) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid gallery data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update gallery image" });
    }
  });

  app.delete(`${apiRouter}/blog/gallery/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gallery image ID" });
      }
      
      // Get all blog gallery images to find the one to delete
      const blogGalleryImages = await storage.getBlogGallery(-1); // This will return all gallery images
      const imageToDelete = blogGalleryImages.find(img => img.id === id);
      
      if (imageToDelete && imageToDelete.imageUrl) {
        // Delete the physical file
        await FileManager.safeDeleteFile(imageToDelete.imageUrl);
      }
      
      const deleted = await storage.deleteBlogGalleryImage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting blog gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });
  
  app.get(`${apiRouter}/blog/slug/:slug`, async (req: Request, res: Response) => {
    try {
      console.log(`[DEBUG] Fetching blog post by slug: ${req.params.slug}`);
      const slug = req.params.slug;
      
      // Use direct DB query for consistency with other blog endpoints
      const posts = await db.execute(sql`
        SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1
      `);
      
      if (!posts || posts.length === 0) {
        console.log(`[DEBUG] No blog post found with slug: ${slug}`);
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      const post = posts[0];
      console.log(`[DEBUG] Found blog post by slug:`, { id: post.id, title: post.title });
      
      // Get post categories, tags, and gallery images
      const categories = await storage.getBlogPostCategories(Number(post.id));
      const tags = await storage.getBlogPostTags(Number(post.id));
      const galleryImages = await storage.getBlogGallery(Number(post.id));
      
      console.log(`[DEBUG] Post relations: ${categories.length} categories, ${tags.length} tags, ${galleryImages.length} gallery images`);
      
      // Merge post with its categories, tags, and gallery images
      const postWithRelations = {
        ...post,
        categories,
        tags,
        galleryImages
      };
      
      res.json(postWithRelations);
    } catch (error) {
      console.error(`[ERROR] Failed to fetch blog post by slug:`, error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  
  // Generic blog post by ID route - keep this after all other /blog/:something routes
  app.get(`${apiRouter}/blog/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      console.log(`[DEBUG] Fetching blog post by ID: ${id}`);
      
      // Use direct DB query for consistency with other blog endpoints
      const posts = await db.execute(sql`
        SELECT * FROM blog_posts WHERE id = ${id} LIMIT 1
      `);
      
      if (!posts || posts.length === 0) {
        console.log(`[DEBUG] No blog post found with ID: ${id}`);
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      const post = posts[0];
      console.log(`[DEBUG] Found blog post by ID:`, { id: post.id, title: post.title });
      
      // Get post categories, tags, and gallery images
      const categories = await storage.getBlogPostCategories(id);
      const tags = await storage.getBlogPostTags(id);
      const galleryImages = await storage.getBlogGallery(id);
      
      console.log(`[DEBUG] Post relations: ${categories.length} categories, ${tags.length} tags, ${galleryImages.length} gallery images`);
      
      // Merge post with its categories, tags, and gallery images
      const postWithRelations = {
        ...post,
        categories,
        tags,
        galleryImages
      };
      
      res.json(postWithRelations);
    } catch (error) {
      console.error(`[ERROR] Failed to fetch blog post by ID:`, error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  
  // Get related blog posts based on category
  app.get(`${apiRouter}/blog/:id/related`, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      // Get the post to find its category
      const post = await storage.getBlogPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Get all published blog posts
      const allPosts = await storage.getPublishedBlogPosts();
      
      // Find posts with the same category, excluding the current post
      const relatedPosts = allPosts
        .filter(p => p.id !== postId && p.category === post.category)
        .slice(0, 3); // Limit to 3 related posts
      
      res.json(relatedPosts);
    } catch (error) {
      console.error("Error fetching related blog posts:", error);
      res.status(500).json({ message: "Failed to fetch related blog posts" });
    }
  });
  
  // Admin-only endpoints for blog management
  app.post(`${apiRouter}/blog`, isAdmin, async (req: Request, res: Response) => {
    try {
      // Use the extended schema that includes categoryIds, tagIds, and galleryImages
      const postData = extendedInsertBlogPostSchema.parse(req.body);
      
      // Extract category and tag IDs, and gallery images
      const { categoryIds, tagIds, galleryImages, ...blogPostData } = postData;
      
      // Ensure category has a default value
      if (!blogPostData.category) {
        blogPostData.category = "";
      }
      
      // Create the blog post
      const post = await storage.createBlogPost(blogPostData);
      
      // Link categories if provided
      if (categoryIds && categoryIds.length > 0) {
        await storage.linkBlogPostCategories(post.id, categoryIds);
      }
      
      // Link tags if provided
      if (tagIds && tagIds.length > 0) {
        await storage.linkBlogPostTags(post.id, tagIds);
      }
      
      // Add gallery images if provided
      if (galleryImages && galleryImages.length > 0) {
        for (let i = 0; i < galleryImages.length; i++) {
          const galleryImage = {
            postId: post.id,
            imageUrl: galleryImages[i].imageUrl,
            caption: galleryImages[i].caption || null,
            order: galleryImages[i].order || i // Use provided order or index as default
          };
          await storage.addBlogGalleryImage(galleryImage);
        }
      }
      
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      }
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });
  
  app.put(`${apiRouter}/blog/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      // Use the extended schema for update
      const postData = extendedInsertBlogPostSchema.partial().parse(req.body);
      
      // Extract category and tag IDs, and gallery images
      const { categoryIds, tagIds, galleryImages, ...blogPostData } = postData;
      
      // Ensure category has a default value if it's being updated
      if (blogPostData.category === null || blogPostData.category === undefined) {
        blogPostData.category = "";
      }
      
      // Update the blog post
      const post = await storage.updateBlogPost(id, blogPostData);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Update categories if provided
      if (categoryIds) {
        await storage.updateBlogPostCategories(id, categoryIds);
      }
      
      // Update tags if provided
      if (tagIds) {
        await storage.updateBlogPostTags(id, tagIds);
      }
      
      // Update gallery images if provided
      if (galleryImages && Array.isArray(galleryImages)) {
        console.log(`[BLOG UPDATE] Processing ${galleryImages.length} gallery images for blog post ${id}`);
        
        // Get existing gallery for comparison
        const existingGallery = await storage.getBlogGallery(id);
        console.log(`[BLOG UPDATE] Existing gallery has ${existingGallery.length} images`);
        
        // Map existing images by ID and URL for quick lookup
        const existingImagesById = new Map();
        const existingImagesByUrl = new Map();
        
        existingGallery.forEach(img => {
          if (img.id) {
            existingImagesById.set(img.id, img);
          }
          if (img.imageUrl) {
            existingImagesByUrl.set(img.imageUrl, img);
          }
        });
        
        // Track which existing images are being kept
        const keptImageIds = new Set();
        
        // First pass: identify which images to keep and which to add
        const imagesToAdd = [];
        
        for (let i = 0; i < galleryImages.length; i++) {
          const image = galleryImages[i] as any; // Type assertion to avoid TypeScript errors
          
          // Check if this is an existing image by ID
          if (image.id && existingImagesById.has(image.id)) {
            keptImageIds.add(image.id);
            continue;
          }
          
          // Check if this is an existing image by URL
          if (image.imageUrl && existingImagesByUrl.has(image.imageUrl)) {
            const existingImage = existingImagesByUrl.get(image.imageUrl);
            keptImageIds.add(existingImage.id);
            continue;
          }
          
          // This is a new image to add
          if (image.imageUrl) {
            imagesToAdd.push({
              postId: id,
              imageUrl: image.imageUrl,
              caption: image.caption || null,
              order: image.order || i // Use provided order or index as default
            });
          }
        }
        
        // Identify images to delete (those not being kept)
        const imagesToDelete = existingGallery
          .filter(img => !keptImageIds.has(img.id))
          .map(img => img.id);
        
        console.log(`[BLOG UPDATE] Found ${imagesToDelete.length} images to delete and ${imagesToAdd.length} images to add`);
        
        // Delete images that are no longer needed
        for (const idToDelete of imagesToDelete) {
          await storage.deleteBlogGalleryImage(idToDelete);
        }
        
        // Add new images
        for (const imageToAdd of imagesToAdd) {
          await storage.addBlogGalleryImage(imageToAdd);
        }
        
        // Update existing images if needed
        for (let i = 0; i < galleryImages.length; i++) {
          const image = galleryImages[i] as any; // Type assertion to avoid TypeScript errors
          
          if (image.id && existingImagesById.has(image.id)) {
            const existingImage = existingImagesById.get(image.id);
            const caption = image.caption || null;
            const order = image.order || i;
            
            // Only update if something has changed
            if (existingImage.caption !== caption || existingImage.order !== order) {
              console.log(`[BLOG UPDATE] Updating image ${image.id} with new caption or order`);
              
              await storage.updateBlogGalleryImage(image.id, {
                caption,
                order
              });
            }
          } else if (image.imageUrl && existingImagesByUrl.has(image.imageUrl)) {
            const existingImage = existingImagesByUrl.get(image.imageUrl);
            const caption = image.caption || null;
            const order = image.order || i;
            
            // Only update if something has changed
            if (existingImage.caption !== caption || existingImage.order !== order) {
              console.log(`[BLOG UPDATE] Updating image with URL ${image.imageUrl.substring(0, 30)}... with new caption or order`);
              
              await storage.updateBlogGalleryImage(existingImage.id, {
                caption,
                order
              });
            }
          }
        }
      }
      
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid blog post data", errors: error.errors });
      }
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });
  
  app.delete(`${apiRouter}/blog/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      const success = await storage.deleteBlogPost(id);
      if (!success) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });
  
  // Services Routes
  app.get(`${apiRouter}/services`, async (req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });
  
  app.get(`${apiRouter}/services/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });
  
  app.post(`${apiRouter}/services`, isAdmin, async (req: Request, res: Response) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      
      // Handle gallery images if provided
      if (req.body.galleryImages && Array.isArray(req.body.galleryImages)) {
        for (const image of req.body.galleryImages) {
          await storage.addServiceGalleryImage({
            serviceId: service.id,
            imageUrl: image.imageUrl,
            alt: image.alt,
            order: image.order
          });
        }
      }
      
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });
  
  app.put(`${apiRouter}/services/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      // Extract gallery images from the request body
      const { galleryImages, ...serviceData } = req.body;
      
      // Update the service data
      const validatedServiceData = insertServiceSchema.partial().parse(serviceData);
      const updatedService = await storage.updateService(id, validatedServiceData);
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      // Process gallery images if provided
      if (galleryImages && Array.isArray(galleryImages)) {
        console.log(`[SERVICE] Processing ${galleryImages.length} gallery images for service ${id}`);
        
        // Get existing gallery for comparison
        const existingGallery = await storage.getServiceGallery(id);
        console.log(`[SERVICE] Existing gallery has ${existingGallery.length} images`);
        
        // Map existing images by ID and URL for quick lookup
        const existingImagesById = new Map();
        const existingImagesByUrl = new Map();
        
        existingGallery.forEach(img => {
          if (img.id) {
            existingImagesById.set(img.id, img);
          }
          if (img.imageUrl) {
            existingImagesByUrl.set(img.imageUrl, img);
          }
        });
        
        // Track which existing images are being kept
        const keptImageIds = new Set();
        
        // First pass: identify which images to keep and which to add
        const imagesToAdd = [];
        
        for (let i = 0; i < galleryImages.length; i++) {
          const image = galleryImages[i] as any; // Type assertion to avoid TypeScript errors
          
          // Check if this is an existing image by ID
          if (image.id && existingImagesById.has(image.id)) {
            keptImageIds.add(image.id);
            continue;
          }
          
          // Check if this is an existing image by URL
          if (image.imageUrl && existingImagesByUrl.has(image.imageUrl)) {
            const existingImage = existingImagesByUrl.get(image.imageUrl);
            keptImageIds.add(existingImage.id);
            continue;
          }
          
          // This is a new image to add
          if (image.imageUrl) {
            imagesToAdd.push({
              serviceId: id,
              imageUrl: image.imageUrl,
              alt: image.alt || '',
              order: image.order || i + 1 // Use provided order or index as default
            });
          }
        }
        
        // Identify images to delete (those not being kept)
        const imagesToDelete = existingGallery
          .filter(img => !keptImageIds.has(img.id))
          .map(img => img.id);
        
        console.log(`[SERVICE] Found ${imagesToDelete.length} images to delete and ${imagesToAdd.length} images to add`);
        
        // Delete images that are no longer needed
        for (const idToDelete of imagesToDelete) {
          await storage.deleteServiceGalleryImage(idToDelete);
        }
        
        // Add new images
        for (const imageToAdd of imagesToAdd) {
          await storage.addServiceGalleryImage(imageToAdd);
        }
        
        // Update existing images if needed
        for (let i = 0; i < galleryImages.length; i++) {
          const image = galleryImages[i] as any; // Type assertion to avoid TypeScript errors
          
          if (image.id && existingImagesById.has(image.id)) {
            const existingImage = existingImagesById.get(image.id);
            const alt = image.alt || '';
            const order = image.order || i + 1;
            
            // Only update if something has changed
            if (existingImage.alt !== alt || existingImage.order !== order) {
              console.log(`[SERVICE] Updating image ${image.id} with new alt or order`);
              
              await storage.updateServiceGalleryImage(image.id, {
                alt,
                order
              });
            }
          } else if (image.imageUrl && existingImagesByUrl.has(image.imageUrl)) {
            const existingImage = existingImagesByUrl.get(image.imageUrl);
            const alt = image.alt || '';
            const order = image.order || i + 1;
            
            // Only update if something has changed
            if (existingImage.alt !== alt || existingImage.order !== order) {
              console.log(`[SERVICE] Updating image with URL ${image.imageUrl.substring(0, 30)}... with new alt or order`);
              
              await storage.updateServiceGalleryImage(existingImage.id, {
                alt,
                order
              });
            }
          }
        }
      }
      
      res.json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });
  
  app.delete(`${apiRouter}/services/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      const deleted = await storage.deleteService(id);
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });
  
  // Service Gallery Routes
  app.get(`${apiRouter}/services/:serviceId/gallery`, async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      // Add detailed logging for debugging
      console.log(`[DEBUG] Fetching gallery for service ID: ${serviceId}`);
      
      const galleryImages = await storage.getServiceGallery(serviceId);
      
      console.log(`[DEBUG] Gallery images found: ${JSON.stringify(galleryImages)}`);
      
      res.json(galleryImages);
    } catch (error) {
      console.error(`[ERROR] Failed to fetch service gallery:`, error);
      res.status(500).json({ 
        message: "Failed to fetch service gallery", 
        error: String(error) 
      });
    }
  });
  
  app.post(`${apiRouter}/services/:serviceId/gallery`, isAdmin, async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      // Check if service exists
      const service = await storage.getService(serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      const galleryData = insertServiceGallerySchema.parse({
        ...req.body,
        serviceId
      });
      
      const galleryImage = await storage.addServiceGalleryImage(galleryData);
      res.status(201).json(galleryImage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid gallery data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add gallery image" });
    }
  });
  
  app.put(`${apiRouter}/services/gallery/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gallery image ID" });
      }
      
      const galleryData = insertServiceGallerySchema.partial().parse(req.body);
      const updatedImage = await storage.updateServiceGalleryImage(id, galleryData);
      
      if (!updatedImage) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid gallery data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update gallery image" });
    }
  });
  
  app.delete(`${apiRouter}/services/gallery/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gallery image ID" });
      }
      
      // Get all service gallery images to find the one to delete
      const serviceGalleryImages = await storage.getServiceGallery(-1); // This will return all gallery images
      const imageToDelete = serviceGalleryImages.find(img => img.id === id);
      
      if (imageToDelete && imageToDelete.imageUrl) {
        // Delete the physical file
        await FileManager.safeDeleteFile(imageToDelete.imageUrl);
      }
      
      const deleted = await storage.deleteServiceGalleryImage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting service gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });
  
  // Testimonials Routes
  // Testimonials Public Routes
  app.get(`${apiRouter}/testimonials`, async (req: Request, res: Response) => {
    try {
      console.log("[DEBUG] Fetching approved testimonials");
      // Only return approved testimonials for public view
      const testimonials = await storage.getApprovedTestimonials();
      console.log("[DEBUG] Approved testimonials:", testimonials);
      res.json(testimonials);
    } catch (error) {
      console.error("[ERROR] Failed to fetch testimonials:", error);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Submit a new testimonial (public)
  app.post(`${apiRouter}/testimonials/submit`, async (req: Request, res: Response) => {
    try {
      const testimonialData = publicTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(testimonialData);
      res.status(201).json({ 
        message: "Thank you for your testimonial! It will be reviewed by our team before being published." 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid testimonial data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit testimonial" });
    }
  });

  // Testimonial Admin Routes
  app.get(`${apiRouter}/admin/testimonials`, isAdmin, async (req: Request, res: Response) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  app.get(`${apiRouter}/admin/testimonials/pending`, isAdmin, async (req: Request, res: Response) => {
    try {
      const testimonials = await storage.getPendingTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending testimonials" });
    }
  });

  app.get(`${apiRouter}/admin/testimonials/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const testimonial = await storage.getTestimonial(id);
      
      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      
      res.json(testimonial);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch testimonial" });
    }
  });

  app.put(`${apiRouter}/admin/testimonials/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const testimonialData = insertTestimonialSchema.partial().parse(req.body);
      
      // Check if image has been removed
      if (testimonialData.image === null || testimonialData.image === '') {
        const existingTestimonial = await storage.getTestimonial(id);
        if (existingTestimonial && existingTestimonial.image && 
            !existingTestimonial.image.startsWith('https://randomuser.me/')) {
          // Delete the physical file if it's not from randomuser.me
          await FileManager.safeDeleteFile(existingTestimonial.image);
        }
      }
      
      const updatedTestimonial = await storage.updateTestimonial(id, testimonialData);
      
      if (!updatedTestimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      
      res.json(updatedTestimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid testimonial data", errors: error.errors });
      }
      console.error("Error updating testimonial:", error);
      res.status(500).json({ message: "Failed to update testimonial" });
    }
  });

  app.put(`${apiRouter}/admin/testimonials/:id/approve`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const approvedTestimonial = await storage.approveTestimonial(id);
      
      if (!approvedTestimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      
      res.json(approvedTestimonial);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve testimonial" });
    }
  });
  
  app.put(`${apiRouter}/admin/testimonials/:id/revoke`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      const unapprovedTestimonial = await storage.revokeTestimonialApproval(id);
      
      if (!unapprovedTestimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      
      res.json(unapprovedTestimonial);
    } catch (error) {
      console.error("Error revoking approval:", error);
      res.status(500).json({ message: "Failed to revoke testimonial approval" });
    }
  });

  app.delete(`${apiRouter}/admin/testimonials/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the testimonial to retrieve its image URL before deletion
      const testimonial = await storage.getTestimonial(id);
      
      if (testimonial && testimonial.image && 
          !testimonial.image.startsWith('https://randomuser.me/')) {
        // Delete the physical file if it's not from randomuser.me
        await FileManager.safeDeleteFile(testimonial.image);
      }
      
      const success = await storage.deleteTestimonial(id);
      
      if (!success) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      
      res.json({ message: "Testimonial deleted successfully" });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(500).json({ message: "Failed to delete testimonial" });
    }
  });
  
  // Contact/Messages Routes
  app.post(`${apiRouter}/contact`, async (req: Request, res: Response) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json({ success: true, message: "Message sent successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  app.get(`${apiRouter}/messages`, isAdmin, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  app.put(`${apiRouter}/messages/:id/read`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      const message = await storage.markMessageAsRead(id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  
  app.delete(`${apiRouter}/messages/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      const deleted = await storage.deleteMessage(id);
      if (!deleted) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // File Upload Route
  app.post(`${apiRouter}/upload`, isAdmin, upload.single('file'), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Get the original file URL
      const fileUrl = getFileUrl(req.file.filename);
      
      // Get session ID from query parameter or generate a random one
      const sessionId = req.query.sessionId as string || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Track this file as a pending upload (will be cleaned up if not committed)
      const trackedUrl = FileManager.trackPendingFile(fileUrl, sessionId);
      
      res.status(201).json({ 
        url: trackedUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        sessionId: sessionId
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  
  // File management endpoints
  app.post(`${apiRouter}/files/track`, isAdmin, (req: Request, res: Response) => {
    try {
      const { fileUrl, sessionId, filename } = req.body;
      
      if (!fileUrl || !sessionId) {
        return res.status(400).json({ 
          success: false,
          message: "File URL and session ID are required" 
        });
      }
      
      console.log(`Tracking file: ${fileUrl} for session: ${sessionId}`);
      
      // Support both URL formats from UploadThing
      // If the file has both ufsUrl and url properties, prefer ufsUrl
      const fileUrlToTrack = fileUrl;
      
      // Track the file with our enhanced FileManager
      const trackedFile = FileManager.trackPendingFile(fileUrlToTrack, sessionId, filename);
      
      // Get the file key for logging
      const fileKey = extractUploadThingKeyFromUrl(fileUrlToTrack);
      console.log(`File tracked with key: ${fileKey || 'N/A'}`);
      
      return res.status(200).json({ 
        success: true,
        message: "File tracked successfully", 
        file: trackedFile,
        filename: filename,
        key: fileKey
      });
    } catch (error) {
      console.error("Error tracking file:", error);
      return res.status(500).json({ 
        success: false,
        message: "Error tracking file", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post(`${apiRouter}/files/commit`, isAdmin, (req: Request, res: Response) => {
    try {
      const { sessionId, fileUrls } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ 
          success: false,
          message: "Session ID is required" 
        });
      }
      
      // Mark files as committed (permanently stored in DB)
      console.log(`Committing files for session ${sessionId}, file count: ${fileUrls?.length || 'all'}`);
      const committedFiles = FileManager.commitFiles(sessionId, fileUrls);
      
      return res.status(200).json({ 
        success: true,
        message: `Committed ${committedFiles.length} files`,
        files: committedFiles
      });
    } catch (error) {
      console.error("File commit error:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to commit files",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post(`${apiRouter}/files/cleanup`, isAdmin, async (req: Request, res: Response) => {
    try {
      const { sessionId, fileUrl, fileUrls, preserveUrls } = req.body;
      
      // If no sessionId, fileUrl, or fileUrls array is provided, return an error
      if (!sessionId && !fileUrl && !fileUrls) {
        return res.status(400).json({ 
          success: false,
          message: "Session ID, fileUrl, or fileUrls array is required",
          deletedFiles: [],
          deletedCount: 0,
          failedFiles: [],
          failedCount: 0,
          preservedFiles: [],
          preservedCount: 0
        });
      }
      
      console.log(`[routes] Cleaning up files for session ${sessionId || '*'}`);
      
      // Get all project URLs to preserve from the database
      // This is critical to prevent deletion of images in uploadthing
      let allProjectUrls: string[] = [];
      try {
        // Query all projects to get their main images
        const allProjects = await storage.getProjects();
        const projectMainImages = allProjects
          .map(p => p.image)
          .filter(Boolean) as string[];
          
        console.log(`[routes] Found ${projectMainImages.length} project main images to preserve`);
        allProjectUrls = [...allProjectUrls, ...projectMainImages];
        
        // Also get all gallery images
        for (const project of allProjects) {
          if (project.id) {
            const galleryImages = await storage.getProjectGallery(project.id);
            const galleryUrls = galleryImages
              .map(g => g.imageUrl)
              .filter(Boolean) as string[];
              
            console.log(`[routes] Found ${galleryUrls.length} gallery images for project ID ${project.id} to preserve`);
            allProjectUrls = [...allProjectUrls, ...galleryUrls];
          }
        }
        
        // Remove duplicates
        allProjectUrls = Array.from(new Set(allProjectUrls));
        console.log(`[routes] Total ${allProjectUrls.length} unique project URLs to preserve from database`);
      } catch (dbError) {
        console.error(`[routes] Error getting project URLs to preserve:`, dbError);
      }
      
      // Combine user-provided preserveUrls with database URLs
      const combinedPreserveUrls = [
        ...(preserveUrls && Array.isArray(preserveUrls) ? preserveUrls : []),
        ...allProjectUrls
      ];
      
      // Remove duplicates again
      const finalPreserveUrls = Array.from(new Set(combinedPreserveUrls));
      
      console.log(`[routes] Final total of ${finalPreserveUrls.length} unique URLs to preserve during cleanup`);
      
      if (finalPreserveUrls.length > 0) {
        // Log a sample of preserve URLs for debugging (first 5)
        const previewUrls = finalPreserveUrls.slice(0, 5);
        console.log(`[routes] Sample URLs to preserve:`, previewUrls);
        if (finalPreserveUrls.length > 5) {
          console.log(`[routes] ...and ${finalPreserveUrls.length - 5} more`);
        }
      }
      
      let deletedFiles: string[] = [];
      let failedFiles: string[] = [];
      let preservedFiles: string[] = [];
      
      // If fileUrls array is provided, delete each file in the array
      if (fileUrls && Array.isArray(fileUrls) && fileUrls.length > 0) {
        console.log(`[routes] Cleaning up ${fileUrls.length} specific files`);
        
        for (const url of fileUrls) {
          try {
            // Skip if this URL is in the preserve list
            if (finalPreserveUrls.includes(url)) {
              console.log(`[routes] Skipping preserved file: ${url}`);
              preservedFiles.push(url);
              continue;
            }
            
            const result = await FileManager.cleanupSession(sessionId || '*', url, finalPreserveUrls);
            if (result.deletedUrls.length > 0) {
              deletedFiles = [...deletedFiles, ...result.deletedUrls];
            }
            if (result.failedUrls.length > 0) {
              failedFiles = [...failedFiles, ...result.failedUrls];
            }
            if (result.preservedUrls.length > 0) {
              preservedFiles = [...preservedFiles, ...result.preservedUrls];
            }
          } catch (fileError) {
            console.error(`Error cleaning up file ${url}:`, fileError);
            failedFiles.push(url);
            // Continue processing other files even if one fails
          }
        }
      } 
      // If a single fileUrl is provided, delete just that file
      else if (fileUrl) {
        console.log(`[routes] Cleaning up specific file: ${fileUrl}`);
        
        // Skip if this URL is in the preserve list
        if (finalPreserveUrls.includes(fileUrl)) {
          console.log(`[routes] Skipping preserved file: ${fileUrl}`);
          preservedFiles.push(fileUrl);
        } else {
          // Extract the file key if it's an UploadThing URL for better logging
          const fileKey = extractUploadThingKeyFromUrl(fileUrl);
          if (fileKey) {
            console.log(`[routes] File key to delete: ${fileKey}`);
          }
          
          try {
            // Handle individual file deletion with updated cleanupSession method
            // Use wildcard session ID '*' when deleting a specific file with no session context
            const result = await FileManager.cleanupSession(sessionId || '*', fileUrl, finalPreserveUrls);
            
            // Add to our running list of deleted and failed files
            deletedFiles = [...deletedFiles, ...result.deletedUrls];
            failedFiles = [...failedFiles, ...result.failedUrls];
            preservedFiles = [...preservedFiles, ...result.preservedUrls];
            
            // If nothing was deleted or preserved, mark as failure
            if (result.deletedUrls.length === 0 && result.preservedUrls.length === 0) {
              failedFiles.push(fileUrl);
            }
          } catch (fileError) {
            console.error(`Error cleaning up file ${fileUrl}:`, fileError);
            failedFiles.push(fileUrl);
          }
        }
      } 
      // Otherwise clean up the entire session
      else if (sessionId) {
        console.log(`[routes] Cleaning up entire session: ${sessionId}`);
        try {
          const result = await FileManager.cleanupSession(sessionId, undefined, finalPreserveUrls);
          deletedFiles = result.deletedUrls;
          failedFiles = result.failedUrls;
          preservedFiles = result.preservedUrls;
        } catch (sessionError) {
          console.error(`Error cleaning up session ${sessionId}:`, sessionError);
        }
      }
      
      console.log(`[routes] Cleanup completed: ${deletedFiles.length} files deleted, ${failedFiles.length} failed, ${preservedFiles.length} preserved`);
      
      // Extended debug information to help diagnose file deletion issues
      const debugInfo = {
        // Session information
        sessionId,
        specificFileUrl: fileUrl,
        originalPreserveUrlsCount: preserveUrls ? preserveUrls.length : 0,
        finalPreserveUrlsCount: finalPreserveUrls.length,
        
        // Statistics
        deletedCount: deletedFiles.length,
        failedCount: failedFiles.length,
        preservedCount: preservedFiles.length,
        
        // Sample of first few files in each category (to avoid huge responses)
        deletedSample: deletedFiles.slice(0, 5),
        preservedSample: preservedFiles.slice(0, 5),
        failedSample: failedFiles.slice(0, 5),
        
        // Full lists for smaller responses, samples for larger ones
        deletedFiles: deletedFiles.length <= 20 ? deletedFiles : `${deletedFiles.length} files (first 5 shown in deletedSample)`,
        preservedFiles: preservedFiles.length <= 20 ? preservedFiles : `${preservedFiles.length} files (first 5 shown in preservedSample)`,
        failedFiles: failedFiles.length <= 20 ? failedFiles : `${failedFiles.length} files (first 5 shown in failedSample)`,
      };
      
      return res.status(200).json({ 
        success: true,
        message: fileUrl 
          ? (deletedFiles.length > 0 ? `Deleted file: ${fileUrl}` : 
             preservedFiles.includes(fileUrl) ? `Preserved file: ${fileUrl}` : 
             `Failed to delete file: ${fileUrl}`)
          : `Cleaned up ${deletedFiles.length} files (${preservedFiles.length} preserved)`,
        // Core file lists
        deletedFiles, 
        deletedCount: deletedFiles.length,
        failedFiles,
        failedCount: failedFiles.length,
        preservedFiles,
        preservedCount: preservedFiles.length,
        // Add extended debugging information
        debug: debugInfo
      });
    } catch (error) {
      console.error("File cleanup error:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to cleanup files",
        error: error instanceof Error ? error.message : String(error),
        deletedFiles: [],
        deletedCount: 0,
        failedFiles: [],
        failedCount: 0,
        preservedFiles: [],
        preservedCount: 0
      });
    }
  });
  
  // Debug endpoint to view pending files in FileManager
  app.get(`${apiRouter}/files/debug`, isAdmin, (req: Request, res: Response) => {
    try {
      // Get the current state of pendingFiles from FileManager
      const pendingFiles = FileManager.getPendingFiles();
      res.json({
        count: Object.keys(pendingFiles).length,
        files: pendingFiles
      });
    } catch (error) {
      console.error("Error in debug endpoint:", error);
      res.status(500).json({
        message: "Failed to get debug information",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // UploadThing direct file management APIs
  app.get(`${apiRouter}/uploadthing/files`, isAdmin, async (req: Request, res: Response) => {
    try {
      const files = await uploadThingService.listFiles();
      res.json(files);
    } catch (error) {
      console.error("Error listing UploadThing files:", error);
      res.status(500).json({ 
        message: "Failed to list UploadThing files",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.delete(`${apiRouter}/uploadthing/files/:key`, isAdmin, async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      
      if (!key) {
        return res.status(400).json({ message: "File key is required" });
      }
      
      const result = await uploadThingService.deleteFile(key);
      
      if (result.success) {
        res.json({ 
          message: "File deleted successfully",
          key
        });
      } else {
        res.status(500).json({ message: "Failed to delete file" });
      }
    } catch (error) {
      console.error(`Error deleting UploadThing file:`, error);
      res.status(500).json({ 
        message: "Failed to delete UploadThing file",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post(`${apiRouter}/uploadthing/files/delete-batch`, isAdmin, async (req: Request, res: Response) => {
    try {
      const { keys } = req.body;
      
      if (!keys || !Array.isArray(keys) || keys.length === 0) {
        return res.status(400).json({ message: "File keys array is required" });
      }
      
      const result = await uploadThingService.deleteFiles(keys);
      
      if (result.success) {
        res.json({ 
          message: `${result.deletedCount} files deleted successfully`,
          deletedCount: result.deletedCount,
          keys
        });
      } else {
        res.status(500).json({ message: "Failed to delete files" });
      }
    } catch (error) {
      console.error(`Error batch deleting UploadThing files:`, error);
      res.status(500).json({ 
        message: "Failed to delete UploadThing files", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get file categorization data from database to help organize files by projects
  app.get(`${apiRouter}/uploadthing/file-categories`, isAdmin, async (req: Request, res: Response) => {
    try {
      // Get all projects with their titles for mapping
      const projects = await storage.getProjects();
      
      // Get all project gallery images with their URLs and project IDs
      const projectGalleryMap: Record<string, any> = {};
      
      for (const project of projects) {
        const galleryImages = await storage.getProjectGallery(project.id);
        
        // For each gallery image, map its URL to the project
        for (const image of galleryImages) {
          // Extract key from URL
          // URLs are typically in format: https://utfs.io/f/PFuaKVnX18hb...
          // or https://8amedrxbjr.ufs.sh/f/PFuaKVnX18hb...
          const urlParts = image.imageUrl.split('/');
          const key = urlParts[urlParts.length - 1];
          
          if (key) {
            projectGalleryMap[key] = {
              projectId: project.id,
              projectTitle: project.title,
              projectCategory: project.category,
              imageId: image.id,
              isFeature: image.isFeature
            };
          }
        }
      }
      
      // Get service gallery information as well
      const services = await storage.getServices();
      const serviceGalleryMap: Record<string, any> = {};
      
      for (const service of services) {
        const galleryImages = await storage.getServiceGallery(service.id);
        
        for (const image of galleryImages) {
          const urlParts = image.imageUrl.split('/');
          const key = urlParts[urlParts.length - 1];
          
          if (key) {
            serviceGalleryMap[key] = {
              serviceId: service.id,
              serviceTitle: service.title,
              imageId: image.id
            };
          }
        }
      }
      
      // Get blog posts and their gallery images
      const blogPosts = await storage.getBlogPosts();
      const blogGalleryMap: Record<string, any> = {};
      
      // Process all blog gallery images
      for (const post of blogPosts) {
        const galleryImages = await storage.getBlogGallery(post.id);
        
        console.log(`Processing blog post ${post.id} (${post.title}), found ${galleryImages.length} gallery images`);
        
        // Specific known blog image keys - as a fallback if URL parsing fails
        const knownImageKeys: Record<string, string> = {
          'https://utfs.io/f/PFuaKVnX18hb87YYN0DtOVmxrgZuSC6kLz0KBf3E79JiPYoQ': 'PFuaKVnX18hb87YYN0DtOVmxrgZuSC6kLz0KBf3E79JiPYoQ',
          'https://utfs.io/f/PFuaKVnX18hbaR5cQ2VOzWLZs1FcYNvXfKu7jG549RraP23T': 'PFuaKVnX18hbaR5cQ2VOzWLZs1FcYNvXfKu7jG549RraP23T',
          'https://utfs.io/f/PFuaKVnX18hbueH7eiuEMxftyqm0wAQVaTXNU2HCulP3L6FD': 'PFuaKVnX18hbueH7eiuEMxftyqm0wAQVaTXNU2HCulP3L6FD',
          'https://utfs.io/f/PFuaKVnX18hbDBdytq9XO6QEae3p8rvuWcZ1RqH0ngDSdyYA': 'PFuaKVnX18hbDBdytq9XO6QEae3p8rvuWcZ1RqH0ngDSdyYA'
        };
        
        for (const image of galleryImages) {
          console.log(`  Processing image ${image.id} with URL: ${image.imageUrl}`);
          
          // Try to extract key using URL splitting first
          let key = undefined;
          
          try {
            const urlParts = image.imageUrl.split('/');
            key = urlParts[urlParts.length - 1];
            console.log(`  Extracted key using URL parsing: ${key}`);
          } catch (error) {
            console.log(`  Error extracting key from URL: ${error}`);
          }
          
          // If the URL-based extraction failed, try the exact URL lookup
          if (!key && knownImageKeys[image.imageUrl]) {
            key = knownImageKeys[image.imageUrl];
            console.log(`  Using known key for URL ${image.imageUrl}: ${key}`);
          }
          
          // Last resort: try to extract using regex
          if (!key) {
            try {
              const regex = /https:\/\/utfs\.io\/f\/([A-Za-z0-9]+)/;
              const match = image.imageUrl.match(regex);
              if (match && match[1]) {
                key = match[1];
                console.log(`  Extracted key using regex: ${key}`);
              }
            } catch (error) {
              console.log(`  Error extracting key with regex: ${error}`);
            }
          }
          
          console.log(`  Final key: ${key || 'EXTRACTION FAILED'}`);
          
          if (key) {
            blogGalleryMap[key] = {
              postId: post.id,
              postTitle: post.title,
              postSlug: post.slug,
              imageId: image.id,
              caption: image.caption || 'Featured image'
            };
          } else {
            console.log(`  WARNING: Failed to extract key from URL: ${image.imageUrl}`);
          }
        }
      }
      
      console.log(`Total blog gallery entries created: ${Object.keys(blogGalleryMap).length}`);
      console.log(`Blog gallery keys: ${Object.keys(blogGalleryMap)}`);
      
      
      // Get quote request attachments for organization
      const quoteRequests = await storage.getQuoteRequests();
      const quoteAttachmentsMap: Record<string, any> = {};
      
      // Create a map of quote requests for easy lookup by ID
      const quoteRequestsById: Record<number, any> = {};
      quoteRequests.forEach(quote => {
        quoteRequestsById[quote.id] = quote;
      });
      
      // Process all quote request attachments
      for (const quote of quoteRequests) {
        const attachments = await storage.getQuoteRequestAttachments(quote.id);
        
        for (const attachment of attachments) {
          const urlParts = attachment.fileUrl.split('/');
          const key = urlParts[urlParts.length - 1];
          
          if (key) {
            quoteAttachmentsMap[key] = {
              quoteId: quote.id,
              quoteName: quote.name,
              quoteEmail: quote.email,
              quoteProject: quote.projectType,
              attachmentId: attachment.id,
              fileName: attachment.fileName
            };
          }
        }
      }
      
      // Get team member photos for organization
      const teamMembers = await storage.getTeamMembers();
      const teamMemberPhotosMap: Record<string, any> = {};
      
      // Process all team member photos
      for (const member of teamMembers) {
        if (member.photo) {
          const urlParts = member.photo.split('/');
          const key = urlParts[urlParts.length - 1];
          
          if (key) {
            teamMemberPhotosMap[key] = {
              memberId: member.id,
              memberName: member.name,
              memberDesignation: member.designation,
              active: member.active
            };
          }
        }
      }
      
      // Format and send the categorization data
      res.json({
        projects: projects.map(project => ({
          id: project.id,
          title: project.title,
          category: project.category
        })),
        projectGalleryMap,
        serviceGalleryMap,
        blogGalleryMap,
        quoteAttachmentsMap,
        teamMemberPhotosMap,
        quoteRequests: quoteRequests.map(quote => ({
          id: quote.id,
          name: quote.name,
          email: quote.email,
          project: quote.projectType
        })),
        blogPosts: blogPosts.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          published: post.published
        })),
        teamMembers: teamMembers.map(member => ({
          id: member.id,
          name: member.name,
          designation: member.designation,
          active: member.active
        }))
      });
    } catch (error) {
      console.error('Error getting file categorization data:', error);
      res.status(500).json({ 
        message: "Failed to get file categorization data",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Serve static files from public directory
  app.use('/uploads', (req, res, next) => {
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    next();
  }, express.static(path.join(process.cwd(), 'public/uploads')));
  
  // Serve subcontractor documents from attached_assets directory
  app.use('/documents', (req, res, next) => {
    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    next();
  }, express.static(path.join(process.cwd(), 'attached_assets')));

  // Newsletter Subscriber Routes
  app.post(`${apiRouter}/newsletter/subscribe`, async (req: Request, res: Response) => {
    try {
      // Validate the input data
      const subscriberData = insertNewsletterSubscriberSchema.parse(req.body);
      
      // Check if email already exists
      const existingSubscriber = await storage.getNewsletterSubscriberByEmail(subscriberData.email);
      if (existingSubscriber) {
        // If already subscribed, return success
        if (existingSubscriber.subscribed) {
          return res.json({ message: "You are already subscribed to our newsletter" });
        }
        
        // If previously unsubscribed, resubscribe them
        const updatedSubscriber = await storage.updateNewsletterSubscriberStatus(existingSubscriber.id, true);
        
        return res.json({ 
          message: "Welcome back! You have been resubscribed to our newsletter",
          subscriber: updatedSubscriber
        });
      }
      
      // Create new subscriber
      const subscriber = await storage.createNewsletterSubscriber(subscriberData);
      res.status(201).json({ 
        message: "Thank you for subscribing to our newsletter!",
        subscriber 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid subscription data", 
          errors: error.errors 
        });
      }
      console.error("Newsletter subscription error:", error);
      res.status(500).json({ message: "Failed to process newsletter subscription" });
    }
  });
  
  app.post(`${apiRouter}/newsletter/unsubscribe`, async (req: Request, res: Response) => {
    try {
      // Validate that we have an email
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find the subscriber
      const subscriber = await storage.getNewsletterSubscriberByEmail(email);
      if (!subscriber) {
        return res.status(404).json({ message: "Email not found in subscriber list" });
      }
      
      // Update the subscriber to unsubscribed
      const updatedSubscriber = await storage.updateNewsletterSubscriberStatus(subscriber.id, false);
      
      res.json({ 
        message: "You have been unsubscribed from our newsletter",
        subscriber: updatedSubscriber
      });
    } catch (error) {
      console.error("Newsletter unsubscribe error:", error);
      res.status(500).json({ message: "Failed to process unsubscribe request" });
    }
  });
  
  // Admin newsletter management
  app.get(`${apiRouter}/admin/newsletter/subscribers`, isAdmin, async (req: Request, res: Response) => {
    try {
      const subscribers = await storage.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch newsletter subscribers" });
    }
  });
  
  app.delete(`${apiRouter}/admin/newsletter/subscribers/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subscriber ID" });
      }
      
      const success = await storage.deleteNewsletterSubscriber(id);
      if (!success) {
        return res.status(404).json({ message: "Subscriber not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subscriber" });
    }
  });
  
  // Quote Request Routes
  app.post(`${apiRouter}/quote/request`, async (req: Request, res: Response) => {
    try {
      console.log("[QUOTE REQUEST] Received quote request submission");
      
      // Log sanitized request data (exclude sensitive information)
      const sanitizedBody = { 
        ...req.body,
        email: req.body.email ? "***@***.***" : undefined, 
        phone: req.body.phone ? "***-***-****" : undefined,
        attachments: req.body.attachments ? 
          `${req.body.attachments.length} attachments` : 
          "no attachments"
      };
      console.log("[QUOTE REQUEST] Request data:", JSON.stringify(sanitizedBody));
      
      try {
        console.log("[QUOTE REQUEST] Validating input data with extended schema");
        
        // First validate with the extended schema that includes attachments
        const { attachments, ...quoteData } = quoteRequestWithAttachmentsSchema.parse(req.body);
        
        console.log("[QUOTE REQUEST] Data validation passed");
        
        // Create the quote request
        const quote = await storage.createQuoteRequest(quoteData);
        console.log(`[QUOTE REQUEST] Created quote request with ID: ${quote.id}`);
        
        // Check if there are file attachments to save
        if (attachments && Array.isArray(attachments) && attachments.length > 0) {
          console.log(`[QUOTE REQUEST] Processing ${attachments.length} attachments`);
          
          // Save each attachment
          for (const attachment of attachments) {
            try {
              console.log(`[QUOTE REQUEST] Saving attachment: ${attachment.fileName} (${(attachment.fileSize / 1024).toFixed(2)} KB)`);
              
              if (!attachment.fileUrl || !attachment.fileKey) {
                console.error(`[QUOTE REQUEST] Invalid attachment data for ${attachment.fileName}: missing fileUrl or fileKey`);
                continue; // Skip this attachment but continue with others
              }
              
              // Validate attachment data with the schema
              const validatedAttachment = fileAttachmentSchema.parse(attachment);
              
              await storage.createQuoteRequestAttachment({
                quoteRequestId: quote.id,
                fileName: validatedAttachment.fileName,
                fileUrl: validatedAttachment.fileUrl,
                fileKey: validatedAttachment.fileKey,
                fileSize: validatedAttachment.fileSize,
                fileType: validatedAttachment.fileType
              });
              
              console.log(`[QUOTE REQUEST] Successfully saved attachment: ${attachment.fileName}`);
            } catch (attachmentError) {
              console.error(`[QUOTE REQUEST] Error saving attachment ${attachment.fileName}:`, attachmentError);
              console.error(`[QUOTE REQUEST] Error details:`, attachmentError instanceof Error ? attachmentError.message : String(attachmentError));
              // Continue with the next attachment instead of failing the whole request
            }
          }
        } else {
          console.log("[QUOTE REQUEST] No attachments to process");
        }
        
        console.log("[QUOTE REQUEST] Successfully completed quote request submission");
        res.status(201).json({ 
          message: "Your quote request has been submitted successfully!",
          quote 
        });
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          console.error("[QUOTE REQUEST] Validation error:", validationError.errors);
          return res.status(400).json({ 
            message: "Invalid quote request data", 
            errors: validationError.errors 
          });
        }
        throw validationError; // Re-throw if it's not a validation error
      }
    } catch (error) {
      console.error("[QUOTE REQUEST] Error processing quote request:", error);
      
      if (error instanceof Error) {
        console.error("[QUOTE REQUEST] Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack trace
        });
      }
      
      res.status(500).json({ message: "Failed to process quote request" });
    }
  });
  
  // Admin quote request management
  app.get(`${apiRouter}/admin/quote/requests`, isAdmin, async (req: Request, res: Response) => {
    try {
      const quotes = await storage.getQuoteRequests();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote requests" });
    }
  });
  
  app.get(`${apiRouter}/admin/quote/requests/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote request ID" });
      }
      
      const quote = await storage.getQuoteRequest(id);
      if (!quote) {
        return res.status(404).json({ message: "Quote request not found" });
      }
      
      // Get any attachments for this quote request
      const attachments = await storage.getQuoteRequestAttachments(id);
      
      res.json({
        ...quote,
        attachments: attachments
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote request" });
    }
  });
  
  app.put(`${apiRouter}/admin/quote/requests/:id/status`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote request ID" });
      }
      
      const { status } = req.body;
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Valid status values
      const validStatuses = ['pending', 'reviewing', 'accepted', 'rejected', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status value",
          validValues: validStatuses
        });
      }
      
      const quote = await storage.updateQuoteRequestStatus(id, status);
      if (!quote) {
        return res.status(404).json({ message: "Quote request not found" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to update quote request status" });
    }
  });
  
  app.put(`${apiRouter}/admin/quote/requests/:id/reviewed`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote request ID" });
      }
      
      const quote = await storage.markQuoteRequestAsReviewed(id);
      if (!quote) {
        return res.status(404).json({ message: "Quote request not found" });
      }
      
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark quote request as reviewed" });
    }
  });
  
  app.delete(`${apiRouter}/admin/quote/requests/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote request ID" });
      }
      
      // First delete any attachments for this quote request
      await storage.deleteAllQuoteRequestAttachments(id);
      
      // Then delete the quote request itself
      const success = await storage.deleteQuoteRequest(id);
      if (!success) {
        return res.status(404).json({ message: "Quote request not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quote request" });
    }
  });
  
  // Route to delete a single quote request attachment
  app.delete(`${apiRouter}/admin/quote/requests/attachments/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid attachment ID" });
      }
      
      const success = await storage.deleteQuoteRequestAttachment(id);
      if (!success) {
        return res.status(404).json({ message: "Attachment not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  });

  // Subcontractor Routes
  // Public route to submit subcontractor application
  app.post(`${apiRouter}/subcontractors/apply`, async (req: Request, res: Response) => {
    try {
      console.log("Subcontractor application submitted:", JSON.stringify(req.body, null, 2));
      const subcontractorData = insertSubcontractorSchema.parse(req.body);
      console.log("Parsed subcontractor data:", JSON.stringify(subcontractorData, null, 2));
      const subcontractor = await storage.createSubcontractor(subcontractorData);
      res.status(201).json({ 
        message: "Your application has been submitted successfully", 
        id: subcontractor.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", error.errors);
        return res.status(400).json({ 
          message: "Invalid application data", 
          errors: error.errors 
        });
      }
      console.error("Subcontractor application error:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  // Admin routes to manage subcontractor applications
  app.get(`${apiRouter}/admin/subcontractors`, isAdmin, async (req: Request, res: Response) => {
    try {
      const subcontractors = await storage.getSubcontractors();
      res.json(subcontractors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subcontractor applications" });
    }
  });

  app.get(`${apiRouter}/admin/subcontractors/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subcontractor ID" });
      }
      
      const subcontractor = await storage.getSubcontractor(id);
      if (!subcontractor) {
        return res.status(404).json({ message: "Subcontractor application not found" });
      }
      
      res.json(subcontractor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subcontractor application" });
    }
  });

  app.put(`${apiRouter}/admin/subcontractors/:id/status`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subcontractor ID" });
      }
      
      const { status } = req.body;
      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const subcontractor = await storage.updateSubcontractorStatus(id, status);
      if (!subcontractor) {
        return res.status(404).json({ message: "Subcontractor application not found" });
      }
      
      res.json(subcontractor);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subcontractor status" });
    }
  });

  app.put(`${apiRouter}/admin/subcontractors/:id/notes`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subcontractor ID" });
      }
      
      const { notes } = req.body;
      if (typeof notes !== 'string') {
        return res.status(400).json({ message: "Notes must be a string" });
      }
      
      const subcontractor = await storage.updateSubcontractorNotes(id, notes);
      if (!subcontractor) {
        return res.status(404).json({ message: "Subcontractor application not found" });
      }
      
      res.json(subcontractor);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subcontractor notes" });
    }
  });

  app.delete(`${apiRouter}/admin/subcontractors/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subcontractor ID" });
      }
      
      const success = await storage.deleteSubcontractor(id);
      if (!success) {
        return res.status(404).json({ message: "Subcontractor application not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subcontractor application" });
    }
  });

  // Vendor Routes
  // Public route to submit vendor application
  app.post(`${apiRouter}/vendors/apply`, async (req: Request, res: Response) => {
    try {
      console.log("Vendor application submitted:", JSON.stringify(req.body, null, 2));
      const vendorData = insertVendorSchema.parse(req.body);
      console.log("Parsed vendor data:", JSON.stringify(vendorData, null, 2));
      const vendor = await storage.createVendor(vendorData);
      res.status(201).json({ 
        message: "Your application has been submitted successfully", 
        id: vendor.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod validation error:", error.errors);
        return res.status(400).json({ 
          message: "Invalid application data", 
          errors: error.errors 
        });
      }
      console.error("Vendor application error:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  // Admin routes to manage vendor applications
  app.get(`${apiRouter}/admin/vendors`, isAdmin, async (req: Request, res: Response) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor applications" });
    }
  });

  app.get(`${apiRouter}/admin/vendors/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      
      const vendor = await storage.getVendor(id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor application not found" });
      }
      
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vendor application" });
    }
  });

  app.put(`${apiRouter}/admin/vendors/:id/status`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      
      const { status } = req.body;
      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const vendor = await storage.updateVendorStatus(id, status);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor application not found" });
      }
      
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vendor status" });
    }
  });

  app.put(`${apiRouter}/admin/vendors/:id/notes`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      
      const { notes } = req.body;
      if (typeof notes !== 'string') {
        return res.status(400).json({ message: "Notes must be a string" });
      }
      
      const vendor = await storage.updateVendorNotes(id, notes);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor application not found" });
      }
      
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vendor notes" });
    }
  });

  app.delete(`${apiRouter}/admin/vendors/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vendor ID" });
      }
      
      const success = await storage.deleteVendor(id);
      if (!success) {
        return res.status(404).json({ message: "Vendor application not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vendor application" });
    }
  });

  // Job Postings - Public Routes
  app.get(`${apiRouter}/careers`, async (req: Request, res: Response) => {
    try {
      const jobPostings = await storage.getActiveJobPostings();
      return res.status(200).json(jobPostings);
    } catch (error) {
      console.error("Error fetching job postings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get(`${apiRouter}/careers/featured`, async (req: Request, res: Response) => {
    try {
      const featuredJobs = await storage.getFeaturedJobPostings();
      return res.status(200).json(featuredJobs);
    } catch (error) {
      console.error("Error fetching featured job postings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get(`${apiRouter}/careers/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const jobPosting = await storage.getJobPosting(id);
      
      if (!jobPosting) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      // Only return active jobs to the public
      if (!jobPosting.active) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      return res.status(200).json(jobPosting);
    } catch (error) {
      console.error("Error fetching job posting:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Job Postings - Admin Routes
  app.get(`${apiRouter}/admin/careers`, isAdmin, async (req: Request, res: Response) => {
    try {
      const jobPostings = await storage.getJobPostings();
      return res.status(200).json(jobPostings);
    } catch (error) {
      console.error("Error fetching all job postings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.get(`${apiRouter}/admin/careers/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const jobPosting = await storage.getJobPosting(id);
      
      if (!jobPosting) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      return res.status(200).json(jobPosting);
    } catch (error) {
      console.error("Error fetching job posting:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.post(`${apiRouter}/admin/careers`, isAdmin, async (req: Request, res: Response) => {
    try {
      const result = await storage.createJobPosting(req.body);
      return res.status(201).json(result);
    } catch (error) {
      console.error("Error creating job posting:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put(`${apiRouter}/admin/careers/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedJobPosting = await storage.updateJobPosting(id, req.body);
      
      if (!updatedJobPosting) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      return res.status(200).json(updatedJobPosting);
    } catch (error) {
      console.error("Error updating job posting:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put(`${apiRouter}/admin/careers/:id/toggle-active`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedJobPosting = await storage.toggleJobPostingActive(id);
      
      if (!updatedJobPosting) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      return res.status(200).json(updatedJobPosting);
    } catch (error) {
      console.error("Error toggling job posting active status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.put(`${apiRouter}/admin/careers/:id/toggle-featured`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updatedJobPosting = await storage.toggleJobPostingFeatured(id);
      
      if (!updatedJobPosting) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      return res.status(200).json(updatedJobPosting);
    } catch (error) {
      console.error("Error toggling job posting featured status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete(`${apiRouter}/admin/careers/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteJobPosting(id);
      
      if (result) {
        return res.status(200).json({ message: "Job posting deleted successfully" });
      } else {
        return res.status(404).json({ message: "Job posting not found" });
      }
    } catch (error) {
      console.error("Error deleting job posting:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Team Members API Routes
  app.get(`${apiRouter}/team-members`, async (req: Request, res: Response) => {
    try {
      const teamMembers = await storage.getActiveTeamMembers();
      return res.status(200).json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiRouter}/admin/team-members`, isAdmin, async (req: Request, res: Response) => {
    try {
      const teamMembers = await storage.getTeamMembers();
      return res.status(200).json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiRouter}/admin/team-members/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const teamMember = await storage.getTeamMember(id);
      
      if (teamMember) {
        return res.status(200).json(teamMember);
      } else {
        return res.status(404).json({ message: "Team member not found" });
      }
    } catch (error) {
      console.error("Error fetching team member:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiRouter}/admin/team-members`, isAdmin, async (req: Request, res: Response) => {
    try {
      const teamMember = await storage.createTeamMember(req.body);
      return res.status(201).json(teamMember);
    } catch (error) {
      console.error("Error creating team member:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(`${apiRouter}/admin/team-members/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if photo has been removed to delete the file
      if (req.body.photo === null || req.body.photo === '') {
        const existingTeamMember = await storage.getTeamMember(id);
        if (existingTeamMember && existingTeamMember.photo) {
          // Delete the photo file from the filesystem
          await FileManager.safeDeleteFile(existingTeamMember.photo);
        }
      }
      
      const teamMember = await storage.updateTeamMember(id, req.body);
      
      if (teamMember) {
        return res.status(200).json(teamMember);
      } else {
        return res.status(404).json({ message: "Team member not found" });
      }
    } catch (error) {
      console.error("Error updating team member:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(`${apiRouter}/admin/team-members/:id/toggle-active`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const teamMember = await storage.toggleTeamMemberActive(id);
      
      if (teamMember) {
        return res.status(200).json(teamMember);
      } else {
        return res.status(404).json({ message: "Team member not found" });
      }
    } catch (error) {
      console.error("Error toggling team member active status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(`${apiRouter}/admin/team-members/:id/order`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { order } = req.body;
      
      if (typeof order !== 'number') {
        return res.status(400).json({ message: "Order must be a number" });
      }
      
      const teamMember = await storage.updateTeamMemberOrder(id, order);
      
      if (teamMember) {
        return res.status(200).json(teamMember);
      } else {
        return res.status(404).json({ message: "Team member not found" });
      }
    } catch (error) {
      console.error("Error updating team member order:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(`${apiRouter}/admin/team-members/:id`, isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the team member to retrieve their photo URL before deletion
      const teamMember = await storage.getTeamMember(id);
      
      if (teamMember && teamMember.photo) {
        // Delete the physical file
        await FileManager.safeDeleteFile(teamMember.photo);
      }
      
      const result = await storage.deleteTeamMember(id);
      
      if (result) {
        return res.status(200).json({ message: "Team member deleted successfully" });
      } else {
        return res.status(404).json({ message: "Team member not found" });
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // File management API endpoints are consolidated near line 1065

  // Run scheduled cleanup of old pending files every hour
  setInterval(async () => {
    try {
      const cleanedCount = await FileManager.cleanupOldPendingFiles();
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} old pending files`);
      }
    } catch (error) {
      console.error("Error in scheduled file cleanup:", error);
    }
  }, 3600000); // Run every hour

  const httpServer = createServer(app);
  return httpServer;
}
