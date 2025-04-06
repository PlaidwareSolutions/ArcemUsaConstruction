import { db } from "../server/db";
import { services } from "../shared/schema";

async function seedServicesData() {
  try {
    console.log("Adding services data to the database...");
    
    // Services from arcemusa.com
    const servicesData = [
      {
        title: "Project Planning",
        description: "Our project planning services provide a solid foundation for your construction project, ensuring it starts on the right track and stays there.",
        icon: "clipboard-list",
        features: [
          "Feasibility studies", 
          "Site analysis", 
          "Budget planning", 
          "Schedule development", 
          "Risk assessment",
          "Stakeholder coordination"
        ]
      },
      {
        title: "Design & Engineering",
        description: "We offer comprehensive design and engineering services that translate your vision into practical, buildable plans while meeting all regulatory requirements.",
        icon: "pencil-ruler",
        features: [
          "Architectural design", 
          "Structural engineering", 
          "MEP systems design", 
          "3D modeling and visualization", 
          "Sustainable design solutions",
          "Code compliance review"
        ]
      },
      {
        title: "Residential Construction",
        description: "From custom homes to multi-family complexes, our residential construction services deliver exceptional living spaces tailored to your needs.",
        icon: "home",
        features: [
          "Custom home building", 
          "Multi-family developments", 
          "High-end residential projects", 
          "Energy-efficient construction", 
          "Interior finishing",
          "Outdoor living spaces"
        ]
      },
      {
        title: "Commercial Construction",
        description: "Our commercial construction services create functional, attractive spaces that help businesses thrive while meeting operational requirements and budget constraints.",
        icon: "building",
        features: [
          "Office buildings", 
          "Retail spaces", 
          "Restaurants", 
          "Hotels", 
          "Medical facilities",
          "Tenant improvements"
        ]
      },
      {
        title: "Renovation & Remodeling",
        description: "Transform existing spaces with our renovation and remodeling services, breathing new life into homes and commercial properties.",
        icon: "tools",
        features: [
          "Kitchen renovations", 
          "Bathroom remodels", 
          "Whole-house renovations", 
          "Commercial renovations", 
          "Historic property restoration",
          "Adaptive reuse"
        ]
      },
      {
        title: "Construction Management",
        description: "Our construction management services provide expert oversight throughout the building process, ensuring quality, efficiency, and accountability.",
        icon: "hard-hat",
        features: [
          "Budget management", 
          "Schedule oversight", 
          "Quality control", 
          "Contract administration", 
          "Subcontractor coordination",
          "Progress reporting"
        ]
      },
      {
        title: "Industrial Construction",
        description: "We design and build industrial facilities that support efficient operations, meet safety standards, and accommodate specialized equipment and workflows.",
        icon: "industry",
        features: [
          "Manufacturing facilities", 
          "Warehouses", 
          "Distribution centers", 
          "Process facilities", 
          "Heavy industrial projects",
          "Specialized infrastructure"
        ]
      },
      {
        title: "Mechanical, Electrical & Plumbing",
        description: "Our comprehensive MEP services ensure that the vital systems running through your building operate efficiently and safely.",
        icon: "bolt",
        features: [
          "HVAC systems", 
          "Electrical installations", 
          "Plumbing systems", 
          "Fire protection", 
          "Energy-efficient solutions",
          "Smart building technology"
        ]
      },
      {
        title: "Civil Engineering",
        description: "Our civil engineering services address site development, infrastructure, and environmental considerations for projects of all scales.",
        icon: "drafting-compass",
        features: [
          "Site development", 
          "Grading and drainage", 
          "Utilities installation", 
          "Road construction", 
          "Environmental compliance",
          "Stormwater management"
        ]
      },
      {
        title: "Sustainable Construction",
        description: "Build for the future with our sustainable construction services, incorporating eco-friendly practices and materials into your project.",
        icon: "leaf",
        features: [
          "Green building certification", 
          "Energy-efficient design", 
          "Renewable energy integration", 
          "Sustainable materials", 
          "Water conservation solutions",
          "Waste reduction strategies"
        ]
      },
      {
        title: "Project Consulting",
        description: "Our consulting services provide expert advice at any stage of your project, helping you make informed decisions that align with your goals.",
        icon: "comments",
        features: [
          "Pre-construction consulting", 
          "Value engineering", 
          "Project troubleshooting", 
          "Expert witness services", 
          "Due diligence for acquisitions",
          "Construction technology consulting"
        ]
      },
      {
        title: "Real Estate Development",
        description: "From site selection to occupancy, our development services navigate the complex process of bringing real estate projects to life.",
        icon: "city",
        features: [
          "Market analysis", 
          "Site selection", 
          "Entitlement assistance", 
          "Investment analysis", 
          "Project financing strategies",
          "Development management"
        ]
      }
    ];
    
    // Clear existing services before adding new ones (if needed)
    await db.delete(services);
    
    // Insert new services
    for (const service of servicesData) {
      await db.insert(services).values(service);
    }
    
    console.log("Services added successfully!");
  } catch (error) {
    console.error("Error adding services:", error);
  } finally {
    process.exit(0);
  }
}

// Run the function
seedServicesData();