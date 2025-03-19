import React, { useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
}

interface ProjectsListProps {
  setState: Function;
  projects: Project[];
}

const ProjectsList: React.FC<ProjectsListProps> = ({ setState, projects }) => {
  useEffect(() => {
    // Only fetch if projects are not already loaded
    if (projects.length === 0) {
      const fetchProjects = async () => {
        try {
          const response = await apiRequest('GET', '/api/projects/featured');
          const data = await response.json();
          setState((prev: any) => ({ ...prev, projects: data }));
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      };
      
      fetchProjects();
    }
  }, [setState, projects]);

  return (
    <div className="projects-list p-2 rounded-md bg-gray-100 my-2">
      {projects.length === 0 ? (
        <div className="text-center py-2">Loading projects...</div>
      ) : (
        <div className="space-y-3">
          {projects.slice(0, 3).map((project) => (
            <div 
              key={project.id} 
              className="group flex gap-2 p-2 hover:bg-gray-200 rounded-md cursor-pointer transition-colors"
            >
              {project.imageUrl && (
                <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-[#1E90DB] group-hover:underline">
                  {project.title}
                </div>
                <div className="text-xs text-gray-500 mb-1">{project.category}</div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {project.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-2 text-sm text-gray-500">
        View all our projects on the Projects page.
      </div>
    </div>
  );
};

export default ProjectsList;