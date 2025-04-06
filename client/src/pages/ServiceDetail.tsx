import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Service, ServiceGallery } from "@shared/schema";
import { scrollToTop } from "@/lib/utils";
import {
  Building,
  Home,
  Wrench,
  Clipboard,
  Factory,
  Settings,
  ArrowRight,
  Check,
  PencilRuler,
  BarChart,
  HardHat,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
// Using AutoplayType to avoid TypeScript errors
import Autoplay, { type AutoplayType } from "embla-carousel-autoplay";
import { apiRequest } from "@/lib/queryClient";
import { useService } from "@/hooks/useService";

const ServiceDetail = () => {
  // Extract service ID from URL
  const [, params] = useRoute("/services/:id/:slug");
  const serviceId = params ? parseInt(params.id) : undefined;

  // State for gallery images
  const [galleryImages, setGalleryImages] = useState<ServiceGallery[]>([]);

  useEffect(() => {
    scrollToTop();
    // Title will be updated after data is loaded
  }, []);

  // Fetch service data
  const {
    data: services,
    isLoading,
    error,
  } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Fetch service gallery images
  const { data: serviceGallery, isLoading: isLoadingGallery } = useQuery<
    ServiceGallery[]
  >({
    queryKey: ["/api/services", serviceId, "gallery"],
    queryFn: async () => {
      if (!serviceId) return [];
      
      console.log(`ServiceDetail: Fetching gallery for service ID ${serviceId}`);
      try {
        const res = await fetch(`/api/services/${serviceId}/gallery`);
        
        if (!res.ok) {
          console.error(`Failed to fetch gallery for service ${serviceId}: ${res.status} ${res.statusText}`);
          return [];
        }
        
        const data = await res.json();
        console.log(`ServiceDetail: Found ${data.length} gallery images for service ${serviceId}`);
        
        if (data && Array.isArray(data) && data.length > 0) {
          console.log(`ServiceDetail: First gallery image URL:`, data[0].imageUrl);
          return data;
        } else {
          console.log(`ServiceDetail: No gallery images found for service ${serviceId}`);
          return [];
        }
      } catch (error) {
        console.error(`ServiceDetail: Error fetching gallery:`, error);
        return [];
      }
    },
    enabled: !!serviceId,
  });

  // Find the specific service data
  const service = services?.find((s) => s.id === serviceId);

  // Update gallery images when serviceGallery data changes
  useEffect(() => {
    if (serviceGallery && serviceGallery.length > 0) {
      console.log("Service gallery images:", serviceGallery);
      setGalleryImages(serviceGallery as ServiceGallery[]);
    }
  }, [serviceGallery]);

  // Update page title when service data is loaded
  useEffect(() => {
    if (service) {
      document.title = `${service.title} - ARCEM`;
    }
  }, [service]);

  // Get service images from gallery or fallback to defaults
  const getServiceImages = (serviceType: string) => {
    console.log(`Getting images for service ID: ${serviceId}, title: ${serviceType}`);
    
    // If we have gallery images for this service, use them
    if (serviceGallery && serviceGallery.length > 0) {
      console.log(`Using ${serviceGallery.length} gallery images for service ${serviceId} (${serviceType})`);
      return serviceGallery
        .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order if available
        .map(image => image.imageUrl);
    }
    
    console.log(`No gallery images found for service ${serviceId} (${serviceType}), using defaults`);
    
    // Otherwise use default images based on service type
    const serviceTitle = serviceType.toLowerCase();
    
    if (serviceTitle.includes('commercial')) {
      return [
        '/images/commercial1.jpg',
        '/images/commercial2.jpg',
        '/images/commercial3.jpg'
      ];
    } else if (serviceTitle.includes('residential')) {
      return [
        '/images/residential1.jpg',
        '/images/residential2.jpg',
        '/images/residential3.jpg'
      ];
    } else if (serviceTitle.includes('renovation') || serviceTitle.includes('remodeling')) {
      return [
        '/images/renovation1.jpg',
        '/images/renovation2.jpg',
        '/images/renovation3.jpg'
      ];
    } else if (serviceTitle.includes('design') || serviceTitle.includes('engineering')) {
      return [
        '/images/slider1.png',
        '/images/slider2.png',
        '/images/image_1741509665889.png'
      ];
    } else if (serviceTitle.includes('management')) {
      return [
        '/images/slider3.png',
        '/images/slider4.png',
        '/images/image_1741509691873.png'
      ];
    } else if (serviceTitle.includes('consultation')) {
      return [
        '/images/slider5.png',
        '/images/image_1741432012642.png'
      ];
    } else {
        return ["/images/slider1.png", "/images/slider2.png"];
    }
  };

  // Get icon component based on icon name
  const getIcon = (iconName?: string) => {
    if (!iconName) return <Building className="w-16 h-16" />;

    switch (iconName.toLowerCase()) {
      case "building":
        return <Building className="w-16 h-16" />;
      case "home":
        return <Home className="w-16 h-16" />;
      case "tool":
        return <Wrench className="w-16 h-16" />;
      case "clipboard":
        return <Clipboard className="w-16 h-16" />;
      case "factory":
        return <Factory className="w-16 h-16" />;
      case "settings":
        return <Settings className="w-16 h-16" />;
      case "pencil-ruler":
        return <PencilRuler className="w-16 h-16" />;
      case "bar-chart":
        return <BarChart className="w-16 h-16" />;
      case "hard-hat":
        return <HardHat className="w-16 h-16" />;
      default:
        return <Building className="w-16 h-16" />;
    }
  };

  // Service-specific content based on service type
  const getServiceDetails = (service: Service) => {
    // Get detailed service description based on title
    const getServiceDescription = (title: string) => {
      switch (title.toLowerCase()) {
        case "commercial construction":
          return {
            description:
              "Our commercial construction services deliver high-quality, functional spaces for businesses of all sizes. From office buildings to retail spaces, we combine architectural excellence with practical functionality to create commercial environments that enhance productivity and leave a lasting impression.",
            features: [
              "Turn-key commercial building solutions",
              "Office and retail space construction",
              "Restaurant and hospitality building projects",
              "Medical facility construction",
              "Educational institution construction",
              "Commercial renovations and expansions",
            ],
            approach:
              "We approach each commercial project with a focus on efficiency, durability, and your specific business needs. Our team collaborates closely with architects, engineers, and your stakeholders to ensure every detail meets your expectations and building code requirements.",
            benefits: [
              "Cost-effective building solutions",
              "Efficient project management for on-time completion",
              "Energy-efficient design and construction",
              "High-quality materials and craftsmanship",
              "Minimal disruption to surrounding businesses",
              "Long-term structural integrity",
            ],
          };
        case "residential construction":
          return {
            description:
              "We build dream homes that reflect your personal style and meet your family's needs. Our residential construction services focus on creating living spaces that combine beauty, functionality, and excellent craftsmanship, resulting in homes you'll love for years to come.",
            features: [
              "Custom home design and construction",
              "Luxury home building services",
              "Multi-family residential projects",
              "Housing development construction",
              "Residential additions and expansions",
              "Energy-efficient home construction",
            ],
            approach:
              "Our residential construction process begins with understanding your vision, lifestyle needs, and budget. We collaborate with you at every stage, from initial design through construction, ensuring your new home perfectly reflects your personal style and requirements.",
            benefits: [
              "Personalized design and construction process",
              "Quality materials and superior craftsmanship",
              "Energy-efficient building techniques",
              "Transparent communication throughout the project",
              "Attention to detail in every aspect",
              "Built to last for generations",
            ],
          };
        case "renovation & remodeling":
          return {
            description:
              "Transform your existing space with our renovation and remodeling services. Whether you're updating a single room or completely renovating an entire property, our team delivers results that enhance functionality, aesthetics, and property value.",
            features: [
              "Complete home renovations",
              "Kitchen and bathroom remodeling",
              "Basement finishing and conversions",
              "Commercial space renovations",
              "Historic building restoration",
              "Structural renovations and repairs",
            ],
            approach:
              "Our renovation process begins with a thorough assessment of your existing space and a clear understanding of your goals. We develop detailed plans that respect the original structure while incorporating modern improvements and your design preferences.",
            benefits: [
              "Increased property value",
              "Improved functionality and space utilization",
              "Updated aesthetics and design",
              "Enhanced energy efficiency",
              "Modern amenities and features",
              "Preserved architectural character where desired",
            ],
          };
        case "architectural design":
          return {
            description:
              "Our comprehensive architectural design services set the foundation for successful construction projects. We combine creative design thinking with practical construction knowledge to develop plans that are both aesthetically pleasing and buildable within your budget.",
            features: [
              "Innovative architectural designs",
              "Construction planning and feasibility studies",
              "3D modeling and visualizations",
              "Budget development and cost estimating",
              "Permit acquisition assistance",
              "Sustainable design solutions",
            ],
            approach:
              "We take a collaborative approach to architectural design, working closely with you to understand your vision, needs, and constraints. Our team integrates creative design concepts with practical construction considerations to develop comprehensive plans that guide successful project execution.",
            benefits: [
              "Cohesive vision and design direction",
              "Early identification of potential challenges",
              "Accurate budgeting and cost control",
              "Streamlined construction process",
              "Optimized space utilization",
              "Integrated sustainable design elements",
            ],
          };
        case "project management":
          return {
            description:
              "Our professional project management services ensure your construction project is executed efficiently and effectively. We coordinate all aspects of the project, from planning and design to execution and completion, delivering a seamless experience and superior results.",
            features: [
              "Comprehensive project planning",
              "Budget development and management",
              "Schedule coordination and optimization",
              "Resource allocation and management",
              "Quality control and assurance",
              "Risk assessment and mitigation",
            ],
            approach:
              "We approach project management with a focus on clear communication, proactive problem-solving, and meticulous attention to detail. Our experienced project managers work closely with all stakeholders to ensure alignment, anticipate challenges, and deliver successful outcomes.",
            benefits: [
              "Streamlined project execution",
              "Minimized delays and disruptions",
              "Optimized resource utilization",
              "Enhanced collaboration among all parties",
              "Regular progress updates and transparency",
              "Successful project completion within scope, time, and budget",
            ],
          };
        case "construction consultation":
          return {
            description:
              "Our expert construction consultation services provide valuable advice and guidance for all types of construction projects. We help you make informed decisions, optimize your building plans, and avoid common pitfalls that can lead to delays and budget overruns.",
            features: [
              "Pre-construction feasibility studies",
              "Building code and regulatory compliance",
              "Material selection and sourcing advice",
              "Construction method recommendations",
              "Cost estimation and value engineering",
              "Quality control and inspection services",
            ],
            approach:
              "Our consultation approach focuses on understanding your specific needs and project goals. We provide objective, expert advice based on years of industry experience, helping you navigate the complexities of construction planning and execution with confidence.",
            benefits: [
              "Reduced risk of costly mistakes",
              "Access to expert industry knowledge",
              "Improved project planning and preparation",
              "Time and cost savings through optimization",
              "Compliance with building codes and regulations",
              "Informed decision-making throughout the process",
            ],
          };
        default:
          return {
            description:
              "Our professional construction services deliver quality results for all types of projects. We combine industry expertise with dedicated craftsmanship to create spaces that exceed expectations and stand the test of time.",
            features: [
              "Professional construction services",
              "Expert team of builders and craftsmen",
              "Quality materials and construction methods",
              "Adherence to building codes and regulations",
              "Comprehensive project management",
              "Attention to detail at every stage",
            ],
            approach:
              "We take a client-centered approach to every project, ensuring your specific needs and preferences guide our work. Our experienced team manages all aspects of the construction process, keeping you informed and involved at every stage.",
            benefits: [
              "High-quality construction results",
              "Professional project management",
              "Excellent communication throughout the process",
              "Adherence to schedule and budget",
              "Durable and functional finished spaces",
              "Comprehensive warranty coverage",
            ],
          };
      }
    };

    const serviceDetails = getServiceDescription(service.title);

    // Use gallery images from the API if available, otherwise fall back to hardcoded images
    const serviceImages =
      galleryImages.length > 0
        ? galleryImages.map((image) => image.imageUrl)
        : getServiceImages(service.title);

    return (
      <>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row gap-12 items-start">
              <div className="md:w-2/3">
                <div className="mb-8">
                  <h2 className="text-3xl font-montserrat font-bold mb-6">
                    Overview
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {serviceDetails.description}
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-montserrat font-bold mb-4">
                    Our Approach
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {serviceDetails.approach}
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-montserrat font-bold mb-4">
                    Key Features
                  </h3>
                  <ul className="space-y-2 mb-6">
                    {service.features && service.features.length > 0
                      ? service.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="w-5 h-5 text-[#1E90DB] mr-2 mt-1 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))
                      : // Fallback to hard-coded features if none are found in database
                        serviceDetails.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="w-5 h-5 text-[#1E90DB] mr-2 mt-1 flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                  </ul>
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-montserrat font-bold mb-4">
                    Benefits
                  </h3>
                  <ul className="space-y-2">
                    {serviceDetails.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-[#1E90DB] mr-2 mt-1 flex-shrink-0" />
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href="/request-quote"
                    className="bg-[#1E90DB] hover:bg-[#1670B0] text-white py-3 px-8 font-montserrat font-medium text-sm tracking-wider inline-block transition-colors"
                  >
                    REQUEST A QUOTE
                  </Link>
                </div>
              </div>

              <div className="md:w-1/3">
                <div className="sticky top-24 bg-gray-100 p-6 rounded-lg">
                  <div className="text-[#1E90DB] mb-4">
                    {getIcon(service.icon || undefined)}
                  </div>
                  <h3 className="text-xl font-montserrat font-bold mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>

                  <div className="space-y-4 mt-8">
                    <h4 className="font-semibold text-lg">Contact Us</h4>
                    <div className="flex items-center">
                      <span className="mr-2 text-gray-700">Phone:</span>
                      <div className="text-[#1E90DB]">
                        <a
                          href="tel:+17136240083"
                          className="hover:text-[#1670B0] block"
                        >
                          Cell: (713) 624-0083
                        </a>
                        <a
                          href="tel:+17136240313"
                          className="hover:text-[#1670B0] block"
                        >
                          Office: (713) 624-0313
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2 text-gray-700">Email:</span>
                      <div className="text-[#1E90DB]">
                        <a
                          href="mailto:aj@arcemusa.com"
                          className="hover:text-[#1670B0] block"
                        >
                          aj@arcemusa.com
                        </a>
                        <a
                          href="mailto:admin@arcemusa.com"
                          className="hover:text-[#1670B0] block"
                        >
                          admin@arcemusa.com
                        </a>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        href="/contact"
                        className="inline-flex items-center text-[#1E90DB] hover:text-[#1670B0] font-medium"
                      >
                        Contact Us
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-montserrat font-bold mb-12 text-center">
              Our {service.title} Projects
            </h2>

            <Carousel
              className="w-full"
              opts={{
                align: "start",
                loop: true,
                skipSnaps: false,
                dragFree: false,
              }}
              plugins={[
                // Using any to bypass TypeScript error with Autoplay plugin
                Autoplay({
                  delay: 5000,
                  stopOnInteraction: true,
                  stopOnMouseEnter: true,
                }) as any,
              ]}
            >
              <CarouselContent className="p-1">
                {serviceImages.map((img, index) => (
                  <CarouselItem
                    key={index}
                    className="basis-full md:basis-1/3 pl-1 pr-5"
                  >
                    <div className="bg-white shadow-lg overflow-hidden hover-scale h-full">
                      <div className="h-64 bg-gray-300 relative overflow-hidden">
                        <img
                          src={img}
                          alt={`${service.title} project ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback for missing images
                            e.currentTarget.src =
                              "https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image";
                          }}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-montserrat font-bold text-lg mb-2">
                          {service.title} Project {index + 1}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Example {service.title.toLowerCase()} project
                          showcasing our expertise and quality craftsmanship.
                        </p>
                        <Link
                          href="/projects"
                          className="text-[#1E90DB] hover:text-[#1670B0] inline-flex items-center"
                        >
                          View More Projects
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:flex justify-end gap-2 mt-4">
                <CarouselPrevious className="static transform-none" />
                <CarouselNext className="static transform-none" />
              </div>
            </Carousel>
          </div>
        </section>

        {/* Call To Action */}
        <section className="py-20 bg-black text-white">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">
                Ready to Start Your {service.title} Project?
              </h2>
              <p className="text-lg mb-8">
                Contact us today to schedule a consultation with our team of
                experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-[#1E90DB] hover:bg-[#1670B0] text-white py-3 px-8 font-montserrat font-medium text-sm tracking-wider inline-block transition-colors"
                >
                  REACH US
                </Link>
                <Link
                  href="/request-quote"
                  className="bg-transparent border border-white hover:bg-white hover:text-black text-white py-3 px-8 font-montserrat font-medium text-sm tracking-wider inline-block transition-colors"
                >
                  REQUEST A QUOTE
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-[#1E90DB]" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-3xl font-montserrat font-bold mb-4">
          Service Not Found
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          The service you're looking for could not be found or may have been
          removed.
        </p>
        <Link
          href="/services"
          className="bg-[#1E90DB] hover:bg-[#1670B0] text-white py-3 px-8 font-montserrat font-medium text-sm tracking-wider inline-block transition-colors"
        >
          VIEW ALL SERVICES
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Page Banner */}
      <div className="bg-black text-white py-32 relative">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
            {service.title}
          </h1>
          <p className="text-lg max-w-3xl">{service.description}</p>
        </div>
      </div>

      {/* Service Content */}
      {getServiceDetails(service)}
    </>
  );
};

export default ServiceDetail;
