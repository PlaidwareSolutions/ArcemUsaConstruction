import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
  insertServiceGallerySchema,
  insertSubcontractorSchema,
  insertVendorSchema
} from "@shared/schema";
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
  // DEVELOPMENT MODE: Always allow admin access for testing purposes
  // TODO: Remove this bypass before production deployment
  const bypassAuth = process.env.NODE_ENV !== 'production';
  
  if (bypassAuth) {
    console.log('⚠️ [DEV MODE] Bypassing admin authentication check for development');
    return next();
  }
  
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden: Admin access required' });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication is already set up in server/index.ts
  // API routes prefix
  const apiRouter = "/api";
  
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
        // First, delete old gallery images that are no longer included
        const existingGallery = await storage.getProjectGallery(id);
        const existingIds = existingGallery.map(img => img.id);
        const updatedIds = galleryImages
          .filter(img => img.id && img.id.toString().startsWith('existing-'))
          .map(img => parseInt(img.id.toString().replace('existing-', '')));
        
        // Delete removed images
        const idsToDelete = existingIds.filter(existingId => !updatedIds.includes(existingId));
        for (const idToDelete of idsToDelete) {
          await storage.deleteProjectGalleryImage(idToDelete);
        }
        
        // Update or add gallery images
        for (let i = 0; i < galleryImages.length; i++) {
          const image = galleryImages[i];
          
          // Check if this is an existing image that needs to be updated
          if (image.id && image.id.toString().startsWith('existing-')) {
            const imageId = parseInt(image.id.toString().replace('existing-', ''));
            
            // Update the existing image
            await storage.updateProjectGalleryImage(imageId, {
              caption: image.caption || '',
              displayOrder: i + 1,
              isFeature: image.isFeature === true
            });
            
            // Set as feature image if marked
            if (image.isFeature === true) {
              await storage.setProjectFeatureImage(id, imageId);
            }
          } else if (image.imageUrl) {
            // Add new image
            await storage.addProjectGalleryImage({
              projectId: id,
              imageUrl: image.imageUrl,
              caption: image.caption || '',
              displayOrder: i + 1,
              isFeature: image.isFeature === true
            });
          }
        }
        
        // Make sure at least one image is marked as feature
        const updatedGallery = await storage.getProjectGallery(id);
        const hasFeatureImage = updatedGallery.some(img => img.isFeature);
        
        if (!hasFeatureImage && updatedGallery.length > 0) {
          await storage.setProjectFeatureImage(id, updatedGallery[0].id);
        }
      }
      
      // Get the updated project data
      const updatedProject = await storage.getProject(id);
      res.json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
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
      
      const image = await storage.addProjectGalleryImage(galleryData);
      res.status(201).json(image);
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
  app.get(`${apiRouter}/blog`, async (req: Request, res: Response) => {
    try {
      const blogPosts = await storage.getPublishedBlogPosts();
      res.json(blogPosts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });
  
  app.get(`${apiRouter}/blog/all`, isAuthenticated, async (req: Request, res: Response) => {
    try {
      const blogPosts = await storage.getBlogPosts();
      res.json(blogPosts);
    } catch (error) {
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
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      // Check if blog post exists
      const post = await storage.getBlogPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      const galleryData = insertBlogGallerySchema.parse({
        ...req.body,
        postId
      });
      
      const galleryImage = await storage.addBlogGalleryImage(galleryData);
      res.status(201).json(galleryImage);
    } catch (error) {
      if (error instanceof z.ZodError) {
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
      const slug = req.params.slug;
      
      const post = await storage.getBlogPostBySlug(slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Get post categories, tags, and gallery images
      const categories = await storage.getBlogPostCategories(post.id);
      const tags = await storage.getBlogPostTags(post.id);
      const galleryImages = await storage.getBlogGallery(post.id);
      
      // Merge post with its categories, tags, and gallery images
      const postWithRelations = {
        ...post,
        categories,
        tags,
        galleryImages
      };
      
      res.json(postWithRelations);
    } catch (error) {
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
      
      const post = await storage.getBlogPost(id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Get post categories, tags, and gallery images
      const categories = await storage.getBlogPostCategories(id);
      const tags = await storage.getBlogPostTags(id);
      const galleryImages = await storage.getBlogGallery(id);
      
      // Merge post with its categories, tags, and gallery images
      const postWithRelations = {
        ...post,
        categories,
        tags,
        galleryImages
      };
      
      res.json(postWithRelations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  
  // Admin-only endpoints for blog management
  app.post(`${apiRouter}/blog`, isAdmin, async (req: Request, res: Response) => {
    try {
      // Use the extended schema that includes categoryIds, tagIds, and galleryImages
      const postData = extendedInsertBlogPostSchema.parse(req.body);
      
      // Extract category and tag IDs, and gallery images
      const { categoryIds, tagIds, galleryImages, ...blogPostData } = postData;
      
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
      if (galleryImages) {
        // First remove all existing gallery images
        await storage.deleteAllBlogGalleryImages(id);
        
        // Then add the new gallery images
        if (galleryImages.length > 0) {
          for (let i = 0; i < galleryImages.length; i++) {
            const galleryImage = {
              postId: id,
              imageUrl: galleryImages[i].imageUrl,
              caption: galleryImages[i].caption || null,
              order: galleryImages[i].order || i // Use provided order or index as default
            };
            await storage.addBlogGalleryImage(galleryImage);
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
      
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const updatedService = await storage.updateService(id, serviceData);
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
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
      
      console.log(`Cleaning up files for session ${sessionId || '*'}`);
      if (preserveUrls && Array.isArray(preserveUrls) && preserveUrls.length > 0) {
        console.log(`With ${preserveUrls.length} files to preserve`);
      }
      
      let deletedFiles: string[] = [];
      let failedFiles: string[] = [];
      let preservedFiles: string[] = [];
      
      // If fileUrls array is provided, delete each file in the array
      if (fileUrls && Array.isArray(fileUrls) && fileUrls.length > 0) {
        console.log(`Cleaning up ${fileUrls.length} specific files`);
        
        for (const url of fileUrls) {
          try {
            // Skip if this URL is in the preserve list
            if (preserveUrls && Array.isArray(preserveUrls) && preserveUrls.includes(url)) {
              console.log(`Skipping preserved file: ${url}`);
              preservedFiles.push(url);
              continue;
            }
            
            const result = await FileManager.cleanupSession(sessionId || '*', url, preserveUrls);
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
        console.log(`Cleaning up specific file: ${fileUrl}`);
        
        // Skip if this URL is in the preserve list
        if (preserveUrls && Array.isArray(preserveUrls) && preserveUrls.includes(fileUrl)) {
          console.log(`Skipping preserved file: ${fileUrl}`);
          preservedFiles.push(fileUrl);
        } else {
          // Extract the file key if it's an UploadThing URL for better logging
          const fileKey = extractUploadThingKeyFromUrl(fileUrl);
          if (fileKey) {
            console.log(`File key to delete: ${fileKey}`);
          }
          
          try {
            // Handle individual file deletion with updated cleanupSession method
            // Use wildcard session ID '*' when deleting a specific file with no session context
            const result = await FileManager.cleanupSession(sessionId || '*', fileUrl, preserveUrls);
            
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
        console.log(`Cleaning up entire session: ${sessionId}`);
        try {
          const result = await FileManager.cleanupSession(sessionId, undefined, preserveUrls);
          deletedFiles = result.deletedUrls;
          failedFiles = result.failedUrls;
          preservedFiles = result.preservedUrls;
        } catch (sessionError) {
          console.error(`Error cleaning up session ${sessionId}:`, sessionError);
        }
      }
      
      console.log(`Cleanup completed: ${deletedFiles.length} files deleted, ${failedFiles.length} failed, ${preservedFiles.length} preserved`);
      
      return res.status(200).json({ 
        success: true,
        message: fileUrl 
          ? (deletedFiles.length > 0 ? `Deleted file: ${fileUrl}` : 
             preservedFiles.includes(fileUrl) ? `Preserved file: ${fileUrl}` : 
             `Failed to delete file: ${fileUrl}`)
          : `Cleaned up ${deletedFiles.length} files (${preservedFiles.length} preserved)`,
        deletedFiles, // Return the actual array of deleted files
        deletedCount: deletedFiles.length,
        failedFiles,
        failedCount: failedFiles.length,
        preservedFiles,
        preservedCount: preservedFiles.length
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
        const updatedSubscriber = await storage.updateNewsletterSubscriber(
          existingSubscriber.id, 
          { subscribed: true }
        );
        
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
      const updatedSubscriber = await storage.updateNewsletterSubscriber(
        subscriber.id, 
        { subscribed: false }
      );
      
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
      // Validate the input data
      const quoteData = insertQuoteRequestSchema.parse(req.body);
      
      // Create the quote request
      const quote = await storage.createQuoteRequest(quoteData);
      
      res.status(201).json({ 
        message: "Your quote request has been submitted successfully!",
        quote 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid quote request data", 
          errors: error.errors 
        });
      }
      console.error("Quote request error:", error);
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
      
      res.json(quote);
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
      
      const success = await storage.deleteQuoteRequest(id);
      if (!success) {
        return res.status(404).json({ message: "Quote request not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quote request" });
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
