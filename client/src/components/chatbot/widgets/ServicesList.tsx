import React, { useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface ServicesListProps {
  setState: Function;
  services: Service[];
}

const ServicesList: React.FC<ServicesListProps> = ({ setState, services }) => {
  useEffect(() => {
    // Only fetch if services are not already loaded
    if (services.length === 0) {
      const fetchServices = async () => {
        try {
          const response = await apiRequest('GET', '/api/services');
          const data = await response.json();
          setState((prev: any) => ({ ...prev, services: data }));
        } catch (error) {
          console.error('Error fetching services:', error);
        }
      };
      
      fetchServices();
    }
  }, [setState, services]);

  return (
    <div className="services-list p-2 rounded-md bg-gray-100 my-2">
      {services.length === 0 ? (
        <div className="text-center py-2">Loading services...</div>
      ) : (
        <ul className="space-y-2">
          {services.map((service) => (
            <li 
              key={service.id} 
              className="p-2 hover:bg-gray-200 rounded-md cursor-pointer transition-colors"
            >
              <div className="font-semibold text-[#1E90DB]">{service.title}</div>
              <div className="text-sm text-gray-600">{service.description.substring(0, 100)}...</div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 text-sm text-gray-500">
        For more details, please visit our Services page.
      </div>
    </div>
  );
};

export default ServicesList;