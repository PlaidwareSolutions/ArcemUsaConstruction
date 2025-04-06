import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { scrollToTop } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, Star, StarOff, AlertTriangle, Image, FileEdit } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import ExportButton from '@/components/admin/ExportButton';
import SimpleProjectForm from '@/components/admin/SimpleProjectForm';
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Project, ProjectGallery } from '@shared/schema';
import { useProjects } from '@/hooks/useProjects';

const ProjectManagement = () => {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<number | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);
  
  // Get URL params from location for initial state
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const action = searchParams.get('action');
    const editId = searchParams.get('edit');
    
    console.log("Current location:", location);
    console.log("URL params:", { action, editId });
    
    if (action === 'new') {
      setIsAdding(true);
      setIsEditing(false);
      setCurrentEditId(undefined);
    } else if (editId) {
      // Convert editId to a number and prefetch the project data
      const projectId = Number(editId);
      
      // Pre-fetch the project data so it's available when NewProjectForm renders
      console.log("Prefetching project data for ID:", projectId);
      
      // The API endpoint is /api/projects/:id 
      queryClient.prefetchQuery({
        queryKey: [`/api/projects/${projectId}`],
        queryFn: async () => {
          console.log(`Fetching project data for ID ${projectId}`);
          const response = await fetch(`/api/projects/${projectId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch project');
          }
          return response.json();
        }
      });
      
      // Pre-fetch gallery data too
      queryClient.prefetchQuery({
        queryKey: [`/api/projects/${projectId}/gallery`],
        queryFn: async () => {
          console.log(`Fetching project gallery for ID ${projectId}`);
          const response = await fetch(`/api/projects/${projectId}/gallery`);
          if (!response.ok) {
            throw new Error('Failed to fetch gallery');
          }
          return response.json();
        }
      });
      
      console.log("Setting edit mode for project ID:", projectId);
      setIsEditing(true);
      setIsAdding(false);
      setCurrentEditId(projectId);
    } else {
      setIsEditing(false);
      setIsAdding(false);
      setCurrentEditId(undefined);
    }
  }, [location, queryClient]);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectGallery, setProjectGallery] = useState<ProjectGallery[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  useEffect(() => {
    scrollToTop();
    document.title = 'Project Management - ARCEM';
  }, []);

  // Use the standardized hook
  const { 
    projects, 
    isLoadingProjects: isLoading,
    deleteProject,
    toggleFeatured,
    isDeleting,
    isTogglingFeatured
  } = useProjects();

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter((project: Project) => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigate to add new project form
  const handleAddNew = () => {
    setIsAdding(true);
    setIsEditing(false);
    setCurrentEditId(undefined);
    setLocation('/admin/projects?action=new');
  };

  // Open edit project form
  const handleEdit = (id: number) => {
    console.log("Edit clicked for project ID:", id);
    setIsEditing(true);
    setIsAdding(false);
    setCurrentEditId(id);
    setLocation(`/admin/projects?edit=${id}`);
  };

  // Show delete confirmation
  const handleDeleteClick = async (project: Project) => {
    setProjectToDelete(project);
    setIsLoadingGallery(true);
    
    // Fetch gallery images for the project
    try {
      const response = await fetch(`/api/projects/${project.id}/gallery`);
      if (!response.ok) {
        throw new Error('Failed to fetch gallery images');
      }
      const galleryImages: ProjectGallery[] = await response.json();
      setProjectGallery(galleryImages);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      // If we fail to fetch gallery, we'll just proceed with an empty array
      setProjectGallery([]);
    } finally {
      setIsLoadingGallery(false);
      setShowDeleteDialog(true);
    }
  };

  // Confirm delete project
  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      // Reset gallery state after deletion
      setProjectGallery([]);
      setShowDeleteDialog(false);
      setProjectToDelete(null);
    }
  };

  // Handle toggle featured status
  const handleToggleFeatured = (project: Project) => {
    toggleFeatured(project.id, !project.featured);
  };

  // Close form and return to list
  const handleCloseForm = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentEditId(undefined);
    setLocation('/admin/projects');
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Admin Navigation */}
          <AdminNav activePage="projects" />
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Add/Edit Project Form */}
            {isAdding || isEditing ? (
              <SimpleProjectForm 
                projectId={currentEditId} 
                onClose={handleCloseForm} 
              />
            ) : (
              <>
                {/* Project List */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h1 className="text-2xl font-montserrat font-bold">Project Management</h1>
                    <div className="flex items-center gap-2">
                      <ExportButton
                        data={filteredProjects || []}
                        fileName="Projects_Export"
                        excludeFields={['id', 'slug']}
                        dateFields={['createdAt', 'updatedAt']}
                        disabled={isLoading || !filteredProjects || filteredProjects.length === 0}
                      />
                      <Button variant="gold" onClick={handleAddNew}>
                        <Plus className="mr-2 h-4 w-4" /> Add New Project
                      </Button>
                    </div>
                  </div>
                  
                  {/* Search bar */}
                  <div className="mb-6 relative">
                    <Input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-10 pr-4 py-2 border border-gray-300"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  
                  {/* Projects table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                            Image
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                            Featured
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center">
                              <div className="animate-pulse flex items-center justify-center">
                                <div className="h-4 w-36 bg-gray-200 rounded"></div>
                              </div>
                            </td>
                          </tr>
                        ) : filteredProjects?.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                              No projects found
                            </td>
                          </tr>
                        ) : (
                          filteredProjects?.map(project => (
                            <tr key={project.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-16 h-12 bg-gray-100 overflow-hidden">
                                  <img 
                                    src={project.image} 
                                    alt={project.title} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {project.title}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{project.category}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleFeatured(project)}
                                  disabled={isTogglingFeatured}
                                  title={project.featured ? "Remove from featured" : "Add to featured"}
                                >
                                  {project.featured ? (
                                    <Star className="h-5 w-5 text-amber-500" fill="currentColor" />
                                  ) : (
                                    <StarOff className="h-5 w-5 text-gray-400" />
                                  )}
                                </Button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(project.id)}
                                  className="text-blue-600 hover:text-blue-900 mr-2"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(project)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the project "{projectToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingGallery ? (
            <div className="py-4 flex items-center justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-gray-500 rounded-full border-t-transparent"></div>
              <span className="ml-2">Checking for gallery images...</span>
            </div>
          ) : projectGallery.length > 0 ? (
            <Alert className="my-3 border-amber-500 bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div className="ml-3">
                <AlertDescription className="text-amber-800">
                  <p className="font-medium">Warning: This project has {projectGallery.length} gallery {projectGallery.length === 1 ? 'image' : 'images'} that will be permanently deleted.</p>
                  <div className="flex items-center mt-2 gap-2">
                    <Image className="h-4 w-4 text-amber-600" />
                    <span>{projectGallery.filter(img => img.isFeature).length > 0 ? 'Includes feature image' : 'No feature image'}</span>
                  </div>
                </AlertDescription>
              </div>
            </Alert>
          ) : null}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting || isLoadingGallery}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManagement;
