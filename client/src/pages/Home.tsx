import { useEffect } from 'react';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import ServicesSection from '@/components/home/ServicesSection';
import ProjectsSection from '@/components/home/ProjectsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BlogSection from '@/components/home/BlogSection';
import ContactSection from '@/components/home/ContactSection';
import HomeSeo from '@/components/seo/HomeSeo';
import { scrollToTop } from '@/lib/utils';

const Home = () => {
  useEffect(() => {
    scrollToTop();
  }, []);

  return (
    <>
      <HomeSeo 
        title="ARCEM Construction Company | Excellence in Construction" 
        description="ARCEM Construction offers premium building services with expertise in commercial, residential construction, and renovations. Build your dream with excellence."
      />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <TestimonialsSection />
      <BlogSection />
      <ContactSection />
    </>
  );
};

export default Home;
