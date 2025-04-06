import { eq, ne, and, inArray, count } from "drizzle-orm";
import { db } from "./db";
import { 
  users, projects, projectGallery, blogCategories, blogTags, blogPosts, 
  blogPostCategories, blogPostTags, blogGallery,
  testimonials, services, serviceGallery, messages, newsletterSubscribers, quoteRequests,
  quoteRequestAttachments, subcontractors, vendors, jobPostings, teamMembers,
  type User, type InsertUser, 
  type Project, type InsertProject,
  type ProjectGallery, type InsertProjectGallery,
  type BlogCategory, type InsertBlogCategory,
  type BlogTag, type InsertBlogTag, 
  type BlogPost, type InsertBlogPost,
  type BlogGallery, type InsertBlogGallery,
  type Testimonial, type InsertTestimonial, 
  type Service, type InsertService, 
  type ServiceGallery, type InsertServiceGallery,
  type Message, type InsertMessage,
  type NewsletterSubscriber, type InsertNewsletterSubscriber,
  type QuoteRequest, type InsertQuoteRequest,
  type QuoteRequestAttachment, type InsertQuoteRequestAttachment,
  type Subcontractor, type InsertSubcontractor,
  type Vendor, type InsertVendor,
  type JobPosting, type InsertJobPosting,
  type TeamMember, type InsertTeamMember
} from "../shared/schema";
import { IStorage } from "./storage";
import { FileManager, extractUploadThingKeyFromUrl } from './utils/fileManager';

export class DBStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(projects.createdAt);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const results = await db.select().from(projects).where(eq(projects.id, id));
    return results[0];
  }

  async getFeaturedProjects(): Promise<Project[]> {
    try {
      const featuredProjects = await db.select().from(projects).where(eq(projects.featured, true));
      return featuredProjects;
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      return [];
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: number, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await db.update(projects)
      .set(projectUpdate)
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  async deleteProject(id: number): Promise<boolean> {
    // First delete all gallery images for this project
    await this.deleteAllProjectGalleryImages(id);
    // Then delete the project
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }
  
  // Project Gallery
  async getProjectGallery(projectId: number): Promise<ProjectGallery[]> {
    return db.select()
      .from(projectGallery)
      .where(eq(projectGallery.projectId, projectId))
      .orderBy(projectGallery.displayOrder);
  }
  
  async addProjectGalleryImage(galleryImage: InsertProjectGallery): Promise<ProjectGallery> {
    const result = await db.insert(projectGallery).values(galleryImage).returning();
    return result[0];
  }
  
  async updateProjectGalleryImage(id: number, galleryImageUpdate: Partial<InsertProjectGallery>): Promise<ProjectGallery | undefined> {
    const result = await db.update(projectGallery)
      .set(galleryImageUpdate)
      .where(eq(projectGallery.id, id))
      .returning();
    return result[0];
  }
  
  // Helper method to check if an image URL is used in any other entity
  private async isImageUsedElsewhere(imageUrl: string, excludeProjectGalleryId?: number, excludeProjectId?: number): Promise<boolean> {
    // Build an array of conditions to check across multiple tables
    const queries = [];
    
    // Check project gallery
    if (excludeProjectGalleryId) {
      queries.push(
        db.select({ count: count() }).from(projectGallery)
          .where(and(
            ne(projectGallery.id, excludeProjectGalleryId),
            eq(projectGallery.imageUrl, imageUrl)
          ))
      );
    } else if (excludeProjectId) {
      queries.push(
        db.select({ count: count() }).from(projectGallery)
          .where(and(
            ne(projectGallery.projectId, excludeProjectId),
            eq(projectGallery.imageUrl, imageUrl)
          ))
      );
    } else {
      queries.push(
        db.select({ count: count() }).from(projectGallery)
          .where(eq(projectGallery.imageUrl, imageUrl))
      );
    }
    
    // Check project main images
    if (excludeProjectId) {
      queries.push(
        db.select({ count: count() }).from(projects)
          .where(and(
            ne(projects.id, excludeProjectId),
            eq(projects.image, imageUrl)
          ))
      );
    } else {
      queries.push(
        db.select({ count: count() }).from(projects)
          .where(eq(projects.image, imageUrl))
      );
    }
    
    // Also check service gallery and blog gallery tables
    queries.push(
      db.select({ count: count() }).from(serviceGallery).where(eq(serviceGallery.imageUrl, imageUrl)),
      db.select({ count: count() }).from(blogGallery).where(eq(blogGallery.imageUrl, imageUrl))
    );
    
    // Check image columns in blog posts (using correct column name)
    queries.push(
      db.select({ count: count() }).from(blogPosts).where(eq(blogPosts.image, imageUrl))
    );
    
    // Execute all queries concurrently
    const results = await Promise.all(queries);
    
    // If any query returns a count > 0, the image is used elsewhere
    return results.some(result => result[0]?.count > 0);
  }

  async deleteProjectGalleryImage(id: number): Promise<boolean> {
    // First fetch the image to get its URL
    const imageToDelete = await db.select().from(projectGallery).where(eq(projectGallery.id, id));
    
    if (imageToDelete.length > 0) {
      const imageUrl = imageToDelete[0].imageUrl;
      const projectId = imageToDelete[0].projectId;
      
      console.log(`[dbStorage] Processing deletion of project gallery image (ID: ${id}, project: ${projectId})`);
      
      // Check if this image is used elsewhere before deleting it from UploadThing
      const isUsedElsewhere = await this.isImageUsedElsewhere(imageUrl, id, projectId);
      
      if (isUsedElsewhere) {
        console.log(`[dbStorage] Preserving file ${imageUrl} as it is referenced elsewhere`);
      } else {
        console.log(`[dbStorage] Image not used elsewhere, deleting from UploadThing: ${imageUrl}`);
        // Extract UploadThing key and delete the file
        const key = extractUploadThingKeyFromUrl(imageUrl);
        if (key) {
          try {
            console.log(`[dbStorage] Deleting UploadThing file with key: ${key}`);
            await FileManager.deleteFile(imageUrl);
          } catch (error) {
            console.error(`[dbStorage] Error deleting file from UploadThing:`, error);
          }
        }
      }
      
      // Delete from database
      const result = await db.delete(projectGallery).where(eq(projectGallery.id, id)).returning();
      return result.length > 0;
    }
    
    return false;
  }
  
  async deleteAllProjectGalleryImages(projectId: number): Promise<boolean> {
    // First get all gallery images for this project
    const imagesToDelete = await db.select().from(projectGallery).where(eq(projectGallery.projectId, projectId));
    
    console.log(`[dbStorage] Processing deletion of all gallery images for project ${projectId} (${imagesToDelete.length} images)`);
    
    // First delete all images from the database to avoid race conditions
    const result = await db.delete(projectGallery)
      .where(eq(projectGallery.projectId, projectId))
      .returning();
    
    // Then check and delete each image file safely
    for (const image of imagesToDelete) {
      const imageUrl = image.imageUrl;
      
      // Check if this image is used elsewhere (now that we've deleted the gallery entries)
      const isImageUsedElsewhere = await this.isImageUsedElsewhere(imageUrl);
      
      if (isImageUsedElsewhere) {
        console.log(`[dbStorage] Preserving file ${imageUrl} as it's used elsewhere in the system`);
      } else {
        console.log(`[dbStorage] File ${imageUrl} is not used elsewhere, deleting from storage`);
        await FileManager.deleteFile(imageUrl);
      }
    }
    
    return result.length > 0 || imagesToDelete.length > 0;
  }
  
  async setProjectFeatureImage(projectId: number, galleryImageId: number): Promise<ProjectGallery | undefined> {
    // First, reset all feature flags for this project's gallery images
    await db.update(projectGallery)
      .set({ isFeature: false })
      .where(eq(projectGallery.projectId, projectId))
      .execute();
    
    // Then, set the selected image as the feature image
    const updatedImages = await db.update(projectGallery)
      .set({ isFeature: true })
      .where(and(
        eq(projectGallery.id, galleryImageId),
        eq(projectGallery.projectId, projectId)
      ))
      .returning();
    
    if (updatedImages.length === 0) {
      return undefined;
    }
    
    const featureImage = updatedImages[0];
    
    // Update the project's main image field to use this feature image
    await db.update(projects)
      .set({ image: featureImage.imageUrl })
      .where(eq(projects.id, projectId))
      .execute();
    
    return featureImage;
  }

  // Blog Posts
  async getBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts).orderBy(blogPosts.createdAt);
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(blogPosts.createdAt);
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const results = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return results[0];
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const results = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return results[0];
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(post).returning();
    return result[0];
  }

  async updateBlogPost(id: number, postUpdate: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const result = await db.update(blogPosts)
      .set(postUpdate)
      .where(eq(blogPosts.id, id))
      .returning();
    return result[0];
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    // First delete all blog gallery images
    await this.deleteAllBlogGalleryImages(id);
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    return result.length > 0;
  }
  
  // Blog Gallery
  async getBlogGallery(postId: number): Promise<BlogGallery[]> {
    return db.select()
      .from(blogGallery)
      .where(eq(blogGallery.postId, postId))
      .orderBy(blogGallery.order);
  }

  async addBlogGalleryImage(galleryImage: InsertBlogGallery): Promise<BlogGallery> {
    console.log(`[DB STORAGE] Attempting to add blog gallery image:`, galleryImage);
    try {
      const result = await db.insert(blogGallery).values(galleryImage).returning();
      console.log(`[DB STORAGE] Successfully added blog gallery image:`, result[0]);
      return result[0];
    } catch (error) {
      console.error(`[DB STORAGE ERROR] Failed to add blog gallery image:`, error);
      throw error;
    }
  }

  async updateBlogGalleryImage(id: number, galleryImageUpdate: Partial<InsertBlogGallery>): Promise<BlogGallery | undefined> {
    const result = await db.update(blogGallery)
      .set(galleryImageUpdate)
      .where(eq(blogGallery.id, id))
      .returning();
    return result[0];
  }

  async deleteBlogGalleryImage(id: number): Promise<boolean> {
    // First fetch the image to get its URL
    const imageToDelete = await db.select().from(blogGallery).where(eq(blogGallery.id, id));
    
    if (imageToDelete.length > 0) {
      const imageUrl = imageToDelete[0].imageUrl;
      const postId = imageToDelete[0].postId;
      
      console.log(`[dbStorage] Processing deletion of blog gallery image (ID: ${id}, post: ${postId})`);
      
      // Check if this image is used elsewhere before deleting it from UploadThing
      const isUsedElsewhere = await this.isImageUsedElsewhere(imageUrl, id);
      
      if (isUsedElsewhere) {
        console.log(`[dbStorage] Preserving file ${imageUrl} as it is referenced elsewhere`);
      } else {
        console.log(`[dbStorage] Image not used elsewhere, deleting from UploadThing: ${imageUrl}`);
        // Extract UploadThing key and delete the file
        const key = extractUploadThingKeyFromUrl(imageUrl);
        if (key) {
          try {
            console.log(`[dbStorage] Deleting UploadThing file with key: ${key}`);
            await FileManager.deleteFile(imageUrl);
          } catch (error) {
            console.error(`[dbStorage] Error deleting file from UploadThing:`, error);
          }
        }
      }
      
      // Delete from database
      const result = await db.delete(blogGallery).where(eq(blogGallery.id, id)).returning();
      return result.length > 0;
    }
    
    return false;
  }

  async deleteAllBlogGalleryImages(postId: number): Promise<boolean> {
    // First get all gallery images for this post
    const imagesToDelete = await db.select().from(blogGallery).where(eq(blogGallery.postId, postId));
    
    console.log(`[dbStorage] Processing deletion of all gallery images for blog post ${postId} (${imagesToDelete.length} images)`);
    
    // Check and delete each image safely
    for (const image of imagesToDelete) {
      const imageUrl = image.imageUrl;
      
      // Check if this image is used elsewhere (other blog posts, or as main image)
      const otherImagesWithSameUrl = await db.select().from(blogGallery)
        .where(and(
          ne(blogGallery.postId, postId),
          eq(blogGallery.imageUrl, imageUrl)
        ));
      
      const postsWithSameImage = await db.select().from(blogPosts)
        .where(and(
          ne(blogPosts.id, postId),
          eq(blogPosts.image, imageUrl)
        ));
      
      const isImageUsedElsewhere = otherImagesWithSameUrl.length > 0 || postsWithSameImage.length > 0;
      
      if (isImageUsedElsewhere) {
        console.log(`[dbStorage] Preserving file ${imageUrl} as it's used elsewhere in the system`);
      } else {
        console.log(`[dbStorage] File ${imageUrl} is not used elsewhere, deleting from storage`);
        await FileManager.deleteFile(imageUrl);
      }
    }
    
    // Delete all gallery entries from database
    const result = await db.delete(blogGallery)
      .where(eq(blogGallery.postId, postId))
      .returning();
    
    return result.length > 0 || imagesToDelete.length > 0;
  }
  
  // Blog Categories
  async getBlogCategories(): Promise<SimpleBlogCategory[]> {
    // Use raw SQL to avoid schema mismatch
    const results = await db.execute(
      'SELECT id, name, slug, description FROM blog_categories'
    );
    return results;
  }
  
  async getBlogCategory(id: number): Promise<SimpleBlogCategory | undefined> {
    // Use raw SQL to avoid schema mismatch
    const results = await db.execute(
      'SELECT id, name, slug, description FROM blog_categories WHERE id = $1',
      [id]
    );
    return results[0];
  }
  
  async createBlogCategory(category: InsertBlogCategory): Promise<SimpleBlogCategory> {
    // Use raw SQL to avoid schema mismatch
    await db.execute(
      'INSERT INTO blog_categories (name, slug, description) VALUES ($1, $2, $3)',
      [category.name, category.slug, category.description || null]
    );
    
    // Fetch the newly created category
    const results = await db.execute(
      'SELECT id, name, slug, description FROM blog_categories WHERE slug = $1',
      [category.slug]
    );
    return results[0];
  }
  
  // Blog Tags
  async getBlogTags(): Promise<SimpleBlogTag[]> {
    // Use raw SQL to avoid schema mismatch
    const results = await db.execute(
      'SELECT id, name, slug FROM blog_tags'
    );
    return results;
  }
  
  async getBlogTag(id: number): Promise<SimpleBlogTag | undefined> {
    // Use raw SQL to avoid schema mismatch
    const results = await db.execute(
      'SELECT id, name, slug FROM blog_tags WHERE id = $1',
      [id]
    );
    return results[0];
  }
  
  async createBlogTag(tag: InsertBlogTag): Promise<SimpleBlogTag> {
    // Use raw SQL to avoid schema mismatch
    await db.execute(
      'INSERT INTO blog_tags (name, slug) VALUES ($1, $2)',
      [tag.name, tag.slug]
    );
    
    // Fetch the newly created tag
    const results = await db.execute(
      'SELECT id, name, slug FROM blog_tags WHERE slug = $1',
      [tag.slug]
    );
    return results[0];
  }
  
  // Blog Post Categories
  async getBlogPostCategories(postId: number): Promise<SimpleBlogCategory[]> {
    const results = await db
      .select({
        id: blogCategories.id,
        name: blogCategories.name,
        slug: blogCategories.slug,
        description: blogCategories.description
        // Removed createdAt field as it seems to be missing in the database
      })
      .from(blogCategories)
      .innerJoin(blogPostCategories, 
        eq(blogCategories.id, blogPostCategories.categoryId))
      .where(eq(blogPostCategories.postId, postId));
      
    return results;
  }
  
  async linkBlogPostCategories(postId: number, categoryIds: number[]): Promise<void> {
    if (categoryIds.length === 0) return;
    
    const values = categoryIds.map(categoryId => ({
      postId,
      categoryId
    }));
    
    await db.insert(blogPostCategories).values(values);
  }
  
  async updateBlogPostCategories(postId: number, categoryIds: number[]): Promise<void> {
    // Delete existing relationships
    await db.delete(blogPostCategories)
      .where(eq(blogPostCategories.postId, postId));
      
    // Add new relationships if any
    if (categoryIds.length > 0) {
      await this.linkBlogPostCategories(postId, categoryIds);
    }
  }
  
  // Blog Post Tags
  async getBlogPostTags(postId: number): Promise<SimpleBlogTag[]> {
    const results = await db
      .select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug
        // Removed createdAt field as it seems to be missing in the database
      })
      .from(blogTags)
      .innerJoin(blogPostTags, 
        eq(blogTags.id, blogPostTags.tagId))
      .where(eq(blogPostTags.postId, postId));
      
    return results;
  }
  
  async linkBlogPostTags(postId: number, tagIds: number[]): Promise<void> {
    if (tagIds.length === 0) return;
    
    const values = tagIds.map(tagId => ({
      postId,
      tagId
    }));
    
    await db.insert(blogPostTags).values(values);
  }
  
  async updateBlogPostTags(postId: number, tagIds: number[]): Promise<void> {
    // Delete existing relationships
    await db.delete(blogPostTags)
      .where(eq(blogPostTags.postId, postId));
      
    // Add new relationships if any
    if (tagIds.length > 0) {
      await this.linkBlogPostTags(postId, tagIds);
    }
  }

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    return db.select().from(testimonials);
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return db.select()
      .from(testimonials)
      .where(eq(testimonials.approved, true));
  }

  async getPendingTestimonials(): Promise<Testimonial[]> {
    return db.select()
      .from(testimonials)
      .where(eq(testimonials.approved, false));
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    const results = await db.select()
      .from(testimonials)
      .where(eq(testimonials.id, id));
    return results[0];
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const result = await db.insert(testimonials)
      .values(testimonial)
      .returning();
    return result[0];
  }

  async updateTestimonial(id: number, testimonialData: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const results = await db.update(testimonials)
      .set(testimonialData)
      .where(eq(testimonials.id, id))
      .returning();
    return results[0];
  }

  async approveTestimonial(id: number): Promise<Testimonial | undefined> {
    const results = await db.update(testimonials)
      .set({ approved: true })
      .where(eq(testimonials.id, id))
      .returning();
    return results[0];
  }
  
  async revokeTestimonialApproval(id: number): Promise<Testimonial | undefined> {
    const results = await db.update(testimonials)
      .set({ approved: false })
      .where(eq(testimonials.id, id))
      .returning();
    return results[0];
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    const result = await db.delete(testimonials)
      .where(eq(testimonials.id, id))
      .returning();
    return result.length > 0;
  }

  // Services
  async getServices(): Promise<Service[]> {
    return db.select().from(services);
  }

  async getService(id: number): Promise<Service | undefined> {
    const results = await db.select().from(services).where(eq(services.id, id));
    return results[0];
  }

  async createService(service: InsertService): Promise<Service> {
    const result = await db.insert(services).values(service).returning();
    return result[0];
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const result = await db.update(services)
      .set(serviceUpdate)
      .where(eq(services.id, id))
      .returning();
    return result[0];
  }

  async deleteService(id: number): Promise<boolean> {
    // First delete all gallery images for this service
    await this.deleteAllServiceGalleryImages(id);
    // Then delete the service
    const result = await db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }
  
  // Service Gallery
  async getServiceGallery(serviceId: number): Promise<ServiceGallery[]> {
    return db.select()
      .from(serviceGallery)
      .where(eq(serviceGallery.serviceId, serviceId))
      .orderBy(serviceGallery.order);
  }
  
  async addServiceGalleryImage(galleryImage: InsertServiceGallery): Promise<ServiceGallery> {
    const result = await db.insert(serviceGallery).values(galleryImage).returning();
    return result[0];
  }
  
  async updateServiceGalleryImage(id: number, galleryImageUpdate: Partial<InsertServiceGallery>): Promise<ServiceGallery | undefined> {
    const result = await db.update(serviceGallery)
      .set(galleryImageUpdate)
      .where(eq(serviceGallery.id, id))
      .returning();
    return result[0];
  }
  
  async deleteServiceGalleryImage(id: number): Promise<boolean> {
    // First fetch the image to get its URL
    const imageToDelete = await db.select().from(serviceGallery).where(eq(serviceGallery.id, id));
    
    if (imageToDelete.length > 0) {
      const imageUrl = imageToDelete[0].imageUrl;
      const serviceId = imageToDelete[0].serviceId;
      
      console.log(`[dbStorage] Processing deletion of service gallery image (ID: ${id}, service: ${serviceId})`);
      
      // Check if this image is used elsewhere before deleting it from UploadThing
      const isUsedElsewhere = await this.isImageUsedElsewhere(imageUrl, id);
      
      if (isUsedElsewhere) {
        console.log(`[dbStorage] Preserving file ${imageUrl} as it is referenced elsewhere`);
      } else {
        console.log(`[dbStorage] Image not used elsewhere, deleting from UploadThing: ${imageUrl}`);
        // Extract UploadThing key and delete the file
        const key = extractUploadThingKeyFromUrl(imageUrl);
        if (key) {
          try {
            console.log(`[dbStorage] Deleting UploadThing file with key: ${key}`);
            await FileManager.deleteFile(imageUrl);
          } catch (error) {
            console.error(`[dbStorage] Error deleting file from UploadThing:`, error);
          }
        }
      }
      
      // Delete from database
      const result = await db.delete(serviceGallery).where(eq(serviceGallery.id, id)).returning();
      return result.length > 0;
    }
    
    return false;
  }
  
  async deleteAllServiceGalleryImages(serviceId: number): Promise<boolean> {
    // First get all gallery images for this service
    const imagesToDelete = await db.select().from(serviceGallery).where(eq(serviceGallery.serviceId, serviceId));
    
    console.log(`[dbStorage] Processing deletion of all gallery images for service ${serviceId} (${imagesToDelete.length} images)`);
    
    // Check and delete each image safely
    for (const image of imagesToDelete) {
      const imageUrl = image.imageUrl;
      
      // Check if this image is used elsewhere in other service galleries
      const otherImagesWithSameUrl = await db.select().from(serviceGallery)
        .where(and(
          ne(serviceGallery.serviceId, serviceId),
          eq(serviceGallery.imageUrl, imageUrl)
        ));
      
      // Also check if this image is used in other galleries (projects, blogs)
      const projectGalleryWithSameUrl = await db.select().from(projectGallery)
        .where(eq(projectGallery.imageUrl, imageUrl));
        
      const blogGalleryWithSameUrl = await db.select().from(blogGallery)
        .where(eq(blogGallery.imageUrl, imageUrl));
      
      const isImageUsedElsewhere = 
        otherImagesWithSameUrl.length > 0 || 
        projectGalleryWithSameUrl.length > 0 || 
        blogGalleryWithSameUrl.length > 0;
      
      if (isImageUsedElsewhere) {
        console.log(`[dbStorage] Preserving file ${imageUrl} as it's used elsewhere in the system`);
      } else {
        console.log(`[dbStorage] File ${imageUrl} is not used elsewhere, deleting from storage`);
        await FileManager.deleteFile(imageUrl);
      }
    }
    
    // Delete all gallery entries from database
    const result = await db.delete(serviceGallery)
      .where(eq(serviceGallery.serviceId, serviceId))
      .returning();
    
    return result.length > 0 || imagesToDelete.length > 0;
  }

  // Messages/Contact
  async getMessages(): Promise<Message[]> {
    return db.select().from(messages).orderBy(messages.createdAt);
  }

  async getMessage(id: number): Promise<Message | undefined> {
    const results = await db.select().from(messages).where(eq(messages.id, id));
    return results[0];
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const result = await db.update(messages)
      .set({ read: true })
      .where(eq(messages.id, id))
      .returning();
    return result[0];
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await db.delete(messages)
      .where(eq(messages.id, id))
      .returning();
    return result.length > 0;
  }

  // Newsletter Subscribers
  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return await db.select().from(newsletterSubscribers);
  }

  async getNewsletterSubscriber(id: number): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
    return subscriber || undefined;
  }

  async getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    return subscriber || undefined;
  }

  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [result] = await db.insert(newsletterSubscribers).values(subscriber).returning();
    return result;
  }

  async updateNewsletterSubscriber(id: number, updates: Partial<InsertNewsletterSubscriber>): Promise<NewsletterSubscriber | undefined> {
    const [result] = await db.update(newsletterSubscribers)
      .set(updates)
      .where(eq(newsletterSubscribers.id, id))
      .returning();
    return result;
  }
  
  async updateNewsletterSubscriberStatus(id: number, subscribed: boolean): Promise<NewsletterSubscriber | undefined> {
    const [result] = await db.update(newsletterSubscribers)
      .set({ subscribed })
      .where(eq(newsletterSubscribers.id, id))
      .returning();
    return result;
  }

  async deleteNewsletterSubscriber(id: number): Promise<boolean> {
    const result = await db.delete(newsletterSubscribers)
      .where(eq(newsletterSubscribers.id, id))
      .returning();
    return result.length > 0;
  }

  // Quote Requests
  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return await db.select().from(quoteRequests);
  }

  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    const [request] = await db.select().from(quoteRequests).where(eq(quoteRequests.id, id));
    return request || undefined;
  }

  async createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest> {
    const [result] = await db.insert(quoteRequests).values(request).returning();
    return result;
  }

  async updateQuoteRequest(id: number, updates: Partial<QuoteRequest>): Promise<QuoteRequest | undefined> {
    const [result] = await db.update(quoteRequests)
      .set(updates)
      .where(eq(quoteRequests.id, id))
      .returning();
    return result;
  }

  async markQuoteRequestAsReviewed(id: number): Promise<QuoteRequest | undefined> {
    const [result] = await db.update(quoteRequests)
      .set({ reviewed: true })
      .where(eq(quoteRequests.id, id))
      .returning();
    return result;
  }

  async updateQuoteRequestStatus(id: number, status: string): Promise<QuoteRequest | undefined> {
    const [result] = await db.update(quoteRequests)
      .set({ status })
      .where(eq(quoteRequests.id, id))
      .returning();
    return result;
  }

  async deleteQuoteRequest(id: number): Promise<boolean> {
    // Delete all attachments first (cascade should handle this, but let's be explicit)
    await this.deleteAllQuoteRequestAttachments(id);
    
    const result = await db.delete(quoteRequests)
      .where(eq(quoteRequests.id, id))
      .returning();
    return result.length > 0;
  }
  
  // Quote Request Attachments
  async getQuoteRequestAttachments(quoteRequestId: number): Promise<QuoteRequestAttachment[]> {
    return db.select()
      .from(quoteRequestAttachments)
      .where(eq(quoteRequestAttachments.quoteRequestId, quoteRequestId));
  }
  
  async createQuoteRequestAttachment(attachment: InsertQuoteRequestAttachment): Promise<QuoteRequestAttachment> {
    const [result] = await db.insert(quoteRequestAttachments).values(attachment).returning();
    return result;
  }
  
  async deleteQuoteRequestAttachment(id: number): Promise<boolean> {
    const result = await db.delete(quoteRequestAttachments)
      .where(eq(quoteRequestAttachments.id, id))
      .returning();
    return result.length > 0;
  }
  
  async deleteAllQuoteRequestAttachments(quoteRequestId: number): Promise<boolean> {
    const result = await db.delete(quoteRequestAttachments)
      .where(eq(quoteRequestAttachments.quoteRequestId, quoteRequestId))
      .returning();
    return true;
  }

  // Subcontractors
  async getSubcontractors(): Promise<Subcontractor[]> {
    return db.select().from(subcontractors).orderBy(subcontractors.createdAt);
  }

  async getSubcontractor(id: number): Promise<Subcontractor | undefined> {
    const [result] = await db.select()
      .from(subcontractors)
      .where(eq(subcontractors.id, id));
    return result;
  }

  async createSubcontractor(subcontractor: InsertSubcontractor): Promise<Subcontractor> {
    const [result] = await db.insert(subcontractors)
      .values(subcontractor)
      .returning();
    return result;
  }

  async updateSubcontractor(id: number, updates: Partial<InsertSubcontractor>): Promise<Subcontractor | undefined> {
    const [result] = await db.update(subcontractors)
      .set(updates)
      .where(eq(subcontractors.id, id))
      .returning();
    return result;
  }

  async updateSubcontractorStatus(id: number, status: string): Promise<Subcontractor | undefined> {
    const [result] = await db.update(subcontractors)
      .set({ status })
      .where(eq(subcontractors.id, id))
      .returning();
    return result;
  }

  async updateSubcontractorNotes(id: number, notes: string): Promise<Subcontractor | undefined> {
    const [result] = await db.update(subcontractors)
      .set({ notes })
      .where(eq(subcontractors.id, id))
      .returning();
    return result;
  }

  async deleteSubcontractor(id: number): Promise<boolean> {
    const result = await db.delete(subcontractors)
      .where(eq(subcontractors.id, id))
      .returning();
    return result.length > 0;
  }

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return db.select().from(vendors).orderBy(vendors.createdAt);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [result] = await db.select()
      .from(vendors)
      .where(eq(vendors.id, id));
    return result;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [result] = await db.insert(vendors)
      .values(vendor)
      .returning();
    return result;
  }

  async updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [result] = await db.update(vendors)
      .set(updates)
      .where(eq(vendors.id, id))
      .returning();
    return result;
  }

  async updateVendorStatus(id: number, status: string): Promise<Vendor | undefined> {
    const [result] = await db.update(vendors)
      .set({ status })
      .where(eq(vendors.id, id))
      .returning();
    return result;
  }

  async updateVendorNotes(id: number, notes: string): Promise<Vendor | undefined> {
    const [result] = await db.update(vendors)
      .set({ notes })
      .where(eq(vendors.id, id))
      .returning();
    return result;
  }

  async deleteVendor(id: number): Promise<boolean> {
    const result = await db.delete(vendors)
      .where(eq(vendors.id, id))
      .returning();
    return result.length > 0;
  }

  // Job Postings
  async getJobPostings(): Promise<JobPosting[]> {
    return db.select().from(jobPostings).orderBy(jobPostings.createdAt);
  }

  async getActiveJobPostings(): Promise<JobPosting[]> {
    return db.select()
      .from(jobPostings)
      .where(eq(jobPostings.active, true))
      .orderBy(jobPostings.createdAt);
  }

  async getFeaturedJobPostings(): Promise<JobPosting[]> {
    return db.select()
      .from(jobPostings)
      .where(
        and(
          eq(jobPostings.active, true),
          eq(jobPostings.featured, true)
        )
      )
      .orderBy(jobPostings.createdAt);
  }

  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    const results = await db.select()
      .from(jobPostings)
      .where(eq(jobPostings.id, id));
    return results[0];
  }

  async createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting> {
    const result = await db.insert(jobPostings).values(jobPosting).returning();
    return result[0];
  }

  async updateJobPosting(id: number, jobPostingUpdate: Partial<InsertJobPosting>): Promise<JobPosting | undefined> {
    const result = await db.update(jobPostings)
      .set(jobPostingUpdate)
      .where(eq(jobPostings.id, id))
      .returning();
    return result[0];
  }

  async toggleJobPostingActive(id: number): Promise<JobPosting | undefined> {
    // First get the current status
    const currentJob = await this.getJobPosting(id);
    if (!currentJob) {
      return undefined;
    }

    // Then toggle the active status
    const result = await db.update(jobPostings)
      .set({ active: !currentJob.active })
      .where(eq(jobPostings.id, id))
      .returning();
    return result[0];
  }

  async toggleJobPostingFeatured(id: number): Promise<JobPosting | undefined> {
    // First get the current status
    const currentJob = await this.getJobPosting(id);
    if (!currentJob) {
      return undefined;
    }

    // Then toggle the featured status
    const result = await db.update(jobPostings)
      .set({ featured: !currentJob.featured })
      .where(eq(jobPostings.id, id))
      .returning();
    return result[0];
  }

  async deleteJobPosting(id: number): Promise<boolean> {
    const result = await db.delete(jobPostings)
      .where(eq(jobPostings.id, id))
      .returning();
    return result.length > 0;
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const result = await db.select().from(teamMembers).orderBy(teamMembers.order);
      return result;
    } catch (error) {
      console.error("Error in getTeamMembers:", error);
      return [];
    }
  }

  async getActiveTeamMembers(): Promise<TeamMember[]> {
    try {
      const result = await db.select()
        .from(teamMembers)
        .where(eq(teamMembers.active, true))
        .orderBy(teamMembers.order);
      return result;
    } catch (error) {
      console.error("Error in getActiveTeamMembers:", error);
      return [];
    }
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    try {
      const result = await db.select()
        .from(teamMembers)
        .where(eq(teamMembers.id, id))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error("Error in getTeamMember:", error);
      return undefined;
    }
  }

  async createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const result = await db.insert(teamMembers).values(teamMember).returning();
    return result[0];
  }

  async updateTeamMember(id: number, teamMemberUpdate: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const result = await db.update(teamMembers)
      .set({ ...teamMemberUpdate, updatedAt: new Date() })
      .where(eq(teamMembers.id, id))
      .returning();
    return result[0];
  }

  async toggleTeamMemberActive(id: number): Promise<TeamMember | undefined> {
    const member = await this.getTeamMember(id);
    if (!member) return undefined;

    const result = await db.update(teamMembers)
      .set({ 
        active: !member.active,
        updatedAt: new Date()
      })
      .where(eq(teamMembers.id, id))
      .returning();
    return result[0];
  }

  async updateTeamMemberOrder(id: number, order: number): Promise<TeamMember | undefined> {
    const result = await db.update(teamMembers)
      .set({ 
        order: order,
        updatedAt: new Date()
      })
      .where(eq(teamMembers.id, id))
      .returning();
    return result[0];
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    const result = await db.delete(teamMembers).where(eq(teamMembers.id, id)).returning();
    return result.length > 0;
  }
}