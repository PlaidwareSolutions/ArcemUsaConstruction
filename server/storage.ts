import {
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  projectGallery, type ProjectGallery, type InsertProjectGallery,
  blogCategories, type BlogCategory, type InsertBlogCategory,
  blogTags, type BlogTag, type InsertBlogTag,
  blogPosts, type BlogPost, type InsertBlogPost,
  blogGallery, type BlogGallery, type InsertBlogGallery,
  testimonials, type Testimonial, type InsertTestimonial,
  services, type Service, type InsertService,
  serviceGallery, type ServiceGallery, type InsertServiceGallery,
  messages, type Message, type InsertMessage,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletterSubscriber,
  quoteRequests, type QuoteRequest, type InsertQuoteRequest,
  quoteRequestAttachments, type QuoteRequestAttachment, type InsertQuoteRequestAttachment,
  subcontractors, type Subcontractor, type InsertSubcontractor,
  vendors, type Vendor, type InsertVendor,
  jobPostings, type JobPosting, type InsertJobPosting,
  teamMembers, type TeamMember, type InsertTeamMember
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

// Define simplified interfaces for blog categories and tags that don't require createdAt
export interface SimpleBlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface SimpleBlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getFeaturedProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Project Gallery
  getProjectGallery(projectId: number): Promise<ProjectGallery[]>;
  addProjectGalleryImage(galleryImage: InsertProjectGallery): Promise<ProjectGallery>;
  updateProjectGalleryImage(id: number, galleryImage: Partial<InsertProjectGallery>): Promise<ProjectGallery | undefined>;
  deleteProjectGalleryImage(id: number): Promise<boolean>;
  deleteAllProjectGalleryImages(projectId: number): Promise<boolean>;
  setProjectFeatureImage(projectId: number, galleryImageId: number): Promise<ProjectGallery | undefined>;
  
  // Blog Categories
  getBlogCategories(): Promise<BlogCategory[]>;
  getBlogCategory(id: number): Promise<BlogCategory | undefined>;
  createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory>;
  
  // Blog Tags
  getBlogTags(): Promise<BlogTag[]>;
  getBlogTag(id: number): Promise<BlogTag | undefined>;
  createBlogTag(tag: InsertBlogTag): Promise<BlogTag>;
  
  // Blog Posts
  getBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  
  // Blog Gallery
  getBlogGallery(postId: number): Promise<BlogGallery[]>;
  addBlogGalleryImage(galleryImage: InsertBlogGallery): Promise<BlogGallery>;
  updateBlogGalleryImage(id: number, galleryImage: Partial<InsertBlogGallery>): Promise<BlogGallery | undefined>;
  deleteBlogGalleryImage(id: number): Promise<boolean>;
  deleteAllBlogGalleryImages(postId: number): Promise<boolean>;
  
  // Blog Post Categories
  getBlogPostCategories(postId: number): Promise<SimpleBlogCategory[]>;
  linkBlogPostCategories(postId: number, categoryIds: number[]): Promise<void>;
  updateBlogPostCategories(postId: number, categoryIds: number[]): Promise<void>;
  
  // Blog Post Tags
  getBlogPostTags(postId: number): Promise<SimpleBlogTag[]>;
  linkBlogPostTags(postId: number, tagIds: number[]): Promise<void>;
  updateBlogPostTags(postId: number, tagIds: number[]): Promise<void>;
  
  // Testimonials
  getTestimonials(): Promise<Testimonial[]>;
  getApprovedTestimonials(): Promise<Testimonial[]>;
  getPendingTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: number, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  approveTestimonial(id: number): Promise<Testimonial | undefined>;
  revokeTestimonialApproval(id: number): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<boolean>;
  
  // Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Service Gallery
  getServiceGallery(serviceId: number): Promise<ServiceGallery[]>;
  addServiceGalleryImage(galleryImage: InsertServiceGallery): Promise<ServiceGallery>;
  updateServiceGalleryImage(id: number, galleryImage: Partial<InsertServiceGallery>): Promise<ServiceGallery | undefined>;
  deleteServiceGalleryImage(id: number): Promise<boolean>;
  deleteAllServiceGalleryImages(serviceId: number): Promise<boolean>;
  
  // Messages/Contact
  getMessages(): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;
  
  // Newsletter Subscribers
  getNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;
  getNewsletterSubscriber(id: number): Promise<NewsletterSubscriber | undefined>;
  getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
  createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  updateNewsletterSubscriber(id: number, subscriber: Partial<InsertNewsletterSubscriber>): Promise<NewsletterSubscriber | undefined>;
  deleteNewsletterSubscriber(id: number): Promise<boolean>;
  
  // Quote Requests
  getQuoteRequests(): Promise<QuoteRequest[]>;
  getQuoteRequest(id: number): Promise<QuoteRequest | undefined>;
  createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest>;
  updateQuoteRequest(id: number, request: Partial<QuoteRequest>): Promise<QuoteRequest | undefined>;
  markQuoteRequestAsReviewed(id: number): Promise<QuoteRequest | undefined>;
  updateQuoteRequestStatus(id: number, status: string): Promise<QuoteRequest | undefined>;
  deleteQuoteRequest(id: number): Promise<boolean>;
  
  // Quote Request Attachments
  getQuoteRequestAttachments(quoteRequestId: number): Promise<QuoteRequestAttachment[]>;
  createQuoteRequestAttachment(attachment: InsertQuoteRequestAttachment): Promise<QuoteRequestAttachment>;
  deleteQuoteRequestAttachment(id: number): Promise<boolean>;
  deleteAllQuoteRequestAttachments(quoteRequestId: number): Promise<boolean>;

  // Subcontractors
  getSubcontractors(): Promise<Subcontractor[]>;
  getSubcontractor(id: number): Promise<Subcontractor | undefined>;
  createSubcontractor(subcontractor: InsertSubcontractor): Promise<Subcontractor>;
  updateSubcontractor(id: number, subcontractor: Partial<InsertSubcontractor>): Promise<Subcontractor | undefined>;
  updateSubcontractorStatus(id: number, status: string): Promise<Subcontractor | undefined>;
  updateSubcontractorNotes(id: number, notes: string): Promise<Subcontractor | undefined>;
  deleteSubcontractor(id: number): Promise<boolean>;
  
  // Vendors
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  updateVendorStatus(id: number, status: string): Promise<Vendor | undefined>;
  updateVendorNotes(id: number, notes: string): Promise<Vendor | undefined>;
  deleteVendor(id: number): Promise<boolean>;
  
  // Careers/Jobs
  getJobPostings(): Promise<JobPosting[]>;
  getActiveJobPostings(): Promise<JobPosting[]>;
  getFeaturedJobPostings(): Promise<JobPosting[]>;
  getJobPosting(id: number): Promise<JobPosting | undefined>;
  createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting>;
  updateJobPosting(id: number, jobPosting: Partial<InsertJobPosting>): Promise<JobPosting | undefined>;
  toggleJobPostingActive(id: number): Promise<JobPosting | undefined>;
  toggleJobPostingFeatured(id: number): Promise<JobPosting | undefined>;
  deleteJobPosting(id: number): Promise<boolean>;
  
  // Team Members
  getTeamMembers(): Promise<TeamMember[]>;
  getActiveTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, teamMember: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  toggleTeamMemberActive(id: number): Promise<TeamMember | undefined>;
  updateTeamMemberOrder(id: number, order: number): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private projectGallery: Map<number, ProjectGallery>;
  private blogCategories: Map<number, BlogCategory>;
  private blogTags: Map<number, BlogTag>;
  private blogPosts: Map<number, BlogPost>;
  private blogGallery: Map<number, BlogGallery>;
  private blogPostCategories: Map<number, Set<number>>;  // postId -> Set of categoryIds
  private blogPostTags: Map<number, Set<number>>;        // postId -> Set of tagIds
  private testimonials: Map<number, Testimonial>;
  private services: Map<number, Service>;
  private serviceGallery: Map<number, ServiceGallery>;
  private messages: Map<number, Message>;
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  private quoteRequests: Map<number, QuoteRequest>;
  private quoteRequestAttachments: Map<number, QuoteRequestAttachment>;
  private subcontractors: Map<number, Subcontractor>;
  private vendors: Map<number, Vendor>;
  private jobPostings: Map<number, JobPosting>;
  private teamMembers: Map<number, TeamMember>;
  
  userCurrentId: number;
  projectCurrentId: number;
  projectGalleryCurrentId: number;
  blogCategoryCurrentId: number;
  blogTagCurrentId: number;
  blogPostCurrentId: number;
  blogGalleryCurrentId: number;
  testimonialCurrentId: number;
  serviceCurrentId: number;
  messageCurrentId: number;
  newsletterSubscriberCurrentId: number;
  quoteRequestCurrentId: number;
  quoteRequestAttachmentCurrentId: number;
  subcontractorCurrentId: number;
  vendorCurrentId: number;
  jobPostingCurrentId: number;
  teamMemberCurrentId: number;

  serviceGalleryCurrentId: number;
  
  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.projectGallery = new Map();
    this.blogCategories = new Map();
    this.blogTags = new Map();
    this.blogPosts = new Map();
    this.blogGallery = new Map();
    this.blogPostCategories = new Map();
    this.blogPostTags = new Map();
    this.testimonials = new Map();
    this.services = new Map();
    this.serviceGallery = new Map();
    this.messages = new Map();
    this.newsletterSubscribers = new Map();
    this.quoteRequests = new Map();
    this.quoteRequestAttachments = new Map();
    this.subcontractors = new Map();
    this.vendors = new Map();
    this.jobPostings = new Map();
    this.teamMembers = new Map();
    
    this.userCurrentId = 1;
    this.projectCurrentId = 1;
    this.projectGalleryCurrentId = 1;
    this.blogCategoryCurrentId = 1;
    this.blogTagCurrentId = 1;
    this.blogPostCurrentId = 1;
    this.blogGalleryCurrentId = 1;
    this.testimonialCurrentId = 1;
    this.serviceCurrentId = 1;
    this.serviceGalleryCurrentId = 1;
    this.messageCurrentId = 1;
    this.newsletterSubscriberCurrentId = 1;
    this.quoteRequestCurrentId = 1;
    this.quoteRequestAttachmentCurrentId = 1;
    this.subcontractorCurrentId = 1;
    this.vendorCurrentId = 1;
    this.jobPostingCurrentId = 1;
    this.teamMemberCurrentId = 1;
    
    // Add initial data
    this.initializeData();
  }

  // Initialize with sample data
  private initializeData() {
    // Add default blog categories
    const defaultCategories = [
      {
        name: "Construction",
        slug: "construction",
        description: "Articles about construction techniques, innovations, and best practices"
      },
      {
        name: "Architecture",
        slug: "architecture",
        description: "Articles about architectural design, trends, and innovations"
      },
      {
        name: "Technology",
        slug: "technology",
        description: "Articles about technology in construction and building management"
      },
      {
        name: "Sustainability",
        slug: "sustainability",
        description: "Articles about sustainable building practices and green construction"
      }
    ];
    
    defaultCategories.forEach(category => {
      this.createBlogCategory(category as InsertBlogCategory);
    });
    
    // Add default blog tags
    const defaultTags = [
      { name: "Green Building", slug: "green-building" },
      { name: "Commercial", slug: "commercial" },
      { name: "Residential", slug: "residential" },
      { name: "Innovation", slug: "innovation" },
      { name: "Design", slug: "design" },
      { name: "Safety", slug: "safety" }
    ];
    
    defaultTags.forEach(tag => {
      this.createBlogTag(tag as InsertBlogTag);
    });
    
    // Add default services
    const defaultServices = [
      {
        title: "Commercial Construction",
        description: "From office buildings to retail spaces, we deliver commercial projects that meet the highest standards of quality and functionality.",
        icon: "building"
      },
      {
        title: "Residential Construction",
        description: "We build custom homes that reflect your personal style and needs, with attention to quality and detail in every aspect.",
        icon: "home"
      },
      {
        title: "Renovation & Remodeling",
        description: "Transform your existing space with our renovation services that enhance functionality, aesthetics, and value.",
        icon: "tool"
      },
      {
        title: "Project Planning & Design",
        description: "Our expert team provides comprehensive planning and design services to lay the foundation for successful project execution.",
        icon: "clipboard"
      },
      {
        title: "Industrial Construction",
        description: "We deliver industrial facilities built to the highest standards of safety, efficiency, and functionality.",
        icon: "factory"
      },
      {
        title: "Construction Management",
        description: "Our experienced project managers oversee every aspect of construction to ensure timely completion and budget adherence.",
        icon: "settings"
      }
    ];
    
    defaultServices.forEach(service => {
      this.createService(service as InsertService);
    });
    
    // Add sample projects
    const defaultProjects = [
      {
        title: "Eastside Corporate Center",
        category: "Commercial Office",
        description: "A modern glass office building featuring sustainable design elements and state-of-the-art facilities for a premier business environment.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        featured: true
      },
      {
        title: "The Westview Residences",
        category: "Residential Complex",
        description: "Luxury apartment complex with premium amenities, modern design, and comfortable living spaces in a desirable neighborhood.",
        image: "https://images.unsplash.com/photo-1613782558577-530a88a5790a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        featured: true
      },
      {
        title: "Summit Shopping Center",
        category: "Retail Development",
        description: "Modern retail space designed for optimal customer flow, featuring sustainable materials and energy-efficient systems.",
        image: "https://images.unsplash.com/photo-1565615833231-e8c91a38a012?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        featured: true
      },
      {
        title: "Grand Horizon Hotel",
        category: "Hospitality",
        description: "Elegant hotel featuring contemporary design with luxurious amenities, meeting spaces, and dining facilities for discerning travelers.",
        image: "https://images.unsplash.com/photo-1577942933954-ab8e992e20b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        featured: true
      },
      {
        title: "Northside Manufacturing Plant",
        category: "Industrial",
        description: "State-of-the-art manufacturing facility designed for optimal workflow, safety, and energy efficiency.",
        image: "https://images.unsplash.com/photo-1519558260268-cde7e03a0152?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        featured: true
      },
      {
        title: "Riverdale University Center",
        category: "Educational",
        description: "Modern educational facility featuring flexible learning spaces, advanced technology infrastructure, and sustainable design elements.",
        image: "https://images.unsplash.com/photo-1519687079572-8db97e023969?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        featured: true
      }
    ];
    
    defaultProjects.forEach(project => {
      this.createProject(project as InsertProject);
    });
    
    // Add sample blog posts
    const defaultBlogPosts = [
      {
        title: "7 Sustainable Building Practices for Modern Construction",
        slug: "sustainable-building-practices",
        content: "Discover the latest sustainable building methods that are transforming the construction industry and reducing environmental impact...",
        excerpt: "Discover the latest sustainable building methods that are transforming the construction industry and reducing environmental impact.",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
        category: "Construction",
        author: "John Smith",
        published: true
      },
      {
        title: "The Evolution of Architectural Design in Commercial Buildings",
        slug: "evolution-architectural-design",
        content: "Explore how commercial architecture has evolved over the decades and what trends are shaping the future of building design...",
        excerpt: "Explore how commercial architecture has evolved over the decades and what trends are shaping the future of building design.",
        image: "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
        category: "Architecture",
        author: "Emma Johnson",
        published: true
      },
      {
        title: "How Technology is Transforming the Construction Industry",
        slug: "technology-transforming-construction",
        content: "From BIM to drones and AI, discover how technological innovations are revolutionizing construction processes and outcomes...",
        excerpt: "From BIM to drones and AI, discover how technological innovations are revolutionizing construction processes and outcomes.",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        category: "Technology",
        author: "Robert Chen",
        published: true
      }
    ];
    
    defaultBlogPosts.forEach(post => {
      this.createBlogPost(post as InsertBlogPost);
    });
    
    // Add sample testimonials
    const defaultTestimonials = [
      {
        name: "Michael Johnson",
        position: "CEO",
        company: "Johnson Enterprises",
        content: "ARCEM exceeded all our expectations with our commercial building project. Their attention to detail, transparent communication, and exceptional craftsmanship made the entire process smooth and stress-free. The project was completed on time and within budget.",
        rating: 5,
        image: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      {
        name: "Sarah Thompson",
        position: "Homeowner",
        company: "",
        content: "Working with ARCEM on our custom home was a fantastic experience. They truly listened to our vision and brought it to life with exceptional craftsmanship. Their team was professional, responsive, and dedicated to quality at every step.",
        rating: 5,
        image: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      {
        name: "David Wilson",
        position: "Owner",
        company: "Wilson Retail Group",
        content: "We hired ARCEM for our retail space renovation, and the results were outstanding. Their innovative design solutions maximized our space and created an inviting environment for our customers. The team's expertise and professionalism were evident throughout the project.",
        rating: 5,
        image: "https://randomuser.me/api/portraits/men/55.jpg"
      }
    ];
    
    defaultTestimonials.forEach(testimonial => {
      this.createTestimonial(testimonial as InsertTestimonial);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role || null,
      email: insertUser.email || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
      .map(project => ({
        ...project,
        // Ensure new fields have default values to prevent errors
        overview: project.overview || null,
        challenges: project.challenges || null,
        results: project.results || null,
        client: project.client || null,
        location: project.location || null,
        size: project.size || null,
        completionDate: project.completionDate || null,
        servicesProvided: project.servicesProvided || null
      }));
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    // Ensure new fields have default values
    return {
      ...project,
      overview: project.overview || null,
      challenges: project.challenges || null,
      results: project.results || null,
      client: project.client || null,
      location: project.location || null,
      size: project.size || null,
      completionDate: project.completionDate || null,
      servicesProvided: project.servicesProvided || null
    };
  }
  
  async getFeaturedProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.featured === true)
      .map(project => ({
        ...project,
        // Ensure new fields have default values to prevent errors
        overview: project.overview || null,
        challenges: project.challenges || null,
        results: project.results || null,
        client: project.client || null,
        location: project.location || null,
        size: project.size || null,
        completionDate: project.completionDate || null,
        servicesProvided: project.servicesProvided || null
      }));
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectCurrentId++;
    const now = new Date();
    
    // Explicitly construct the object to handle optional fields properly
    const newProject: Project = { 
      id,
      title: project.title,
      category: project.category,
      description: project.description,
      image: project.image,
      featured: project.featured ?? null,
      createdAt: now,
      
      // Handle optional fields with proper nulls
      overview: project.overview || null,
      challenges: project.challenges || null,
      results: project.results || null,
      
      // Project specifications
      client: project.client || null,
      location: project.location || null,
      size: project.size || null,
      completionDate: project.completionDate || null,
      servicesProvided: project.servicesProvided || null
    };
    
    this.projects.set(id, newProject);
    return newProject;
  }
  
  async updateProject(id: number, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject: Project = { 
      ...project, 
      ...projectUpdate 
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    // Also delete all gallery images for this project
    this.deleteAllProjectGalleryImages(id);
    return this.projects.delete(id);
  }
  
  // Project Gallery
  async getProjectGallery(projectId: number): Promise<ProjectGallery[]> {
    return Array.from(this.projectGallery.values())
      .filter(image => image.projectId === projectId)
      .sort((a, b) => {
        const orderA = a.displayOrder !== null ? a.displayOrder : 0;
        const orderB = b.displayOrder !== null ? b.displayOrder : 0;
        return orderA - orderB;
      });
  }

  async addProjectGalleryImage(galleryImage: InsertProjectGallery): Promise<ProjectGallery> {
    const id = this.projectGalleryCurrentId++;
    
    // Handle isFeature properly - use null coalescing to ensure we get a boolean
    const isFeature = galleryImage.isFeature ?? false;
    
    const newImage: ProjectGallery = {
      ...galleryImage,
      id,
      displayOrder: galleryImage.displayOrder || 0,
      caption: galleryImage.caption || null,
      isFeature: isFeature
    };
    this.projectGallery.set(id, newImage);
    return newImage;
  }

  async updateProjectGalleryImage(id: number, galleryImageUpdate: Partial<InsertProjectGallery>): Promise<ProjectGallery | undefined> {
    const image = this.projectGallery.get(id);
    if (!image) return undefined;
    
    const updatedImage: ProjectGallery = {
      ...image,
      ...galleryImageUpdate
    };
    
    this.projectGallery.set(id, updatedImage);
    return updatedImage;
  }

  async deleteProjectGalleryImage(id: number): Promise<boolean> {
    return this.projectGallery.delete(id);
  }

  async deleteAllProjectGalleryImages(projectId: number): Promise<boolean> {
    const galleryImages = this.getProjectGallery(projectId);
    (await galleryImages).forEach(image => {
      this.projectGallery.delete(image.id);
    });
    return true;
  }
  
  async setProjectFeatureImage(projectId: number, galleryImageId: number): Promise<ProjectGallery | undefined> {
    // Get all gallery images for this project
    const galleryImages = await this.getProjectGallery(projectId);
    
    // Reset all feature flags to false
    for (const image of galleryImages) {
      if (image.isFeature) {
        await this.updateProjectGalleryImage(image.id, { isFeature: false });
      }
    }
    
    // Set the selected image as the feature image
    const featureImage = this.projectGallery.get(galleryImageId);
    if (!featureImage || featureImage.projectId !== projectId) {
      return undefined; // Image not found or doesn't belong to this project
    }
    
    // Update the feature image
    const updatedImage = await this.updateProjectGalleryImage(galleryImageId, { isFeature: true });
    
    // Also update the project's image field to use this feature image
    if (updatedImage) {
      await this.updateProject(projectId, { image: updatedImage.imageUrl });
    }
    
    return updatedImage;
  }
  
  // Blog Posts
  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values());
  }
  
  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).filter(post => post.published);
  }
  
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(post => post.slug === slug);
  }
  
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostCurrentId++;
    const now = new Date();
    const newPost: BlogPost = { 
      ...post, 
      id, 
      createdAt: now,
      published: post.published ?? null 
    };
    this.blogPosts.set(id, newPost);
    return newPost;
  }
  
  async updateBlogPost(id: number, postUpdate: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const post = this.blogPosts.get(id);
    if (!post) return undefined;
    
    const updatedPost: BlogPost = { 
      ...post, 
      ...postUpdate 
    };
    
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    // Also clean up any categories, tags, and gallery images references
    this.blogPostCategories.delete(id);
    this.blogPostTags.delete(id);
    this.deleteAllBlogGalleryImages(id);
    return this.blogPosts.delete(id);
  }
  
  // Blog Gallery
  async getBlogGallery(postId: number): Promise<BlogGallery[]> {
    return Array.from(this.blogGallery.values())
      .filter(image => image.postId === postId)
      .sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        return orderA - orderB;
      });
  }

  async addBlogGalleryImage(galleryImage: InsertBlogGallery): Promise<BlogGallery> {
    const id = this.blogGalleryCurrentId++;
    const now = new Date();
    
    const newImage: BlogGallery = {
      id,
      postId: galleryImage.postId,
      imageUrl: galleryImage.imageUrl,
      caption: galleryImage.caption || null,
      order: galleryImage.order || 0,
      createdAt: now
    };
    
    this.blogGallery.set(id, newImage);
    return newImage;
  }

  async updateBlogGalleryImage(id: number, galleryImageUpdate: Partial<InsertBlogGallery>): Promise<BlogGallery | undefined> {
    const image = this.blogGallery.get(id);
    if (!image) return undefined;
    
    const updatedImage: BlogGallery = {
      ...image,
      ...galleryImageUpdate
    };
    
    this.blogGallery.set(id, updatedImage);
    return updatedImage;
  }

  async deleteBlogGalleryImage(id: number): Promise<boolean> {
    return this.blogGallery.delete(id);
  }

  async deleteAllBlogGalleryImages(postId: number): Promise<boolean> {
    let success = true;
    
    // Find all gallery images for this post
    const galleryImagesToDelete = Array.from(this.blogGallery.values())
      .filter(image => image.postId === postId)
      .map(image => image.id);
    
    // Delete each gallery image
    galleryImagesToDelete.forEach(id => {
      if (!this.blogGallery.delete(id)) {
        success = false;
      }
    });
    
    return success;
  }
  
  // Blog Categories
  async getBlogCategories(): Promise<BlogCategory[]> {
    return Array.from(this.blogCategories.values());
  }
  
  async getBlogCategory(id: number): Promise<BlogCategory | undefined> {
    return this.blogCategories.get(id);
  }
  
  async createBlogCategory(category: InsertBlogCategory): Promise<BlogCategory> {
    const id = this.blogCategoryCurrentId++;
    const newCategory: BlogCategory = { 
      ...category, 
      id, 
      description: category.description || null
    };
    this.blogCategories.set(id, newCategory);
    return newCategory;
  }
  
  // Blog Tags
  async getBlogTags(): Promise<BlogTag[]> {
    return Array.from(this.blogTags.values());
  }
  
  async getBlogTag(id: number): Promise<BlogTag | undefined> {
    return this.blogTags.get(id);
  }
  
  async createBlogTag(tag: InsertBlogTag): Promise<BlogTag> {
    const id = this.blogTagCurrentId++;
    const newTag: BlogTag = { 
      ...tag, 
      id
    };
    this.blogTags.set(id, newTag);
    return newTag;
  }
  
  // Blog Post Categories
  async getBlogPostCategories(postId: number): Promise<BlogCategory[]> {
    const categoryIds = this.blogPostCategories.get(postId);
    if (!categoryIds || categoryIds.size === 0) return [];
    
    return Array.from(categoryIds).map(categoryId => 
      this.blogCategories.get(categoryId)
    ).filter(Boolean) as BlogCategory[];
  }
  
  async linkBlogPostCategories(postId: number, categoryIds: number[]): Promise<void> {
    const categorySet = new Set(categoryIds);
    this.blogPostCategories.set(postId, categorySet);
  }
  
  async updateBlogPostCategories(postId: number, categoryIds: number[]): Promise<void> {
    // Simply replace the existing categories
    await this.linkBlogPostCategories(postId, categoryIds);
  }
  
  // Blog Post Tags
  async getBlogPostTags(postId: number): Promise<BlogTag[]> {
    const tagIds = this.blogPostTags.get(postId);
    if (!tagIds || tagIds.size === 0) return [];
    
    return Array.from(tagIds).map(tagId => 
      this.blogTags.get(tagId)
    ).filter(Boolean) as BlogTag[];
  }
  
  async linkBlogPostTags(postId: number, tagIds: number[]): Promise<void> {
    const tagSet = new Set(tagIds);
    this.blogPostTags.set(postId, tagSet);
  }
  
  async updateBlogPostTags(postId: number, tagIds: number[]): Promise<void> {
    // Simply replace the existing tags
    await this.linkBlogPostTags(postId, tagIds);
  }
  
  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }
  
  // Get only approved testimonials (for public display)
  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values())
      .filter(testimonial => testimonial.approved);
  }
  
  // Get pending testimonials (for admin review)
  async getPendingTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values())
      .filter(testimonial => !testimonial.approved);
  }
  
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }
  
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialCurrentId++;
    const newTestimonial: Testimonial = { 
      ...testimonial, 
      id,
      image: testimonial.image ?? null,
      company: testimonial.company ?? null,
      email: testimonial.email ?? null,
      approved: false,
      createdAt: new Date()
    };
    this.testimonials.set(id, newTestimonial);
    return newTestimonial;
  }
  
  async updateTestimonial(id: number, updates: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) return undefined;
    
    const updatedTestimonial: Testimonial = {
      ...testimonial,
      ...updates,
      image: updates.image ?? testimonial.image,
      company: updates.company ?? testimonial.company,
      email: updates.email ?? testimonial.email
    };
    
    this.testimonials.set(id, updatedTestimonial);
    return updatedTestimonial;
  }
  
  async approveTestimonial(id: number): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) return undefined;
    
    const approvedTestimonial: Testimonial = {
      ...testimonial,
      approved: true
    };
    
    this.testimonials.set(id, approvedTestimonial);
    return approvedTestimonial;
  }
  
  async revokeTestimonialApproval(id: number): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) return undefined;
    
    const unapprovedTestimonial: Testimonial = {
      ...testimonial,
      approved: false
    };
    
    this.testimonials.set(id, unapprovedTestimonial);
    return unapprovedTestimonial;
  }
  
  async deleteTestimonial(id: number): Promise<boolean> {
    return this.testimonials.delete(id);
  }
  
  // Services
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async createService(service: InsertService): Promise<Service> {
    const id = this.serviceCurrentId++;
    const newService: Service = { 
      ...service, 
      id,
      features: service.features || null
    };
    this.services.set(id, newService);
    return newService;
  }
  
  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService: Service = { 
      ...service, 
      ...serviceUpdate,
      features: serviceUpdate.features !== undefined ? serviceUpdate.features : service.features
    };
    
    this.services.set(id, updatedService);
    return updatedService;
  }
  
  async deleteService(id: number): Promise<boolean> {
    // Also delete all gallery images for this service
    this.deleteAllServiceGalleryImages(id);
    return this.services.delete(id);
  }
  
  // Service Gallery
  async getServiceGallery(serviceId: number): Promise<ServiceGallery[]> {
    return Array.from(this.serviceGallery.values())
      .filter(image => image.serviceId === serviceId)
      .sort((a, b) => {
        const orderA = a.order !== null ? a.order : 0;
        const orderB = b.order !== null ? b.order : 0;
        return orderA - orderB;
      });
  }

  async addServiceGalleryImage(galleryImage: InsertServiceGallery): Promise<ServiceGallery> {
    const id = this.serviceGalleryCurrentId++;
    const now = new Date();
    
    const newImage: ServiceGallery = {
      ...galleryImage,
      id,
      order: galleryImage.order || 0,
      alt: galleryImage.alt || null,
      createdAt: now
    };
    
    this.serviceGallery.set(id, newImage);
    return newImage;
  }

  async updateServiceGalleryImage(id: number, galleryImageUpdate: Partial<InsertServiceGallery>): Promise<ServiceGallery | undefined> {
    const image = this.serviceGallery.get(id);
    if (!image) return undefined;
    
    const updatedImage: ServiceGallery = {
      ...image,
      ...galleryImageUpdate,
      alt: galleryImageUpdate.alt !== undefined ? galleryImageUpdate.alt : image.alt,
      order: galleryImageUpdate.order !== undefined ? galleryImageUpdate.order : image.order
    };
    
    this.serviceGallery.set(id, updatedImage);
    return updatedImage;
  }

  async deleteServiceGalleryImage(id: number): Promise<boolean> {
    return this.serviceGallery.delete(id);
  }

  async deleteAllServiceGalleryImages(serviceId: number): Promise<boolean> {
    const imagesToDelete = Array.from(this.serviceGallery.values())
      .filter(image => image.serviceId === serviceId)
      .map(image => image.id);
      
    imagesToDelete.forEach(id => this.serviceGallery.delete(id));
    return true;
  }
  
  // Messages
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const now = new Date();
    const newMessage: Message = { 
      ...message, 
      id, 
      createdAt: now, 
      read: false,
      phone: message.phone ?? null,
      service: message.service ?? null
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }
  
  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    const updatedMessage: Message = { 
      ...message, 
      read: true 
    };
    
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  async deleteMessage(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }

  // Newsletter Subscribers
  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return Array.from(this.newsletterSubscribers.values());
  }

  async getNewsletterSubscriber(id: number): Promise<NewsletterSubscriber | undefined> {
    return this.newsletterSubscribers.get(id);
  }

  async getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    return Array.from(this.newsletterSubscribers.values()).find(
      (subscriber) => subscriber.email === email
    );
  }

  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const id = this.newsletterSubscriberCurrentId++;
    const now = new Date();

    const newSubscriber: NewsletterSubscriber = {
      id,
      email: subscriber.email,
      firstName: subscriber.firstName || null,
      lastName: subscriber.lastName || null,
      subscribed: subscriber.subscribed ?? true,
      createdAt: now
    };

    this.newsletterSubscribers.set(id, newSubscriber);
    return newSubscriber;
  }

  async updateNewsletterSubscriber(id: number, updates: Partial<InsertNewsletterSubscriber>): Promise<NewsletterSubscriber | undefined> {
    const subscriber = this.newsletterSubscribers.get(id);
    if (!subscriber) return undefined;

    const updatedSubscriber: NewsletterSubscriber = {
      ...subscriber,
      ...updates
    };

    this.newsletterSubscribers.set(id, updatedSubscriber);
    return updatedSubscriber;
  }

  async deleteNewsletterSubscriber(id: number): Promise<boolean> {
    return this.newsletterSubscribers.delete(id);
  }

  // Quote Requests
  async getQuoteRequests(): Promise<QuoteRequest[]> {
    return Array.from(this.quoteRequests.values());
  }

  async getQuoteRequest(id: number): Promise<QuoteRequest | undefined> {
    return this.quoteRequests.get(id);
  }

  async createQuoteRequest(request: InsertQuoteRequest): Promise<QuoteRequest> {
    const id = this.quoteRequestCurrentId++;
    const now = new Date();

    const newRequest: QuoteRequest = {
      id,
      name: request.name,
      email: request.email,
      phone: request.phone || null,
      company: request.company || null,
      projectType: request.projectType,
      projectSize: request.projectSize || null,
      budget: request.budget || null,
      timeframe: request.timeframe || null,
      description: request.description,
      status: "pending",
      reviewed: false,
      createdAt: now
    };

    this.quoteRequests.set(id, newRequest);
    return newRequest;
  }

  async updateQuoteRequest(id: number, updates: Partial<QuoteRequest>): Promise<QuoteRequest | undefined> {
    const request = this.quoteRequests.get(id);
    if (!request) return undefined;

    const updatedRequest: QuoteRequest = {
      ...request,
      ...updates
    };

    this.quoteRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async markQuoteRequestAsReviewed(id: number): Promise<QuoteRequest | undefined> {
    const request = this.quoteRequests.get(id);
    if (!request) return undefined;

    const updatedRequest: QuoteRequest = {
      ...request,
      reviewed: true
    };

    this.quoteRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async updateQuoteRequestStatus(id: number, status: string): Promise<QuoteRequest | undefined> {
    const request = this.quoteRequests.get(id);
    if (!request) return undefined;

    const updatedRequest: QuoteRequest = {
      ...request,
      status
    };

    this.quoteRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async deleteQuoteRequest(id: number): Promise<boolean> {
    // Delete all attachments for this quote request
    await this.deleteAllQuoteRequestAttachments(id);
    return this.quoteRequests.delete(id);
  }
  
  // Quote Request Attachments
  async getQuoteRequestAttachments(quoteRequestId: number): Promise<QuoteRequestAttachment[]> {
    return Array.from(this.quoteRequestAttachments.values())
      .filter(attachment => attachment.quoteRequestId === quoteRequestId);
  }
  
  async createQuoteRequestAttachment(attachment: InsertQuoteRequestAttachment): Promise<QuoteRequestAttachment> {
    // Generate an ID for the new attachment
    const id = this.projectGalleryCurrentId++; // Reuse the project gallery counter for now
    const now = new Date();
    
    const newAttachment: QuoteRequestAttachment = {
      id,
      quoteRequestId: attachment.quoteRequestId,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      fileKey: attachment.fileKey,
      fileSize: attachment.fileSize,
      fileType: attachment.fileType,
      createdAt: now
    };
    
    this.quoteRequestAttachments.set(id, newAttachment);
    return newAttachment;
  }
  
  async deleteQuoteRequestAttachment(id: number): Promise<boolean> {
    return this.quoteRequestAttachments.delete(id);
  }
  
  async deleteAllQuoteRequestAttachments(quoteRequestId: number): Promise<boolean> {
    const attachments = Array.from(this.quoteRequestAttachments.values())
      .filter(attachment => attachment.quoteRequestId === quoteRequestId);
    
    attachments.forEach(attachment => {
      this.quoteRequestAttachments.delete(attachment.id);
    });
    
    return true;
  }

  // Subcontractors
  async getSubcontractors(): Promise<Subcontractor[]> {
    return Array.from(this.subcontractors.values());
  }

  async getSubcontractor(id: number): Promise<Subcontractor | undefined> {
    return this.subcontractors.get(id);
  }

  async createSubcontractor(subcontractor: InsertSubcontractor): Promise<Subcontractor> {
    const id = this.subcontractorCurrentId++;
    const now = new Date();
    
    const newSubcontractor: Subcontractor = {
      id,
      companyName: subcontractor.companyName,
      contactName: subcontractor.contactName,
      email: subcontractor.email,
      phone: subcontractor.phone,
      address: subcontractor.address,
      city: subcontractor.city,
      state: subcontractor.state,
      zip: subcontractor.zip,
      website: subcontractor.website || null,
      serviceTypes: subcontractor.serviceTypes || [],
      serviceDescription: subcontractor.serviceDescription,
      yearsInBusiness: subcontractor.yearsInBusiness,
      insurance: subcontractor.insurance ?? false,
      bondable: subcontractor.bondable ?? false,
      licenses: subcontractor.licenses || null,
      references: subcontractor.references || null,
      howDidYouHear: subcontractor.howDidYouHear || null,
      status: "pending",
      notes: null,
      createdAt: now
    };
    
    this.subcontractors.set(id, newSubcontractor);
    return newSubcontractor;
  }

  async updateSubcontractor(id: number, updates: Partial<InsertSubcontractor>): Promise<Subcontractor | undefined> {
    const subcontractor = this.subcontractors.get(id);
    if (!subcontractor) return undefined;
    
    const updatedSubcontractor: Subcontractor = {
      ...subcontractor,
      ...updates,
      // Ensure we don't overwrite these fields with undefined
      website: updates.website || subcontractor.website,
      serviceTypes: updates.serviceTypes || subcontractor.serviceTypes,
      licenses: updates.licenses || subcontractor.licenses,
      references: updates.references || subcontractor.references,
      howDidYouHear: updates.howDidYouHear || subcontractor.howDidYouHear
    };
    
    this.subcontractors.set(id, updatedSubcontractor);
    return updatedSubcontractor;
  }

  async updateSubcontractorStatus(id: number, status: string): Promise<Subcontractor | undefined> {
    const subcontractor = this.subcontractors.get(id);
    if (!subcontractor) return undefined;
    
    const updatedSubcontractor: Subcontractor = {
      ...subcontractor,
      status
    };
    
    this.subcontractors.set(id, updatedSubcontractor);
    return updatedSubcontractor;
  }

  async updateSubcontractorNotes(id: number, notes: string): Promise<Subcontractor | undefined> {
    const subcontractor = this.subcontractors.get(id);
    if (!subcontractor) return undefined;
    
    const updatedSubcontractor: Subcontractor = {
      ...subcontractor,
      notes
    };
    
    this.subcontractors.set(id, updatedSubcontractor);
    return updatedSubcontractor;
  }

  async deleteSubcontractor(id: number): Promise<boolean> {
    return this.subcontractors.delete(id);
  }

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const id = this.vendorCurrentId++;
    const now = new Date();
    
    const newVendor: Vendor = {
      id,
      companyName: vendor.companyName,
      contactName: vendor.contactName,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      zip: vendor.zip,
      website: vendor.website || null,
      supplyTypes: vendor.supplyTypes || [],
      serviceDescription: vendor.serviceDescription,
      yearsInBusiness: vendor.yearsInBusiness,
      references: vendor.references || null,
      howDidYouHear: vendor.howDidYouHear || null,
      status: "pending",
      notes: null,
      createdAt: now
    };
    
    this.vendors.set(id, newVendor);
    return newVendor;
  }

  async updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor: Vendor = {
      ...vendor,
      ...updates,
      // Ensure we don't overwrite these fields with undefined
      website: updates.website || vendor.website,
      supplyTypes: updates.supplyTypes || vendor.supplyTypes,
      references: updates.references || vendor.references,
      howDidYouHear: updates.howDidYouHear || vendor.howDidYouHear
    };
    
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async updateVendorStatus(id: number, status: string): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor: Vendor = {
      ...vendor,
      status
    };
    
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async updateVendorNotes(id: number, notes: string): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor: Vendor = {
      ...vendor,
      notes
    };
    
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async deleteVendor(id: number): Promise<boolean> {
    return this.vendors.delete(id);
  }
  
  // Job Posting methods
  async getJobPostings(): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values());
  }
  
  async getActiveJobPostings(): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values())
      .filter(job => job.active === true);
  }
  
  async getFeaturedJobPostings(): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values())
      .filter(job => job.featured === true && job.active === true);
  }
  
  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    return this.jobPostings.get(id);
  }
  
  async createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting> {
    const id = this.jobPostingCurrentId++;
    const now = new Date();
    
    const newJobPosting: JobPosting = {
      id,
      title: jobPosting.title,
      department: jobPosting.department,
      location: jobPosting.location,
      type: jobPosting.type,
      description: jobPosting.description,
      requirements: jobPosting.requirements,
      responsibilities: jobPosting.responsibilities,
      benefits: jobPosting.benefits || null,
      salary: jobPosting.salary || null,
      applyUrl: jobPosting.applyUrl || null,
      active: jobPosting.active ?? true,
      featured: jobPosting.featured ?? false,
      createdAt: now,
      updatedAt: now
    };
    
    this.jobPostings.set(id, newJobPosting);
    return newJobPosting;
  }
  
  async updateJobPosting(id: number, jobPostingUpdate: Partial<InsertJobPosting>): Promise<JobPosting | undefined> {
    const jobPosting = this.jobPostings.get(id);
    if (!jobPosting) return undefined;
    
    const updatedJobPosting: JobPosting = {
      ...jobPosting,
      ...jobPostingUpdate,
      updatedAt: new Date()
    };
    
    this.jobPostings.set(id, updatedJobPosting);
    return updatedJobPosting;
  }
  
  async toggleJobPostingActive(id: number): Promise<JobPosting | undefined> {
    const jobPosting = this.jobPostings.get(id);
    if (!jobPosting) return undefined;
    
    const updatedJobPosting: JobPosting = {
      ...jobPosting,
      active: !jobPosting.active,
      updatedAt: new Date()
    };
    
    this.jobPostings.set(id, updatedJobPosting);
    return updatedJobPosting;
  }
  
  async toggleJobPostingFeatured(id: number): Promise<JobPosting | undefined> {
    const jobPosting = this.jobPostings.get(id);
    if (!jobPosting) return undefined;
    
    const updatedJobPosting: JobPosting = {
      ...jobPosting,
      featured: !jobPosting.featured,
      updatedAt: new Date()
    };
    
    this.jobPostings.set(id, updatedJobPosting);
    return updatedJobPosting;
  }
  
  async deleteJobPosting(id: number): Promise<boolean> {
    return this.jobPostings.delete(id);
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values())
      .sort((a, b) => {
        const orderA = a.order !== null ? a.order : 0;
        const orderB = b.order !== null ? b.order : 0;
        return orderA - orderB;
      });
  }

  async getActiveTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values())
      .filter(member => member.active === true)
      .sort((a, b) => {
        const orderA = a.order !== null ? a.order : 0;
        const orderB = b.order !== null ? b.order : 0;
        return orderA - orderB;
      });
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberCurrentId++;
    const now = new Date();
    
    const newTeamMember: TeamMember = {
      id,
      name: teamMember.name,
      designation: teamMember.designation,
      qualification: teamMember.qualification,
      gender: teamMember.gender,
      photo: teamMember.photo || null,
      bio: teamMember.bio || null,
      order: teamMember.order || 0,
      active: teamMember.active ?? true,
      createdAt: now,
      updatedAt: now
    };
    
    this.teamMembers.set(id, newTeamMember);
    return newTeamMember;
  }

  async updateTeamMember(id: number, teamMemberUpdate: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const teamMember = this.teamMembers.get(id);
    if (!teamMember) return undefined;
    
    const updatedTeamMember: TeamMember = {
      ...teamMember,
      ...teamMemberUpdate,
      updatedAt: new Date()
    };
    
    this.teamMembers.set(id, updatedTeamMember);
    return updatedTeamMember;
  }

  async toggleTeamMemberActive(id: number): Promise<TeamMember | undefined> {
    const teamMember = this.teamMembers.get(id);
    if (!teamMember) return undefined;
    
    const updatedTeamMember: TeamMember = {
      ...teamMember,
      active: !teamMember.active,
      updatedAt: new Date()
    };
    
    this.teamMembers.set(id, updatedTeamMember);
    return updatedTeamMember;
  }

  async updateTeamMemberOrder(id: number, order: number): Promise<TeamMember | undefined> {
    const teamMember = this.teamMembers.get(id);
    if (!teamMember) return undefined;
    
    const updatedTeamMember: TeamMember = {
      ...teamMember,
      order,
      updatedAt: new Date()
    };
    
    this.teamMembers.set(id, updatedTeamMember);
    return updatedTeamMember;
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    return this.teamMembers.delete(id);
  }
}

// Import DBStorage
import { DBStorage } from "./dbStorage";

// Choose which storage implementation to use
// Use DBStorage for production, MemStorage for development if needed
export const storage = new DBStorage();
