import { db } from "../server/db";
import { users, projects, services, blogPosts, testimonials } from "../shared/schema";

// Seed the database with initial data
async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Add services
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
    
    await db.insert(services).values(defaultServices).onConflictDoNothing();
    console.log("✅ Services created");

    // Add sample projects
    const now = new Date();
    const defaultProjects = [
      {
        title: "Eastside Corporate Center",
        category: "Commercial Office",
        description: "A modern glass office building featuring sustainable design elements and state-of-the-art facilities for a premier business environment.",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        featured: true,
        createdAt: now
      },
      {
        title: "The Westview Residences",
        category: "Residential Complex",
        description: "Luxury apartment complex with premium amenities, modern design, and comfortable living spaces in a desirable neighborhood.",
        image: "https://images.unsplash.com/photo-1613782558577-530a88a5790a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        featured: true,
        createdAt: now
      },
      {
        title: "Summit Shopping Center",
        category: "Retail Development",
        description: "Modern retail space designed for optimal customer flow, featuring sustainable materials and energy-efficient systems.",
        image: "https://images.unsplash.com/photo-1565615833231-e8c91a38a012?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        featured: true,
        createdAt: now
      },
      {
        title: "Grand Horizon Hotel",
        category: "Hospitality",
        description: "Elegant hotel featuring contemporary design with luxurious amenities, meeting spaces, and dining facilities for discerning travelers.",
        image: "https://images.unsplash.com/photo-1577942933954-ab8e992e20b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
        featured: true,
        createdAt: now
      },
      {
        title: "Northside Manufacturing Plant",
        category: "Industrial",
        description: "State-of-the-art manufacturing facility designed for optimal workflow, safety, and energy efficiency.",
        image: "https://images.unsplash.com/photo-1519558260268-cde7e03a0152?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        featured: true,
        createdAt: now
      },
      {
        title: "Riverdale University Center",
        category: "Educational",
        description: "Modern educational facility featuring flexible learning spaces, advanced technology infrastructure, and sustainable design elements.",
        image: "https://images.unsplash.com/photo-1519687079572-8db97e023969?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
        featured: true,
        createdAt: now
      }
    ];
    
    await db.insert(projects).values(defaultProjects).onConflictDoNothing();
    console.log("✅ Projects created");

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
        published: true,
        createdAt: now
      },
      {
        title: "The Evolution of Architectural Design in Commercial Buildings",
        slug: "evolution-architectural-design",
        content: "Explore how commercial architecture has evolved over the decades and what trends are shaping the future of building design...",
        excerpt: "Explore how commercial architecture has evolved over the decades and what trends are shaping the future of building design.",
        image: "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80",
        category: "Architecture",
        author: "Emma Johnson",
        published: true,
        createdAt: now
      },
      {
        title: "How Technology is Transforming the Construction Industry",
        slug: "technology-transforming-construction",
        content: "From BIM to drones and AI, discover how technological innovations are revolutionizing construction processes and outcomes...",
        excerpt: "From BIM to drones and AI, discover how technological innovations are revolutionizing construction processes and outcomes.",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
        category: "Technology",
        author: "Robert Chen",
        published: true,
        createdAt: now
      }
    ];
    
    await db.insert(blogPosts).values(defaultBlogPosts).onConflictDoNothing();
    console.log("✅ Blog posts created");

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
    
    await db.insert(testimonials).values(defaultTestimonials).onConflictDoNothing();
    console.log("✅ Testimonials created");

    console.log("✅ Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();