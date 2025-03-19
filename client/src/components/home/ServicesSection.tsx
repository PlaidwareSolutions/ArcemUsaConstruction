import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { initializeRevealEffects } from '@/lib/utils';
import ServiceCard from '@/components/common/ServiceCard';
import { Service } from '@shared/schema';

const ServicesSection = () => {
  const { data: services, isLoading, error } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  useEffect(() => {
    const cleanup = initializeRevealEffects();
    return cleanup;
  }, []);

  if (error) {
    console.error('Error loading services:', error);
  }

  // Icons mapping
  const getIconName = (icon: string) => {
    return icon;
  };

  return (
    <section id="services" className="py-20 md:py-32 bg-gray-100">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <h2 className="text-sm font-montserrat text-[#1E90DB] mb-4">OUR SERVICES</h2>
          <h3 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">Comprehensive Construction Solutions</h3>
          <p className="text-gray-600 leading-relaxed">
            We offer a wide range of construction services to meet all your project needs, from initial planning to final execution.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading state
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white p-8 shadow-lg hover-scale reveal">
                <div className="h-52 bg-gray-200 animate-pulse"></div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center text-red-500">
              Failed to load services. Please try again later.
            </div>
          ) : (
            // Render actual services
            services?.map((service) => (
              <ServiceCard 
                key={service.id}
                id={service.id}
                icon={getIconName(service.icon)}
                title={service.title}
                description={service.description}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
