import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { initializeRevealEffects, scrollToTop } from '@/lib/utils';
import { Service, ServiceGallery } from '@shared/schema';
import { Building, Home, Wrench, Clipboard, Factory, Settings } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselPrevious, 
  CarouselNext 
} from "@/components/ui/carousel";
// Using AutoplayType to avoid TypeScript errors
import Autoplay, { type AutoplayType } from 'embla-carousel-autoplay';
import { apiRequest } from '@/lib/queryClient';

const Services = () => {
  useEffect(() => {
    scrollToTop();
    document.title = 'Services - ARCEM';
    const cleanup = initializeRevealEffects();
    return cleanup;
  }, []);

  const { data: services, isLoading, error } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  // Get icon component based on icon name
  const getIcon = (iconName: string, size: "small" | "large" = "large") => {
    const className = size === "small" ? "w-6 h-6 mr-2" : "w-16 h-16";
    
    switch (iconName.toLowerCase()) {
      case 'building':
        return <Building className={className} />;
      case 'home':
        return <Home className={className} />;
      case 'tool':
        return <Wrench className={className} />;
      case 'clipboard':
        return <Clipboard className={className} />;
      case 'factory':
        return <Factory className={className} />;
      case 'settings':
        return <Settings className={className} />;
      default:
        return <Building className={className} />;
    }
  };
  
  // State to store service gallery images
  const [serviceGalleries, setServiceGalleries] = useState<{ [key: number]: ServiceGallery[] }>({});
  
  // Fetch gallery images for each service
  useEffect(() => {
    const fetchGalleryImages = async () => {
      if (services && services.length > 0) {
        const galleries: { [key: number]: ServiceGallery[] } = {};
        
        for (const service of services) {
          try {
            const response = await apiRequest('GET', `/api/services/${service.id}/gallery`);
            const galleryData = await response.json();
            galleries[service.id] = galleryData;
          } catch (error) {
            console.error(`Error fetching gallery for service ${service.id}:`, error);
            galleries[service.id] = [];
          }
        }
        
        setServiceGalleries(galleries);
      }
    };
    
    fetchGalleryImages();
  }, [services]);
  
  // Get service images from gallery or fallback to defaults
  const getServiceImages = (service: Service) => {
    // If we have gallery images for this service, use them
    if (serviceGalleries[service.id] && serviceGalleries[service.id].length > 0) {
      return serviceGalleries[service.id].map(image => image.imageUrl);
    }
    
    // Otherwise use default images based on service type
    switch (service.title.toLowerCase()) {
      case 'commercial construction':
        return [
          '/images/commercial1.jpg',
          '/images/commercial2.jpg',
          '/images/commercial3.jpg'
        ];
      case 'residential construction':
        return [
          '/images/residential1.jpg',
          '/images/residential2.jpg',
          '/images/residential3.jpg'
        ];
      case 'renovation & remodeling':
        return [
          '/images/renovation1.jpg',
          '/images/renovation2.jpg',
          '/images/renovation3.jpg'
        ];
      case 'architectural design':
        return [
          '/images/slider1.png',
          '/images/slider2.png'
        ];
      case 'project management':
        return [
          '/images/slider3.png',
          '/images/slider4.png'
        ];
      case 'construction consultation':
        return [
          '/images/slider5.png',
          '/images/image_1741432012642.png'
        ];
      default:
        return [
          '/images/slider1.png',
          '/images/slider2.png'
        ];
    }
  };

  return (
    <>
      {/* Page Banner */}
      <div 
        className="relative h-[350px] flex items-center justify-center" 
        style={{
          backgroundImage: "url('/uploads/images/services.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <motion.div 
          className="container relative z-10 px-4 md:px-8 text-white py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">Our Services</h1>
          <p className="text-lg max-w-3xl">
            Comprehensive construction solutions delivered with expertise and dedication to excellence.
          </p>
        </motion.div>
      </div>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <h2 className="text-sm font-montserrat text-[#1E90DB] mb-4">WHAT WE OFFER</h2>
            <h3 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">Comprehensive Construction Solutions</h3>
            <p className="text-gray-600 leading-relaxed">
              At ARCEM, we offer a wide range of construction services tailored to meet the specific needs of each client. Our team of experienced professionals is dedicated to delivering exceptional results that exceed expectations.
            </p>
          </div>

          {isLoading ? (
            // Loading state
            <div className="grid grid-cols-1 gap-12">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`animate-pulse flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}>
                  <div className="md:w-1/3">
                    <div className="rounded-lg overflow-hidden">
                      <div className="bg-gray-200 h-64 w-full"></div>
                    </div>
                  </div>
                  <div className="md:w-2/3 space-y-4">
                    <div className="flex items-center">
                      <div className="h-6 w-6 bg-gray-200 rounded-full mr-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map(j => (
                        <div key={j} className="flex items-start">
                          <div className="w-5 h-5 bg-gray-200 rounded-full mr-2 mt-1"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      ))}
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-36 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Failed to load services. Please try again later.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-20">
              {services?.map((service, index) => (
                <div 
                  key={service.id}
                  className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center reveal`}
                >
                  <div className="md:w-1/3">
                    <Carousel 
                      className="w-full overflow-hidden rounded-lg shadow-xl"
                      opts={{
                        align: "start",
                        loop: true,
                        skipSnaps: false,
                        dragFree: false,
                      }}
                      plugins={[
                        // Using any to bypass TypeScript error with Autoplay plugin
                        Autoplay({
                          delay: 4000,
                          stopOnInteraction: true,
                          stopOnMouseEnter: true,
                        }) as any,
                      ]}
                    >
                      <CarouselContent>
                        {getServiceImages(service).map((image, i) => (
                          <CarouselItem key={i}>
                            <div className="h-64 w-full overflow-hidden">
                              <img 
                                src={image}
                                alt={`${service.title} showcase ${i+1}`}
                                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                                onError={(e) => {
                                  e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/1e293b?text=Service+Image";
                                }}
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </Carousel>
                  </div>
                  <div className="md:w-2/3">
                    <div className="flex items-center mb-4">
                      <div className="text-[#1E90DB]">
                        {getIcon(service.icon, "small")}
                      </div>
                      <h4 className="text-2xl font-montserrat font-bold">{service.title}</h4>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-2 text-gray-600 mb-6">
                      {service.features && service.features.length > 0 ? (
                        service.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <svg className="w-5 h-5 text-[#1E90DB] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))
                      ) : (
                        // Fallback to default features if none are provided
                        ['Expert Team of Professionals', 
                        'Quality Materials and Craftsmanship', 
                        'Timely Project Completion', 
                        'Competitive Pricing', 
                        'Attention to Detail'].map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <svg className="w-5 h-5 text-[#1E90DB] mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))
                      )}
                    </ul>
                    
                    <Link 
                      href={`/services/${service.id}/${service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      className="bg-[#1E90DB] hover:bg-[#1670B0] text-white py-2 px-6 font-montserrat font-medium text-sm tracking-wider inline-block transition-colors"
                    >
                      LEARN MORE
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <h2 className="text-sm font-montserrat text-[#1E90DB] mb-4">OUR PROCESS</h2>
            <h3 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">How We Work</h3>
            <p className="text-gray-600 leading-relaxed">
              Our streamlined process ensures a smooth experience from initial consultation to project completion.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 shadow-lg hover-scale reveal">
              <div className="w-12 h-12 bg-[#1E90DB] text-white rounded-full flex items-center justify-center font-montserrat font-bold text-xl mb-6">1</div>
              <h4 className="text-xl font-montserrat font-bold mb-4">Consultation</h4>
              <p className="text-gray-600 leading-relaxed">
                We begin with a thorough consultation to understand your vision, needs, and budget. This allows us to provide tailored solutions and accurate estimates.
              </p>
            </div>
            
            <div className="bg-white p-8 shadow-lg hover-scale reveal">
              <div className="w-12 h-12 bg-[#1E90DB] text-white rounded-full flex items-center justify-center font-montserrat font-bold text-xl mb-6">2</div>
              <h4 className="text-xl font-montserrat font-bold mb-4">Planning & Design</h4>
              <p className="text-gray-600 leading-relaxed">
                Our team develops detailed plans and designs that bring your vision to life while addressing practical considerations and regulatory requirements.
              </p>
            </div>
            
            <div className="bg-white p-8 shadow-lg hover-scale reveal">
              <div className="w-12 h-12 bg-[#1E90DB] text-white rounded-full flex items-center justify-center font-montserrat font-bold text-xl mb-6">3</div>
              <h4 className="text-xl font-montserrat font-bold mb-4">Construction</h4>
              <p className="text-gray-600 leading-relaxed">
                We execute the project with precision, adhering to the highest standards of quality and safety while keeping you informed throughout the process.
              </p>
            </div>
            
            <div className="bg-white p-8 shadow-lg hover-scale reveal">
              <div className="w-12 h-12 bg-[#1E90DB] text-white rounded-full flex items-center justify-center font-montserrat font-bold text-xl mb-6">4</div>
              <h4 className="text-xl font-montserrat font-bold mb-4">Completion & Support</h4>
              <p className="text-gray-600 leading-relaxed">
                After the final walkthrough and handover, we provide ongoing support to ensure your complete satisfaction with the delivered project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <div className="max-w-3xl mx-auto reveal">
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">Ready to Discuss Your Project?</h2>
            <p className="text-lg mb-8">
              Contact us today to schedule a consultation with our team of experts.
            </p>
            <Link
              href="/contact" 
              className="bg-[#1E90DB] hover:bg-[#1670B0] text-white py-3 px-8 font-montserrat font-medium text-sm tracking-wider inline-block transition-colors"
            >
              REACH US
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
