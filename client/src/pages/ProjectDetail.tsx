import { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Project, ProjectGallery } from '@shared/schema';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, ImageIcon, Loader2, Tag, X } from 'lucide-react';
import ProjectSeo from '@/components/seo/ProjectSeo';
import { Button } from '@/components/ui/button';
import { initializeRevealEffects, scrollToTop, formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Component for fetching and displaying related projects
const RelatedProjects = ({ currentProjectId, category }: { currentProjectId: number, category: string }) => {
  // Fetch all projects to filter for related ones
  const { data: allProjects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[200px] place-items-center">
        <div className="col-span-3 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error || !allProjects || allProjects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No related projects found.
      </div>
    );
  }

  // Filter projects that:
  // 1. Are in the same category
  // 2. Are not the current project
  // 3. Limit to 3 projects
  const relatedProjects = allProjects
    .filter(project => 
      project.id !== currentProjectId && 
      project.category.toLowerCase() === category.toLowerCase()
    )
    .slice(0, 3);

  // If no projects in the same category, just show other projects
  const projectsToShow = relatedProjects.length > 0 
    ? relatedProjects 
    : allProjects
        .filter(project => project.id !== currentProjectId)
        .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {projectsToShow.map((project) => (
        <Link key={project.id} href={`/projects/${project.id}`} className="group block overflow-hidden shadow-lg">
          <div className="relative h-64 overflow-hidden">
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // If the original URL failed to load, try an alternative format
                if (e.currentTarget.src === project.image && project.image.includes('utfs.io')) {
                  // Convert from utfs.io/f/ to ufs.sh/f/ format
                  const newUrl = project.image.replace('utfs.io/f/', 'ufs.sh/f/');
                  console.log(`Retrying with alternative URL format for related project: ${newUrl}`);
                  e.currentTarget.src = newUrl;
                } else if (e.currentTarget.src === project.image && project.image.includes('ufs.sh')) {
                  // Convert from ufs.sh/f/ to utfs.io/f/ format
                  const newUrl = project.image.replace('ufs.sh/f/', 'utfs.io/f/');
                  console.log(`Retrying with alternative URL format for related project: ${newUrl}`);
                  e.currentTarget.src = newUrl;
                } else {
                  console.error(`Failed to load related project image: ${project.image}`);
                  e.currentTarget.src = '';
                  e.currentTarget.parentElement?.classList.add('related-image-error');
                  e.currentTarget.parentElement?.insertAdjacentHTML(
                    'afterbegin',
                    `<div class="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <p class="text-gray-500 text-xs">Image unavailable</p>
                    </div>`
                  );
                }
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white font-montserrat font-medium">View Project</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-montserrat font-bold">{project.title}</h3>
            <p className="text-gray-600 text-sm">{project.category}</p>
          </div>
        </Link>
      ))}

      {projectsToShow.length === 0 && (
        <div className="col-span-3 text-center py-8 text-gray-500">
          No other projects available.
        </div>
      )}
    </div>
  );
};

const ProjectDetail = () => {
  const [, params] = useRoute('/projects/:id');
  const projectId = params?.id ? parseInt(params.id) : 0;
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    scrollToTop();
    const cleanup = initializeRevealEffects();
    return cleanup;
  }, [projectId]);

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });
  
  // Fetch project gallery images
  const { data: galleryImages = [] } = useQuery<ProjectGallery[]>({
    queryKey: [`/api/projects/${projectId}/gallery`],
    enabled: !!projectId,
  });
  
  // Sort gallery images by display order
  const sortedGalleryImages = [...galleryImages].sort((a, b) => {
    const orderA = a.displayOrder !== null ? a.displayOrder : 0;
    const orderB = b.displayOrder !== null ? b.displayOrder : 0;
    return orderA - orderB;
  });

  const openGallery = (index: number) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === sortedGalleryImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? sortedGalleryImages.length - 1 : prevIndex - 1
    );
  };

  // SEO metadata is now handled by ProjectSeo component

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 w-1/2 mb-8"></div>
            <div className="h-96 bg-gray-200 w-full mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 w-full"></div>
              <div className="h-4 bg-gray-200 w-full"></div>
              <div className="h-4 bg-gray-200 w-5/6"></div>
              <div className="h-4 bg-gray-200 w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h1 className="text-3xl font-montserrat font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-8">
            The project you're looking for doesn't exist or there was an error loading it.
          </p>
          <Link href="/projects">
            <Button variant="black">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-white">
      {project && (
        <ProjectSeo 
          title={project.title}
          description={project.description}
          imageUrl={project.image}
          projectId={projectId}
          category={project.category}
        />
      )}
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8">
          <Link href="/projects">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold mb-4 reveal">{project.title}</h1>
          
          <div className="flex flex-wrap gap-4 mb-8 reveal">
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{project.createdAt ? formatDate(project.createdAt) : "N/A"}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Tag className="w-4 h-4 mr-2" />
              <span>{project.category}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2 reveal">
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-auto object-cover mb-8 shadow-lg"
              onError={(e) => {
                // If the original URL failed to load, try an alternative format
                if (e.currentTarget.src === project.image && project.image.includes('utfs.io')) {
                  // Convert from utfs.io/f/ to ufs.sh/f/ format
                  const newUrl = project.image.replace('utfs.io/f/', 'ufs.sh/f/');
                  console.log(`Retrying with alternative URL format for main image: ${newUrl}`);
                  e.currentTarget.src = newUrl;
                } else if (e.currentTarget.src === project.image && project.image.includes('ufs.sh')) {
                  // Convert from ufs.sh/f/ to utfs.io/f/ format
                  const newUrl = project.image.replace('ufs.sh/f/', 'utfs.io/f/');
                  console.log(`Retrying with alternative URL format for main image: ${newUrl}`);
                  e.currentTarget.src = newUrl;
                } else {
                  console.error(`Failed to load project main image: ${project.image}`);
                  e.currentTarget.src = '';
                  e.currentTarget.parentElement?.classList.add('image-error');
                  e.currentTarget.parentElement?.insertAdjacentHTML(
                    'afterbegin',
                    `<div class="w-full aspect-video bg-gray-200 flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <p class="text-gray-500 text-sm">Project image unavailable</p>
                    </div>`
                  );
                }
              }}
            />
            
            {/* Project Gallery */}
            {sortedGalleryImages.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-montserrat font-bold mb-6">Project Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sortedGalleryImages.map((image, index) => (
                    <div 
                      key={image.id} 
                      className="aspect-square relative overflow-hidden cursor-pointer group"
                      onClick={() => openGallery(index)}
                    >
                      <img 
                        src={image.imageUrl} 
                        alt={image.caption || `Gallery image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // If the original URL failed to load, try an alternative format
                          if (e.currentTarget.src === image.imageUrl && image.imageUrl.includes('utfs.io')) {
                            // Convert from utfs.io/f/ to ufs.sh/f/ format
                            const newUrl = image.imageUrl.replace('utfs.io/f/', 'ufs.sh/f/');
                            console.log(`Retrying with alternative URL format: ${newUrl}`);
                            e.currentTarget.src = newUrl;
                          } else if (e.currentTarget.src === image.imageUrl && image.imageUrl.includes('ufs.sh')) {
                            // Convert from ufs.sh/f/ to utfs.io/f/ format
                            const newUrl = image.imageUrl.replace('ufs.sh/f/', 'utfs.io/f/');
                            console.log(`Retrying with alternative URL format: ${newUrl}`);
                            e.currentTarget.src = newUrl;
                          } else {
                            console.error(`Failed to load gallery image: ${image.imageUrl}`);
                            e.currentTarget.src = '';
                            e.currentTarget.parentElement?.classList.add('gallery-image-error');
                            e.currentTarget.parentElement?.insertAdjacentHTML(
                              'afterbegin',
                              `<div class="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                <p class="text-gray-500 text-xs">Image unavailable</p>
                              </div>`
                            );
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      {image.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-60 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {image.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                {project.description}
              </p>
              
              {/* Dynamic project details from the database */}
              {project.overview && (
                <>
                  <h2 className="text-2xl font-montserrat font-bold mt-8 mb-4">Project Overview</h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {project.overview}
                  </p>
                </>
              )}

              {project.challenges && (
                <>
                  <h2 className="text-2xl font-montserrat font-bold mt-8 mb-4">Challenges & Solutions</h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {project.challenges}
                  </p>
                </>
              )}

              {project.results && (
                <>
                  <h2 className="text-2xl font-montserrat font-bold mt-8 mb-4">Results</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {project.results}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 reveal">
            <div className="bg-gray-100 p-8 mb-8">
              <h3 className="text-xl font-montserrat font-bold mb-6">Project Details</h3>
              <div className="space-y-4">
                {project.client && (
                  <div>
                    <h4 className="font-montserrat font-semibold text-gray-700">Client</h4>
                    <p className="text-gray-600">{project.client}</p>
                  </div>
                )}
                
                {project.location && (
                  <div>
                    <h4 className="font-montserrat font-semibold text-gray-700">Location</h4>
                    <p className="text-gray-600">{project.location}</p>
                  </div>
                )}
                
                {project.size && (
                  <div>
                    <h4 className="font-montserrat font-semibold text-gray-700">Project Size</h4>
                    <p className="text-gray-600">{project.size}</p>
                  </div>
                )}
                
                {project.completionDate ? (
                  <div>
                    <h4 className="font-montserrat font-semibold text-gray-700">Completion</h4>
                    <p className="text-gray-600">{project.completionDate}</p>
                  </div>
                ) : project.createdAt && (
                  <div>
                    <h4 className="font-montserrat font-semibold text-gray-700">Completion</h4>
                    <p className="text-gray-600">{formatDate(project.createdAt)}</p>
                  </div>
                )}
                
                {project.servicesProvided && (
                  <div>
                    <h4 className="font-montserrat font-semibold text-gray-700">Services Provided</h4>
                    <p className="text-gray-600">{project.servicesProvided}</p>
                  </div>
                )}
                
                {/* Show default message if no project details are available */}
                {!project.client && !project.location && !project.size && 
                 !project.completionDate && !project.servicesProvided && (
                  <div>
                    <p className="text-gray-600">Contact us for more information about this project.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-black text-white p-8">
              <h3 className="text-xl font-montserrat font-bold mb-6">Ready to Start Your Project?</h3>
              <p className="mb-6">Contact us today to discuss how we can bring your vision to life.</p>
              <Link href="/contact">
                <Button variant="gold" className="w-full">
                  REACH US
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Gallery Image Modal */}
        <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
          <DialogContent className="sm:max-w-4xl p-0 bg-black overflow-hidden">
            <div className="relative h-[80vh] flex items-center justify-center">
              {sortedGalleryImages.length > 0 && (
                <>
                  <img 
                    src={sortedGalleryImages[currentImageIndex]?.imageUrl} 
                    alt={sortedGalleryImages[currentImageIndex]?.caption || "Gallery image"}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      const currentImage = sortedGalleryImages[currentImageIndex];
                      
                      // If the original URL failed to load, try an alternative format
                      if (e.currentTarget.src === currentImage?.imageUrl && currentImage?.imageUrl.includes('utfs.io')) {
                        // Convert from utfs.io/f/ to ufs.sh/f/ format
                        const newUrl = currentImage.imageUrl.replace('utfs.io/f/', 'ufs.sh/f/');
                        console.log(`Retrying lightbox with alternative URL format: ${newUrl}`);
                        e.currentTarget.src = newUrl;
                      } else if (e.currentTarget.src === currentImage?.imageUrl && currentImage?.imageUrl.includes('ufs.sh')) {
                        // Convert from ufs.sh/f/ to utfs.io/f/ format
                        const newUrl = currentImage.imageUrl.replace('ufs.sh/f/', 'utfs.io/f/');
                        console.log(`Retrying lightbox with alternative URL format: ${newUrl}`);
                        e.currentTarget.src = newUrl;
                      } else {
                        console.error(`Failed to load lightbox image: ${currentImage?.imageUrl}`);
                        e.currentTarget.src = '';
                        e.currentTarget.parentElement?.classList.add('lightbox-image-error');
                        e.currentTarget.parentElement?.insertAdjacentHTML(
                          'afterbegin',
                          `<div class="bg-gray-200 flex flex-col items-center justify-center p-10 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 mb-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                            <p class="text-gray-500 text-base">Image is not available</p>
                          </div>`
                        );
                      }
                    }}
                  />
                  
                  {/* Caption */}
                  {sortedGalleryImages[currentImageIndex]?.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-75 text-white p-4">
                      {sortedGalleryImages[currentImageIndex]?.caption}
                    </div>
                  )}
                  
                  {/* Navigation */}
                  <Button 
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full bg-black/30 text-white border-white/20 hover:bg-black/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  
                  <Button 
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full bg-black/30 text-white border-white/20 hover:bg-black/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                  
                  {/* Close button */}
                  <Button 
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-4 rounded-full bg-black/30 text-white border-white/20 hover:bg-black/50"
                    onClick={() => setGalleryOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  
                  {/* Counter */}
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {sortedGalleryImages.length}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Related Projects Section */}
        <div className="mt-16 reveal">
          <h2 className="text-2xl font-montserrat font-bold mb-8">Related Projects</h2>
          
          {/* Use a query to fetch related projects */}
          <RelatedProjects currentProjectId={projectId} category={project.category} />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
