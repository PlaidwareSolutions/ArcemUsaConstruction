import { useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { initializeRevealEffects } from '@/lib/utils';

const AboutSection = () => {
  useEffect(() => {
    const cleanup = initializeRevealEffects();
    return cleanup;
  }, []);

  return (
    <section id="about" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2 reveal">
            <img 
              src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80" 
              alt="Construction site with workers" 
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="md:w-1/2 reveal">
            <h2 className="text-sm font-montserrat text-[#1E90DB] mb-4">ABOUT ARCEM LLC</h2>
            <h3 className="text-3xl md:text-4xl font-montserrat font-bold mb-6"> American Construction, Engineering & Management Company.
</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              At A+R C.E.M, we transform ideas into reality through our expertise in Pre-Construction, Design-Build, Project Management, Tenant Improvement, and Housing. With years of hands-on experience and a passion for excellence, we bring innovation, efficiency, and superior craftsmanship to every project we undertake.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              From concept to completion, our team is committed to delivering tailored solutions that meet the unique needs of our clients. We have had the privilege of working with renowned brands, solidifying our reputation as a trusted partner in the construction and engineering industry.
                
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              
                We don’t just build structures—we build relationships, trust, and a legacy of quality. Whether you’re planning a new development, a renovation, or a large-scale commercial project, we’re here to bring your vision to life with precision and excellence.
            </p>
<div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="font-montserrat font-bold text-2xl text-[#1E90DB] mb-2">100+</h4>
                <p className="text-gray-600">Satisfied Clients</p>
              </div>
              <div>
                <h4 className="font-montserrat font-bold text-2xl text-[#1E90DB] mb-2">12+</h4>
                <p className="text-gray-600">Years of Experience</p>
              </div>
              <div>
                <h4 className="font-montserrat font-bold text-2xl text-[#1E90DB] mb-2">02</h4>
                <p className="text-gray-600">USA Offices</p>
              </div>
              <div>
                <h4 className="font-montserrat font-bold text-2xl text-[#1E90DB] mb-2">100+</h4>
                <p className="text-gray-600">Projects Completed</p>
              </div>
            </div>
            <Link href="/services">
              <Button variant="black">
                OUR SERVICES
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
