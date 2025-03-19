import { useQuery, useMutation } from '@tanstack/react-query';
import { Service, InsertService, ServiceGallery, InsertServiceGallery } from '@shared/schema';
import { apiRequest, queryClient } from '../lib/queryClient';
import { useToast } from './use-toast';
import { useState } from 'react';

export const useService = (serviceId?: number) => {
  const { toast } = useToast();
  const [uploadSessions, setUploadSessions] = useState<Set<string>>(new Set());

  // Query to fetch all services
  const {
    data: services,
    isLoading: isLoadingServices,
    error: servicesError,
  } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  // Query to fetch single service if serviceId is provided
  const {
    data: service,
    isLoading: isLoadingService,
    error: serviceError,
  } = useQuery<Service>({
    queryKey: ['/api/services', serviceId],
    enabled: !!serviceId,
  });

  // Query to fetch service gallery
  const {
    data: serviceGallery,
    isLoading: isLoadingGallery,
    error: galleryError,
  } = useQuery<ServiceGallery[]>({
    queryKey: ['/api/services', serviceId, 'gallery'],
    queryFn: async () => {
      return apiRequest({ url: `/api/services/${serviceId}/gallery` });
    },
    enabled: !!serviceId,
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (data: InsertService) => {
      return apiRequest({
        url: '/api/services',
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: 'Service created',
        description: 'The service has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create service',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertService> }) => {
      return apiRequest({
        url: `/api/services/${id}`,
        method: 'PUT',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: 'Service updated',
        description: 'The service has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      if (serviceId) {
        queryClient.invalidateQueries({ queryKey: ['/api/services', serviceId] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update service',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest({
        url: `/api/services/${id}`,
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Service deleted',
        description: 'The service has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete service',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add gallery image mutation
  const addGalleryImageMutation = useMutation({
    mutationFn: async ({ serviceId, data }: { serviceId: number; data: InsertServiceGallery }) => {
      return apiRequest({
        url: `/api/services/${serviceId}/gallery`,
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: 'Gallery image added',
        description: 'The gallery image has been added successfully.',
      });
      if (serviceId) {
        queryClient.invalidateQueries({ queryKey: ['/api/services', serviceId, 'gallery'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add gallery image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update gallery image mutation
  const updateGalleryImageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertServiceGallery> }) => {
      return apiRequest({
        url: `/api/services/gallery/${id}`,
        method: 'PUT',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: 'Gallery image updated',
        description: 'The gallery image has been updated successfully.',
      });
      if (serviceId) {
        queryClient.invalidateQueries({ queryKey: ['/api/services', serviceId, 'gallery'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update gallery image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete gallery image mutation
  const deleteGalleryImageMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest({
        url: `/api/services/gallery/${id}`,
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: 'Gallery image deleted',
        description: 'The gallery image has been deleted successfully.',
      });
      if (serviceId) {
        queryClient.invalidateQueries({ queryKey: ['/api/services', serviceId, 'gallery'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete gallery image',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Helper function to upload a file
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };
  
  // Function to track a new upload session ID
  const trackUploadSession = (sessionId: string) => {
    if (!sessionId) return;
    
    setUploadSessions(prev => {
      const updated = new Set(prev);
      updated.add(sessionId);
      return updated;
    });
    console.log("Tracking service gallery upload session:", sessionId);
  };
  
  // Commit uploads - mark files as permanent (used in database)
  const commitUploads = async (sessionId: string, fileUrls?: string[]): Promise<string[]> => {
    try {
      const response = await fetch('/api/files/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId,
          fileUrls
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to commit uploaded files');
      }
      
      const data = await response.json();
      console.log("Committed files for session:", sessionId, data.committedFiles);
      
      // Remove this session from our tracking
      setUploadSessions(prev => {
        const updated = new Set(prev);
        updated.delete(sessionId);
        return updated;
      });
      
      return data.committedFiles;
    } catch (error) {
      console.error('Error committing uploads:', error);
      throw error;
    }
  };
  
  // Cleanup uploads - delete temporary files that weren't committed
  const cleanupUploads = async (sessionId: string, preserveUrls: string[] = []): Promise<boolean> => {
    try {
      // Log the cleanup operation with preserve list
      if (preserveUrls.length > 0) {
        console.log(`Cleaning up service session ${sessionId} while preserving ${preserveUrls.length} files`);
      }

      const response = await fetch('/api/files/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId,
          preserveUrls: preserveUrls.length > 0 ? preserveUrls : undefined
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to cleanup uploaded files');
      }
      
      const data = await response.json();
      console.log("Cleaned up files for session:", sessionId, data.deletedFiles);
      
      // Log the result
      if (data.success) {
        console.log(`Cleanup result: ${data.deletedCount} deleted, ${data.preservedCount} preserved, ${data.failedCount} failed`);
      }
      
      // Remove this session from our tracking
      setUploadSessions(prev => {
        const updated = new Set(prev);
        updated.delete(sessionId);
        return updated;
      });
      
      return data.success;
    } catch (error) {
      console.error('Error cleaning uploads:', error);
      return false;
    }
  };

  return {
    // Service data
    services,
    service,
    serviceGallery,
    isLoadingServices,
    isLoadingService,
    isLoadingGallery,
    servicesError,
    serviceError,
    galleryError,
    
    // Mutations
    createService: (data: InsertService) => 
      createServiceMutation.mutateAsync(data),
    updateService: (id: number, data: Partial<InsertService>) => 
      updateServiceMutation.mutateAsync({ id, data }),
    deleteService: (id: number) => 
      deleteServiceMutation.mutateAsync(id),
    
    // Gallery mutations
    addGalleryImage: (serviceId: number, data: InsertServiceGallery) => 
      addGalleryImageMutation.mutateAsync({ serviceId, data }),
    updateGalleryImage: (id: number, data: Partial<InsertServiceGallery>) => 
      updateGalleryImageMutation.mutateAsync({ id, data }),
    deleteGalleryImage: (id: number) => 
      deleteGalleryImageMutation.mutateAsync(id),
    
    // File upload helper
    uploadFile,
    
    // File upload session tracking
    uploadSessions,
    trackUploadSession,
    commitUploads,
    cleanupUploads,
    
    // Mutation states
    isCreatingService: createServiceMutation.isPending,
    isUpdatingService: updateServiceMutation.isPending,
    isDeletingService: deleteServiceMutation.isPending,
    isAddingGalleryImage: addGalleryImageMutation.isPending,
    isUpdatingGalleryImage: updateGalleryImageMutation.isPending,
    isDeletingGalleryImage: deleteGalleryImageMutation.isPending,
  };
};