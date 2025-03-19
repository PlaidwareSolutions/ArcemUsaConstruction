import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, foreignKey, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  email: true,
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(), // Main image (keeping for backward compatibility)
  featured: boolean("featured").default(false),
  
  // Project details from detail page
  overview: text("overview"),
  challenges: text("challenges"), // Now contains both challenges and solutions
  results: text("results"),
  
  // Project specifications
  client: text("client"),
  location: text("location"),
  size: text("size"),
  completionDate: text("completion_date"),
  servicesProvided: text("services_provided"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectGallery = pgTable("project_gallery", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  displayOrder: integer("display_order").default(0),
  isFeature: boolean("is_feature").default(false),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertProjectGallerySchema = createInsertSchema(projectGallery).omit({
  id: true,
});

// Extended project schema that includes gallery images
export const extendedInsertProjectSchema = insertProjectSchema.extend({
  galleryImages: z.array(
    z.object({
      imageUrl: z.string(),
      caption: z.string().optional(),
      displayOrder: z.number().optional(),
      isFeature: z.boolean().optional(),
    })
  ).optional(),
});

// Define project relations
export const projectsRelations = relations(projects, ({ many }) => ({
  galleryImages: many(projectGallery),
}));

export const projectGalleryRelations = relations(projectGallery, ({ one }) => ({
  project: one(projects, {
    fields: [projectGallery.projectId],
    references: [projects.id],
  }),
}));

// New table for blog categories
export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
});

// New table for blog tags
export const blogTags = pgTable("blog_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const insertBlogTagSchema = createInsertSchema(blogTags).omit({
  id: true,
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  image: text("image").notNull(),
  author: text("author").notNull(),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  // We'll keep the original category field for backward compatibility
  // but we'll also use the new relationships
  category: text("category").notNull(),
});

// Relation table for blog posts and categories (many-to-many)
export const blogPostCategories = pgTable("blog_post_categories", {
  postId: integer("post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => blogCategories.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.categoryId] }),
}));

// Relation table for blog posts and tags (many-to-many)
export const blogPostTags = pgTable("blog_post_tags", {
  postId: integer("post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => blogTags.id, { onDelete: "cascade" }),
}, (t) => ({
  pk: primaryKey({ columns: [t.postId, t.tagId] }),
}));

// Define relationships
// Blog gallery images table
export const blogGallery = pgTable("blog_gallery", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBlogGallerySchema = createInsertSchema(blogGallery).omit({
  id: true,
  createdAt: true,
});

export const blogGalleryRelations = relations(blogGallery, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogGallery.postId],
    references: [blogPosts.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ many }) => ({
  categories: many(blogPostCategories),
  tags: many(blogPostTags),
  gallery: many(blogGallery),
}));

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPostCategories),
}));

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  posts: many(blogPostTags),
}));

export const blogPostCategoriesRelations = relations(blogPostCategories, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostCategories.postId],
    references: [blogPosts.id],
  }),
  category: one(blogCategories, {
    fields: [blogPostCategories.categoryId],
    references: [blogCategories.id],
  }),
}));

export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostTags.postId],
    references: [blogPosts.id],
  }),
  tag: one(blogTags, {
    fields: [blogPostTags.tagId],
    references: [blogTags.id],
  }),
}));

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
});

// Extend the schema to include categories, tags, and gallery images
export const extendedInsertBlogPostSchema = insertBlogPostSchema.extend({
  categoryIds: z.array(z.number()).optional(),
  tagIds: z.array(z.number()).optional(),
  galleryImages: z.array(
    z.object({
      imageUrl: z.string(),
      caption: z.string().optional(),
      order: z.number().optional(),
    })
  ).optional(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  company: text("company"),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  image: text("image"),
  approved: boolean("approved").default(false),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  approved: true,
  createdAt: true,
});

// Schema for public testimonial submission (doesn't require all fields)
export const publicTestimonialSchema = insertTestimonialSchema
  .omit({ image: true })
  .extend({
    image: z.string().optional(),
    email: z.string().email("Please provide a valid email address").optional(),
  });

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  features: text("features").array(), // Array of feature strings
});

// Service gallery images table
export const serviceGallery = pgTable("service_gallery", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  alt: text("alt"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertServiceGallerySchema = createInsertSchema(serviceGallery).omit({
  id: true,
  createdAt: true,
});

// Extended service schema that includes gallery images
export const extendedInsertServiceSchema = insertServiceSchema.extend({
  galleryImages: z.array(
    z.object({
      imageUrl: z.string(),
      alt: z.string().optional(),
      order: z.number().optional(),
    })
  ).optional(),
});

// Define service relations
export const servicesRelations = relations(services, ({ many }) => ({
  galleryImages: many(serviceGallery),
}));

export const serviceGalleryRelations = relations(serviceGallery, ({ one }) => ({
  service: one(services, {
    fields: [serviceGallery.serviceId],
    references: [services.id],
  }),
}));

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  service: text("service"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  read: boolean("read").default(false),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  read: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ExtendedInsertProject = z.infer<typeof extendedInsertProjectSchema>;
export type ProjectGallery = typeof projectGallery.$inferSelect;
export type InsertProjectGallery = z.infer<typeof insertProjectGallerySchema>;

export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;

export type BlogTag = typeof blogTags.$inferSelect;
export type InsertBlogTag = z.infer<typeof insertBlogTagSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type ExtendedInsertBlogPost = z.infer<typeof extendedInsertBlogPostSchema>;
export type BlogGallery = typeof blogGallery.$inferSelect;
export type InsertBlogGallery = z.infer<typeof insertBlogGallerySchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type PublicTestimonial = z.infer<typeof publicTestimonialSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type ExtendedInsertService = z.infer<typeof extendedInsertServiceSchema>;
export type ServiceGallery = typeof serviceGallery.$inferSelect;
export type InsertServiceGallery = z.infer<typeof insertServiceGallerySchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// Newsletter subscribers table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  subscribed: boolean("subscribed").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  createdAt: true
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

// Quote requests table
export const quoteRequests = pgTable("quote_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  projectType: text("project_type").notNull(),
  projectSize: text("project_size"),
  budget: text("budget"),
  timeframe: text("timeframe"),
  description: text("description").notNull(),
  status: text("status").default("pending"),
  reviewed: boolean("reviewed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuoteRequestSchema = createInsertSchema(quoteRequests).omit({
  id: true,
  status: true,
  reviewed: true,
  createdAt: true
});

export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = z.infer<typeof insertQuoteRequestSchema>;

// Subcontractors table
export const subcontractors = pgTable("subcontractors", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  website: text("website"),
  serviceTypes: text("service_types").array(),
  serviceDescription: text("service_description").notNull(),
  yearsInBusiness: text("years_in_business").notNull(),
  insurance: boolean("insurance").default(false),
  bondable: boolean("bondable").default(false),
  licenses: text("licenses"),
  references: text("references"),
  howDidYouHear: text("how_did_you_hear"),
  status: text("status").default("pending"), // pending, approved, rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubcontractorSchema = createInsertSchema(subcontractors).omit({
  id: true,
  status: true,
  notes: true,
  createdAt: true
});

// Vendors table
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  website: text("website"),
  supplyTypes: text("supply_types").array(),
  serviceDescription: text("service_description").notNull(),
  yearsInBusiness: text("years_in_business").notNull(),
  references: text("references"),
  howDidYouHear: text("how_did_you_hear"),
  status: text("status").default("pending"), // pending, approved, rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  status: true,
  notes: true,
  createdAt: true
});

export type Subcontractor = typeof subcontractors.$inferSelect;
export type InsertSubcontractor = z.infer<typeof insertSubcontractorSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

// Careers/Jobs schema
export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // full-time, part-time, contract, etc.
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  responsibilities: text("responsibilities").notNull(),
  benefits: text("benefits"),
  salary: text("salary"),
  applyUrl: text("apply_url"),
  active: boolean("active").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;

// Team Members schema
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  qualification: text("qualification").notNull(),
  gender: text("gender").notNull(), // 'male' or 'female'
  photo: text("photo"),
  bio: text("bio"),
  order: integer("order").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
