import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Project, InsertProject, ProjectGallery, InsertProjectGallery, ExtendedInsertProject } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export const useProject = (projectId?: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch single project if ID is provided
  const getProject = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0 // Always refetch when mounting with a new project ID
  });
  
  // Fetch project gallery images if ID is provided
  const getProjectGallery = useQuery<ProjectGallery[]>({
    queryKey: [`/api/projects/${projectId}/gallery`],
    enabled: !!projectId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0 // Always refetch when mounting with a new project ID
  });
  
  // Extract data for backward compatibility
  const project = getProject.data;
  const projectGallery = getProjectGallery.data || [];
  const isLoading = getProject.isLoading;
  const isLoadingGallery = getProjectGallery.isLoading;
  const error = getProject.error;
  const galleryLoading = getProjectGallery.isLoading;
  
  // Log project data when it changes
  useEffect(() => {
    if (project) {
      console.log("Project data loaded:", project);
    }
  }, [project]);

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertProject | ExtendedInsertProject) => {
      return apiRequest({
        url: '/api/projects',
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project created",
        description: "The project has been successfully created.",
        variant: "default"
      });
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
      console.error("Error creating project:", error);
    }
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProject> }) => {
      return apiRequest({
        url: `/api/projects/${id}`,
        method: 'PUT',
        body: data
      });
    },
    onSuccess: () => {
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      }
      toast({
        title: "Project updated",
        description: "The project has been successfully updated.",
        variant: "default"
      });
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      });
      console.error("Error updating project:", error);
    }
  });

  // Add gallery image mutation
  const addGalleryImageMutation = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: number; data: Omit<InsertProjectGallery, 'projectId'> }) => {
      return apiRequest({
        url: `/api/projects/${projectId}/gallery`,
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/gallery`] });
      }
      toast({
        title: "Image added",
        description: "The gallery image has been successfully added.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add gallery image. Please try again.",
        variant: "destructive"
      });
      console.error("Error adding gallery image:", error);
    }
  });

  // Update gallery image mutation
  const updateGalleryImageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProjectGallery> }) => {
      return apiRequest({
        url: `/api/projects/gallery/${id}`,
        method: 'PUT',
        body: data
      });
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/gallery`] });
      }
      toast({
        title: "Image updated",
        description: "The gallery image has been successfully updated.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update gallery image. Please try again.",
        variant: "destructive"
      });
      console.error("Error updating gallery image:", error);
    }
  });

  // Delete gallery image mutation
  const deleteGalleryImageMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest({
        url: `/api/projects/gallery/${id}`,
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/gallery`] });
      }
      toast({
        title: "Image deleted",
        description: "The gallery image has been successfully deleted.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete gallery image. Please try again.",
        variant: "destructive"
      });
      console.error("Error deleting gallery image:", error);
    }
  });

  const saveProject = async (data: InsertProject) => {
    setIsSubmitting(true);
    try {
      if (projectId) {
        const result = await updateMutation.mutateAsync({ id: projectId, data });
        return result;
      } else {
        const result = await createMutation.mutateAsync(data);
        return result;
      }
    } catch (error) {
      console.error("Error in saveProject:", error);
      throw error;
    }
  };

  const addGalleryImage = async (data: InsertProjectGallery) => {
    if (!projectId && !data.projectId) {
      toast({
        title: "Error",
        description: "Cannot add gallery image: No project ID provided.",
        variant: "destructive"
      });
      return;
    }
    
    await addGalleryImageMutation.mutateAsync({ 
      projectId: data.projectId || projectId as number, 
      data: {
        imageUrl: data.imageUrl,
        caption: data.caption,
        displayOrder: data.displayOrder
      } 
    });
  };

  const updateGalleryImage = async (id: number, data: Partial<InsertProjectGallery>) => {
    // Make sure we're only updating properties that exist in the schema
    const updateData: Partial<InsertProjectGallery> = {};
    
    if (data.caption !== undefined) updateData.caption = data.caption;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    
    await updateGalleryImageMutation.mutateAsync({ id, data: updateData });
  };

  const deleteGalleryImage = async (id: number) => {
    await deleteGalleryImageMutation.mutateAsync(id);
  };

  // Track upload sessions for cleanup
  const [uploadSessions, setUploadSessions] = useState<Set<string>>(new Set());
  
  // Upload file and return URL
  const uploadFile = async (file: File, sessionId?: string): Promise<{ url: string; sessionId: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Generate a session ID if not provided
    const fileSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      // Add sessionId to the request
      const url = new URL('/api/upload', window.location.origin);
      url.searchParams.append('sessionId', fileSessionId);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      
      // Log the response to debug URL format
      console.log('Upload response data:', data);
      
      // Add to tracked sessions
      setUploadSessions(prev => {
        const updated = new Set(prev);
        updated.add(fileSessionId);
        return updated;
      });
      
      // Check for and prefer ufsUrl if available
      return { 
        url: data.ufsUrl || data.url, // Use the new URL format if available
        sessionId: data.sessionId || fileSessionId
      };
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  // Commit the uploads associated with a session
  const commitUploads = async (sessionId: string, fileUrls?: string[]): Promise<boolean> => {
    try {
      const data = await apiRequest({
        url: '/api/files/commit',
        method: 'POST',
        body: { sessionId, fileUrls }
      });
      
      // Remove this session from tracked sessions on success
      if (data.success) {
        setUploadSessions(prev => {
          const updated = new Set(prev);
          updated.delete(sessionId);
          return updated;
        });
      }
      
      return data.success;
    } catch (error) {
      console.error('Error committing uploads:', error);
      return false;
    }
  };
  
  // Clean up unused files from a session
  const cleanupUploads = async (sessionId: string, preserveUrls: string[] = []): Promise<boolean> => {
    try {
      // Get all existing gallery image URLs to always preserve
      const existingGalleryImages = Array.isArray(projectGallery) 
        ? projectGallery.map(img => img.imageUrl).filter(Boolean)
        : [];
      
      // Combine with provided preserveUrls to ensure we NEVER delete existing gallery images
      // Combine arrays and remove duplicates using a regular array approach to avoid Set iteration issues
      const combinedUrls = [...existingGalleryImages, ...preserveUrls];
      const uniqueUrls: string[] = [];
      
      // Manually deduplicate
      combinedUrls.forEach(url => {
        if (url && !uniqueUrls.includes(url)) {
          uniqueUrls.push(url);
        }
      });
      
      const allUrlsToPreserve = uniqueUrls;
      
      console.log(`[useProject] Cleaning up session ${sessionId}`);
      console.log(`[useProject] Preserving ${allUrlsToPreserve.length} files (${existingGalleryImages.length} from gallery, ${preserveUrls.length} from params)`);
      
      if (allUrlsToPreserve.length > 0) {
        console.log(`[useProject] URLs being preserved during cleanup:`, allUrlsToPreserve);
      }

      const data = await apiRequest({
        url: '/api/files/cleanup',
        method: 'POST',
        body: { 
          sessionId,
          preserveUrls: allUrlsToPreserve.length > 0 ? allUrlsToPreserve : undefined
        }
      });
      
      // Log the result with detailed information
      if (data.success) {
        console.log(`[useProject] Cleanup result for session ${sessionId}: ${data.deletedCount} deleted, ${data.preservedCount} preserved, ${data.failedCount} failed`);
        
        if (data.deletedCount > 0 && data.deletedFiles) {
          console.log(`[useProject] Deleted files:`, data.deletedFiles);
        }
        
        if (data.preservedCount > 0 && data.preservedFiles) {
          console.log(`[useProject] Preserved files:`, data.preservedFiles);
        }
      } else {
        console.log(`[useProject] Cleanup failed for session ${sessionId}`);
      }
      
      // Remove this session from tracked sessions on success
      if (data.success) {
        setUploadSessions(prev => {
          const updated = new Set(prev);
          updated.delete(sessionId);
          return updated;
        });
      }
      
      return data.success;
    } catch (error) {
      console.error('[useProject] Error cleaning up uploads:', error);
      return false;
    }
  };

  // Add properties for Gallery state
  const isAddingGalleryImage = addGalleryImageMutation.isPending;
  const isDeletingGalleryImage = deleteGalleryImageMutation.isPending;
  const isUpdatingGalleryImage = updateGalleryImageMutation.isPending;

  // Add functions that are specifically named for project gallery management
  const addProjectGalleryImage = addGalleryImage;
  const deleteProjectGalleryImage = deleteGalleryImage;
  const updateProjectGalleryImage = updateGalleryImage;
  
  // Function to track a new upload session ID
  const trackUploadSession = (sessionId: string) => {
    if (!sessionId) return;
    
    setUploadSessions(prev => {
      const updated = new Set(prev);
      updated.add(sessionId);
      return updated;
    });
    console.log("Tracking gallery upload session:", sessionId);
  };

  // Create a separate function for createProject
  const createProject = async (data: InsertProject | ExtendedInsertProject): Promise<any> => {
    return createMutation.mutateAsync(data);
  };

  // Create a separate function for updateProject
  const updateProject = async (id: number, data: Partial<InsertProject>): Promise<any> => {
    // First, extract the existing image URLs that need to be preserved
    // Use the getProject query we already have
    if (id === projectId) {
      // If the current project ID matches the requested one, use the existing project data
      const projectData = project;
      
      // Make sure we have the current project data before proceeding
      if (!projectData) {
        console.error("[useProject] Error: Cannot find current project data for preservation");
      } else {
        // If we have an existing image, make sure it gets preserved during cleanup
        if (projectData.image) {
          console.log(`[useProject] Will preserve current feature image during update: ${projectData.image}`);
          // Ensure the current image is preserved across sessions
          for (const sessionId of Array.from(uploadSessions)) {
            await commitUploads(sessionId, [projectData.image]);
          }
        }
      }
    } else {
      // For a different project ID, we need to fetch its data
      console.log(`[useProject] Fetching project ${id} data for image preservation`);
      try {
        // Direct API call to get the project data
        const fetchedProject = await apiRequest({
          url: `/api/projects/${id}`,
          method: 'GET'
        });
        
        if (fetchedProject && fetchedProject.image) {
          console.log(`[useProject] Will preserve fetched project image: ${fetchedProject.image}`);
          for (const sessionId of Array.from(uploadSessions)) {
            await commitUploads(sessionId, [fetchedProject.image]);
          }
        }
      } catch (error) {
        console.error(`[useProject] Error fetching project ${id} data:`, error);
      }
    }
    
    console.log(`[useProject] Updating project ${id} with data:`, data);
    return updateMutation.mutateAsync({ id, data });
  };

  // Set a gallery image as the feature image
  const setFeatureImageMutation = useMutation({
    mutationFn: async ({ projectId, imageId }: { projectId: number; imageId: number }) => {
      return apiRequest({
        url: `/api/projects/${projectId}/gallery/${imageId}/set-feature`,
        method: 'PUT',
        body: {}
      });
    },
    onSuccess: () => {
      if (projectId) {
        // Invalidate both the project and its gallery to refresh the data
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/gallery`] });
      }
      toast({
        title: "Feature image set",
        description: "The feature image has been successfully updated.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to set feature image. Please try again.",
        variant: "destructive"
      });
      console.error("Error setting feature image:", error);
    }
  });

  // Function to set a gallery image as the feature image
  const setProjectFeatureImage = async (imageId: number): Promise<any> => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Cannot set feature image: No project ID provided.",
        variant: "destructive"
      });
      return;
    }
    
    return setFeatureImageMutation.mutateAsync({ projectId, imageId });
  };

  return {
    project,
    projectGallery,
    galleryImages: projectGallery, // Keep for backward compatibility
    isLoading,
    isLoadingGallery,
    error,
    saveProject,
    createProject,
    updateProject,
    isSubmitting,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    uploadFile,
    commitUploads,
    cleanupUploads,
    uploadSessions,
    // Add new exports for ProjectGalleryManager
    addProjectGalleryImage,
    deleteProjectGalleryImage,
    updateProjectGalleryImage,
    isAddingGalleryImage,
    isDeletingGalleryImage,
    isUpdatingGalleryImage,
    trackUploadSession,
    // New feature image functionality
    setProjectFeatureImage,
    isSettingFeatureImage: setFeatureImageMutation.isPending,
    // Add the new getters for queries
    getProject,
    getProjectGallery,
    galleryLoading
  };
};
