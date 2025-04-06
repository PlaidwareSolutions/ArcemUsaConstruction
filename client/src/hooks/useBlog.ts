import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BlogPost, ExtendedInsertBlogPost } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { generateSlug } from '@/lib/utils';

// Extended interface for blog post with categories, tags, and gallery images
interface BlogPostWithRelations extends BlogPost {
  categories?: { id: number; name: string; slug: string }[];
  tags?: { id: number; name: string; slug: string }[];
  galleryImages?: {
    id: number;
    postId: number;
    imageUrl: string;
    caption: string | null;
    order: number;
  }[];
}

export const useBlog = (postId?: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingGalleryImage, setIsAddingGalleryImage] = useState(false);
  const [isDeletingGalleryImage, setIsDeletingGalleryImage] = useState(false);

  // Fetch single blog post with categories and tags if ID is provided
  const { data: post, isLoading, error } = useQuery<BlogPostWithRelations>({
    queryKey: [`/api/blog/${postId}`],
    enabled: !!postId,
  });
  
  // Fetch blog post gallery images
  const { data: galleryImages, isLoading: isLoadingGallery } = useQuery({
    queryKey: [`/api/blog/${postId}/gallery`],
    enabled: !!postId,
  });

  // Fetch categories for a post
  const getPostCategoryIds = async (postId: number): Promise<number[]> => {
    try {
      const categories = await apiRequest({
        url: `/api/blog/${postId}/categories`,
        method: 'GET'
      });
      return categories.map((cat: any) => cat.id);
    } catch (error) {
      console.error("Error fetching post categories:", error);
      return [];
    }
  };

  // Fetch tags for a post
  const getPostTagIds = async (postId: number): Promise<number[]> => {
    try {
      const tags = await apiRequest({
        url: `/api/blog/${postId}/tags`,
        method: 'GET'
      });
      return tags.map((tag: any) => tag.id);
    } catch (error) {
      console.error("Error fetching post tags:", error);
      return [];
    }
  };

  // Create blog post mutation
  const createMutation = useMutation({
    mutationFn: async (data: ExtendedInsertBlogPost) => {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = generateSlug(data.title);
      }
      return apiRequest({
        url: '/api/blog',
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/all'] });
      toast({
        title: "Blog post created",
        description: "The blog post has been successfully created.",
        variant: "default"
      });
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to create blog post. Please try again.",
        variant: "destructive"
      });
      console.error("Error creating blog post:", error);
    }
  });

  // Update blog post mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ExtendedInsertBlogPost> }) => {
      // Generate slug if title changed and slug not provided
      if (data.title && !data.slug) {
        data.slug = generateSlug(data.title);
      }
      return apiRequest({
        url: `/api/blog/${id}`,
        method: 'PUT',
        body: data
      });
    },
    onSuccess: () => {
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      queryClient.invalidateQueries({ queryKey: ['/api/blog/all'] });
      if (postId) {
        queryClient.invalidateQueries({ queryKey: [`/api/blog/${postId}`] });
      }
      toast({
        title: "Blog post updated",
        description: "The blog post has been successfully updated.",
        variant: "default"
      });
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to update blog post. Please try again.",
        variant: "destructive"
      });
      console.error("Error updating blog post:", error);
    }
  });

  const saveBlogPost = async (data: ExtendedInsertBlogPost) => {
    setIsSubmitting(true);
    try {
      if (postId) {
        const updated = await updateMutation.mutateAsync({ id: postId, data });
        return { ...updated, id: postId };
      } else {
        return await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Error in saveBlogPost:", error);
      throw error;
    }
  };
  
  // Add gallery image mutation
  const addGalleryImageMutation = useMutation({
    mutationFn: async ({ postId, data }: { postId: number, data: { imageUrl: string, caption: string | null, order: number } }) => {
      console.log(`[DEBUG] Adding gallery image for post ID ${postId} with URL: ${data.imageUrl}`);
      
      // More detailed logging of the API request
      console.log(`[DEBUG] Full gallery image data being sent:`, JSON.stringify(data, null, 2));
      
      try {
        const result = await apiRequest({
          url: `/api/blog/${postId}/gallery`,
          method: 'POST',
          body: data
        });
        console.log(`[DEBUG] API request for gallery image successful:`, result);
        return result;
      } catch (error) {
        console.error(`[DEBUG] API request for gallery image failed:`, error);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log(`[DEBUG] Successfully added gallery image:`, response);
      setIsAddingGalleryImage(false);
      queryClient.invalidateQueries({ queryKey: [`/api/blog/${postId}/gallery`] });
      
      toast({
        title: "Image added",
        description: "The gallery image has been successfully added.",
        variant: "default"
      });
    },
    onError: (error) => {
      setIsAddingGalleryImage(false);
      toast({
        title: "Error",
        description: "Failed to add gallery image. Please try again.",
        variant: "destructive"
      });
      console.error("Error adding gallery image:", error);
    }
  });
  
  // Delete gallery image mutation
  const deleteGalleryImageMutation = useMutation({
    mutationFn: async (galleryImageId: number) => {
      return apiRequest({
        url: `/api/blog/gallery/${galleryImageId}`,
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      setIsDeletingGalleryImage(false);
      queryClient.invalidateQueries({ queryKey: [`/api/blog/${postId}/gallery`] });
      
      toast({
        title: "Image deleted",
        description: "The gallery image has been successfully deleted.",
        variant: "default"
      });
    },
    onError: (error) => {
      setIsDeletingGalleryImage(false);
      toast({
        title: "Error",
        description: "Failed to delete gallery image. Please try again.",
        variant: "destructive"
      });
      console.error("Error deleting gallery image:", error);
    }
  });

  // Track upload sessions for cleanup
  const [uploadSessions, setUploadSessions] = useState<Set<string>>(new Set());
  
  // Helper function to upload a file with session tracking
  const uploadFile = async (file: File, sessionId?: string): Promise<{ url: string; sessionId: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Generate a session ID if not provided
    const fileSessionId = sessionId || `blog_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
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
        throw new Error('Failed to upload file');
      }
      
      const data = await response.json();
      
      // Add to tracked sessions
      setUploadSessions(prev => {
        const updated = new Set(prev);
        updated.add(fileSessionId);
        return updated;
      });
      
      return { 
        url: data.url,
        sessionId: data.sessionId || fileSessionId
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };
  
  // Commit the uploads associated with a session
  const commitUploads = async (sessionId: string, fileUrls?: string[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/files/commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, fileUrls }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to commit uploads');
      }
      
      const data = await response.json();
      
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
      // Log the cleanup operation with preserve list
      if (preserveUrls.length > 0) {
        console.log(`Cleaning up blog session ${sessionId} while preserving ${preserveUrls.length} files`);
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
        throw new Error('Failed to cleanup uploads');
      }
      
      const data = await response.json();
      
      // Log the result
      if (data.success) {
        console.log(`Cleanup result: ${data.deletedCount} deleted, ${data.preservedCount} preserved, ${data.failedCount} failed`);
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
      console.error('Error cleaning up uploads:', error);
      return false;
    }
  };
  
  // Helper methods for gallery operations
  const addGalleryImage = async (imageUrl: string, caption: string | null = null, order: number = 0) => {
    if (!postId) return;
    
    setIsAddingGalleryImage(true);
    await addGalleryImageMutation.mutateAsync({
      postId,
      data: {
        imageUrl,
        caption,
        order
      }
    });
  };
  
  const deleteGalleryImage = async (galleryImageId: number) => {
    setIsDeletingGalleryImage(true);
    await deleteGalleryImageMutation.mutateAsync(galleryImageId);
  };

  return {
    post,
    isLoading,
    error,
    saveBlogPost,
    isSubmitting,
    getPostCategoryIds,
    getPostTagIds,
    uploadFile,
    galleryImages,
    isLoadingGallery,
    addGalleryImage,
    deleteGalleryImage,
    isAddingGalleryImage,
    isDeletingGalleryImage,
    // Add new file management functions
    uploadSessions,
    commitUploads,
    cleanupUploads
  };
};
