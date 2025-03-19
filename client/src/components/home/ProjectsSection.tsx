import { useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { initializeRevealEffects } from '@/lib/utils';
import ProjectCard from '@/components/common/ProjectCard';
import { Button } from '@/components/ui/button';
import { Project } from '@shared/schema';

const ProjectsSection = () => {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects/featured'],
  });

  useEffect(() => {
    const cleanup = initializeRevealEffects();
    return cleanup;
  }, []);

  if (error) {
    console.error('Error loading projects:', error);
  }

  return (
    <section id="projects" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <h2 className="text-sm font-montserrat text-[#1E90DB] mb-4">OUR PROJECTS</h2>
          <h3 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">Featured Construction Projects</h3>
          <p className="text-gray-600 leading-relaxed">
            Browse our portfolio of completed projects showcasing our expertise and commitment to excellence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading state
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="relative overflow-hidden shadow-lg reveal h-80 bg-gray-200 animate-pulse"></div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center text-red-500">
              Failed to load projects. Please try again later.
            </div>
          ) : (
            // Render actual projects
            projects?.map((project) => (
              <ProjectCard 
                key={project.id}
                id={project.id}
                title={project.title}
                category={project.category}
                imageUrl={project.image}
              />
            ))
          )}
        </div>
        
        <div className="text-center mt-12 reveal">
          <Link href="/projects">
            <Button variant="black">
              VIEW ALL PROJECTS
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
