import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { Project, ProjectGallery, InsertProject } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export const useProjects = (projectId?: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[], Error, Project[]>({
    queryKey: ["/api/projects"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !projectId
  });

  // Get featured projects
  const { data: featuredProjects = [], isLoading: isLoadingFeatured } = useQuery<Project[], Error, Project[]>({
    queryKey: ["/api/projects/featured"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !projectId
  });

  // Get a specific project
  const { data: project, isLoading: isLoadingProject } = useQuery<Project | null, Error, Project | null>({
    queryKey: ["/api/projects", projectId],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!projectId,
    initialData: null
  });

  // Get project gallery
  const { data: projectGallery = [], isLoading: isLoadingGallery } = useQuery<ProjectGallery[], Error, ProjectGallery[]>({
    queryKey: ["/api/projects", projectId, "gallery"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!projectId
  });

  // Create a new project
  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      return await apiRequest({
        url: "/api/projects",
        method: "POST",
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects/featured"] });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create project: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update a project
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProject> }) => {
      return await apiRequest({
        url: `/api/projects/${id}`,
        method: "PUT",
        body: data
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects/featured"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", variables.id] });
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update project: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle featured status
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: number; featured: boolean }) => {
      return await apiRequest({
        url: `/api/projects/${id}`,
        method: "PUT",
        body: { featured }
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects/featured"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", variables.id] });
      toast({
        title: "Success",
        description: `Project ${variables.featured ? "added to" : "removed from"} featured projects`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update featured status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a project
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/projects/${id}`,
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects/featured"] });
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete project: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add a gallery image
  const addGalleryImageMutation = useMutation({
    mutationFn: async ({ projectId, imageData }: { projectId: number; imageData: { url: string; alt: string } }) => {
      return await apiRequest({
        url: `/api/projects/${projectId}/gallery`,
        method: "POST",
        body: imageData
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", variables.projectId, "gallery"] });
      toast({
        title: "Success",
        description: "Gallery image added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add gallery image: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a gallery image
  const deleteGalleryImageMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/projects/gallery/${id}`,
        method: "DELETE"
      });
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "gallery"] });
      }
      toast({
        title: "Success",
        description: "Gallery image deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete gallery image: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Set feature image
  const setFeatureImageMutation = useMutation({
    mutationFn: async ({ projectId, imageId }: { projectId: number; imageId: number }) => {
      return await apiRequest({
        url: `/api/projects/${projectId}/gallery/${imageId}/set-feature`,
        method: "PUT"
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", variables.projectId, "gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Success",
        description: "Feature image set successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to set feature image: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    projects,
    featuredProjects,
    project: projectId ? (project as Project) : null,
    projectGallery,
    
    // Loading states
    isLoadingProjects,
    isLoadingFeatured,
    isLoadingProject,
    isLoadingGallery,
    
    // Mutations
    createProject: (data: InsertProject) => createProjectMutation.mutate(data),
    updateProject: (id: number, data: Partial<InsertProject>) => 
      updateProjectMutation.mutate({ id, data }),
    toggleFeatured: (id: number, featured: boolean) => toggleFeaturedMutation.mutate({ id, featured }),
    deleteProject: (id: number) => deleteProjectMutation.mutate(id),
    addGalleryImage: (projectId: number, imageData: { url: string, alt: string }) => 
      addGalleryImageMutation.mutate({ projectId, imageData }),
    deleteGalleryImage: (id: number) => deleteGalleryImageMutation.mutate(id),
    setFeatureImage: (projectId: number, imageId: number) => 
      setFeatureImageMutation.mutate({ projectId, imageId }),
    
    // Mutation states
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isTogglingFeatured: toggleFeaturedMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    isAddingGalleryImage: addGalleryImageMutation.isPending,
    isDeletingGalleryImage: deleteGalleryImageMutation.isPending,
    isSettingFeatureImage: setFeatureImageMutation.isPending,
  };
};