import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProject } from '@/hooks/useProject';
import { ProjectGallery, InsertProjectGallery } from '@shared/schema';
import { 
  Trash2, Image, Loader2, AlertCircle, ArrowUp, ArrowDown, 
  GripVertical, Star, Upload, Plus, ImagePlus 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import FileUpload from '@/components/common/FileUpload';
import SortableGalleryGrid from './SortableGalleryGrid';

import UploadThingFileUpload from '@/components/common/UploadThingFileUpload';

interface ProjectGalleryManagerProps {
  projectId: number;
  isNewProject?: boolean;
  previewImageUrl?: string;
  commitUploads?: (sessionId: string, fileUrls?: string[]) => Promise<string[]>;
  trackUploadSession?: (sessionId: string) => void;
  onSetAsPreview?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, imageUrl: string) => void;
  allowReordering?: boolean;
}

export interface ProjectGalleryManagerHandle {
  saveGalleryImages: () => Promise<void>;
  hasPendingImages: () => boolean;
  hasUnsavedChanges: () => boolean;
  hasRecentlyModified: () => boolean;
  getUnsavedChangesCount: () => number;
  getPendingImages: () => PendingImage[];
  updateProjectId: (newProjectId: number) => void;
}

const MAX_GALLERY_IMAGES = 10;

// Type that matches our pending image structure
type PendingImage = {
  url: string;
  caption: string;
  displayOrder: number;
}

const ProjectGalleryManager = forwardRef<ProjectGalleryManagerHandle, ProjectGalleryManagerProps>(
  function ProjectGalleryManager(props, ref) {
    const { projectId, isNewProject = false, previewImageUrl } = props;
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
    const [showMaxImagesWarning, setShowMaxImagesWarning] = useState(false);
    
    // Removed image cropping states
    
    // New state for batch upload tracking
    const [batchUploadProgress, setBatchUploadProgress] = useState<number>(0);
    const [isBatchUploading, setIsBatchUploading] = useState(false);
    const [batchUploadCount, setBatchUploadCount] = useState<number>(0);
    const [batchUploadTotal, setBatchUploadTotal] = useState<number>(0);
    
    const {
      projectGallery,
      isLoadingGallery,
      uploadFile,
      addProjectGalleryImage,
      deleteProjectGalleryImage,
      updateProjectGalleryImage,
      isDeletingGalleryImage,
      uploadSessions,
      commitUploads,
      cleanupUploads,
      trackUploadSession,
      setProjectFeatureImage,
      isSettingFeatureImage
    } = useProject(projectId);

    // Check if we've reached the maximum image limit
    const currentImageCount = (projectGallery?.length || 0) + pendingImages.length;
    const canAddMoreImages = currentImageCount < MAX_GALLERY_IMAGES;

    // Track if captions or orders have been modified
    const [modifiedCaptions, setModifiedCaptions] = useState<Set<number>>(new Set());
    const [modifiedOrders, setModifiedOrders] = useState<Set<number>>(new Set());
    const [lastModifiedTimestamp, setLastModifiedTimestamp] = useState<number>(0);
    
    // Flag an edit has occurred in the last 3 seconds
    const hasRecentEdit = () => {
      return Date.now() - lastModifiedTimestamp < 3000; // 3 seconds
    };
    
    // Mark an edit as happening now
    const markEdited = () => {
      setLastModifiedTimestamp(Date.now());
    };
    
    // State to track the dynamic project ID (useful for newly created projects)
    const [dynamicProjectId, setDynamicProjectId] = useState<number>(projectId);
    
    // Update the dynamic project ID when the prop changes
    useEffect(() => {
      setDynamicProjectId(projectId);
    }, [projectId]);
    
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      saveGalleryImages: async () => {
        return saveGalleryImages();
      },
      hasPendingImages: () => {
        return pendingImages.length > 0;
      },
      hasUnsavedChanges: () => {
        return pendingImages.length > 0 || modifiedCaptions.size > 0 || modifiedOrders.size > 0;
      },
      hasRecentlyModified: () => {
        return hasRecentEdit();
      },
      getUnsavedChangesCount: () => {
        return pendingImages.length + modifiedCaptions.size + modifiedOrders.size;
      },
      getPendingImages: () => {
        return [...pendingImages];
      },
      updateProjectId: (newProjectId: number) => {
        console.log(`Updating project ID from ${dynamicProjectId} to ${newProjectId}`);
        setDynamicProjectId(newProjectId);
      }
    }));

    // Save pending images to localStorage on change
    useEffect(() => {
      if (pendingImages.length > 0) {
        localStorage.setItem(`pendingImages_project_${projectId}`, JSON.stringify(pendingImages));
      } else {
        localStorage.removeItem(`pendingImages_project_${projectId}`);
      }
    }, [pendingImages, projectId]);

    // Load pending images from localStorage on mount
    useEffect(() => {
      console.log(`[MOUNT] Looking for pending images for project ${projectId} in localStorage`);
      const savedPendingImages = localStorage.getItem(`pendingImages_project_${projectId}`);
      if (savedPendingImages) {
        try {
          const parsedImages = JSON.parse(savedPendingImages);
          console.log(`[MOUNT] Found ${parsedImages.length} pending images in localStorage, setting state`);
          setPendingImages(parsedImages);
        } catch (e) {
          console.error("Error parsing saved pending images:", e);
          localStorage.removeItem(`pendingImages_project_${projectId}`);
        }
      } else {
        console.log(`[MOUNT] No pending images found in localStorage for project ${projectId}`);
      }
    }, [projectId]);
    
    // Clean up uploads on unmount if they haven't been saved
    useEffect(() => {
      // Return cleanup function that will run when component unmounts
      return () => {
        // Check if we need to clean up (only if we have sessions and not all were committed)
        if (uploadSessions.size > 0 && cleanupUploads) {
          console.log("[ProjectGalleryManager] Cleaning up uncommitted gallery uploads on unmount");
          console.log("[ProjectGalleryManager] Upload sessions to clean:", Array.from(uploadSessions));
          
          // Get all existing gallery image URLs to preserve - THIS IS CRITICAL!
          // We need to preserve all current gallery images to prevent deletion
          const existingImageUrls = projectGallery && Array.isArray(projectGallery)
            ? projectGallery.map(img => img.imageUrl).filter(Boolean)
            : [];
            
          console.log(`[ProjectGalleryManager] PRESERVING ${existingImageUrls.length} existing gallery images during cleanup:`);
          console.log("[ProjectGalleryManager] Images to preserve:", existingImageUrls);
          
          // Get any pending image URLs to also preserve
          const pendingImageUrls = pendingImages.map(img => img.url);
          
          // Combined URLs to preserve (both existing in database and pending)
          const allUrlsToPreserve = [...existingImageUrls, ...pendingImageUrls];
          console.log(`[ProjectGalleryManager] Total URLs to preserve: ${allUrlsToPreserve.length} (gallery: ${existingImageUrls.length}, pending: ${pendingImageUrls.length})`);
          
          // Clean up each session individually, preserving existing images
          uploadSessions.forEach(sessionId => {
            console.log(`[ProjectGalleryManager] Cleaning up session ${sessionId} with ${allUrlsToPreserve.length} URLs to preserve`);
            
            // IMPORTANT: Pass ALL URLs to preserve to prevent deletion
            cleanupUploads(sessionId, allUrlsToPreserve)
              .then(success => {
                console.log(`[ProjectGalleryManager] Cleanup result for session ${sessionId}: ${success ? 'success' : 'failed'}`);
              })
              .catch(err => {
                console.error(`[ProjectGalleryManager] Error cleaning up gallery upload session ${sessionId}:`, err);
              });
          });
        } else {
          console.log("[ProjectGalleryManager] No cleanup needed on unmount:", {
            hasUploadSessions: uploadSessions.size > 0,
            hasCleanupFunction: !!cleanupUploads
          });
        }
      };
    }, [cleanupUploads, uploadSessions, projectGallery, pendingImages]);

    // Calculate the next order value for new images
    const getNextOrderValue = () => {
      if (projectGallery && projectGallery.length > 0) {
        const existingOrders = projectGallery.map(image => image.displayOrder !== null ? image.displayOrder : 0);
        return Math.max(...existingOrders) + 1;
      } else if (pendingImages.length > 0) {
        const pendingOrders = pendingImages.map(image => image.displayOrder);
        return Math.max(...pendingOrders) + 1;
      }
      return 1;
    };
    
    // This function handles the file upload but doesn't save to database
    const handleFileUpload = async (urls: string | string[]) => {
      if (!Array.isArray(urls)) {
        urls = [urls];
      }
      
      console.log(`[handleFileUpload] Starting upload process with ${urls.length} images`);
      console.log(`[handleFileUpload] Current project ID: ${projectId}`);
      console.log(`[handleFileUpload] Current pendingImages: ${pendingImages.length}`);
      
      // Check if adding these images would exceed the limit
      const totalAfterAdd = currentImageCount + urls.length;
      
      if (totalAfterAdd > MAX_GALLERY_IMAGES) {
        // Calculate how many we can actually add
        const allowedToAdd = Math.max(0, MAX_GALLERY_IMAGES - currentImageCount);
        
        if (allowedToAdd > 0) {
          // Only add the allowed number of images
          const limitedUrls = urls.slice(0, allowedToAdd);
          
          // Create pending images with next order value
          const nextOrder = getNextOrderValue();
          const newPendingImages = limitedUrls.map((url, idx) => ({
            url,
            caption: `Project image ${idx + 1}`,
            displayOrder: nextOrder + idx
          }));
          
          console.log(`[handleFileUpload] Adding ${newPendingImages.length} limited images to pendingImages`);
          
          // Use a callback with the current state to ensure we're working with the latest data
          setPendingImages(prev => {
            const updatedPendingImages = [...prev, ...newPendingImages];
            // Save to localStorage inside the callback to ensure we're using the updated state
            console.log(`[handleFileUpload] Saving ${updatedPendingImages.length} pending images to localStorage (limited case)`);
            localStorage.setItem(`pendingImages_project_${projectId}`, JSON.stringify(updatedPendingImages));
            return updatedPendingImages;
          });
          
          toast({
            title: 'Maximum images reached',
            description: `Added ${allowedToAdd} image(s). Projects can have a maximum of ${MAX_GALLERY_IMAGES} images.`,
            variant: 'default'
          });
        } else {
          // Can't add any more images
          setShowMaxImagesWarning(true);
          
          toast({
            title: 'Maximum images reached',
            description: `Projects can have a maximum of ${MAX_GALLERY_IMAGES} images. Delete some images to add more.`,
            variant: 'destructive'
          });
        }
      } else {
        // We can add all the images
        const nextOrder = getNextOrderValue();
        const newPendingImages = urls.map((url, idx) => ({
          url,
          caption: `Project image ${idx + 1}`,
          displayOrder: nextOrder + idx
        }));
        
        console.log(`[handleFileUpload] Adding ${newPendingImages.length} new images to pendingImages`);
        
        // Use the callback form of setPendingImages to ensure we're working with the most up-to-date state
        setPendingImages(prev => {
          const updatedPendingImages = [...prev, ...newPendingImages];
          // Store pending images in localStorage for persistence
          console.log(`[handleFileUpload] Saving ${updatedPendingImages.length} pending images to localStorage`);
          localStorage.setItem(`pendingImages_project_${projectId}`, JSON.stringify(updatedPendingImages));
          return updatedPendingImages;
        });
        
        toast({
          title: 'Images added',
          description: `${urls.length} image${urls.length > 1 ? 's' : ''} ready to be saved.`,
        });
      }
    };
    
    // This function will be called by the ProjectManager when the project is saved
    const saveGalleryImages = async () => {
      // DEBUGGING: Check current state
      console.log(`[saveGalleryImages] Starting with ${pendingImages.length} pending images:`, 
        pendingImages.map(img => ({ url: img.url.substring(0, 30) + '...', caption: img.caption }))
      );
      
      // Always check for images in localStorage (in case React state was lost)
      let loadedPendingImages = [...pendingImages]; // Create a copy of the array
      
      // Try to load from localStorage regardless of what's in state
      const savedPendingImages = localStorage.getItem(`pendingImages_project_${projectId}`);
      if (savedPendingImages) {
        try {
          const parsedImages = JSON.parse(savedPendingImages) as PendingImage[];
          console.log(`[saveGalleryImages] Loaded ${parsedImages.length} pending images from localStorage`);
          
          // If we found images in localStorage but not in state, use the localStorage ones
          if (parsedImages.length > 0 && pendingImages.length === 0) {
            loadedPendingImages = parsedImages;
            console.log(`[saveGalleryImages] Using ${loadedPendingImages.length} images from localStorage instead of empty state`);
          } 
          // If we have images in both places, combine them (avoiding duplicates)
          else if (parsedImages.length > 0 && pendingImages.length > 0) {
            // Create a map of URLs we already have in state
            const existingUrls = new Set(pendingImages.map(img => img.url));
            
            // Add any images from localStorage that aren't already in state
            const newImages = parsedImages.filter(img => !existingUrls.has(img.url));
            
            if (newImages.length > 0) {
              loadedPendingImages = [...pendingImages, ...newImages];
              console.log(`[saveGalleryImages] Combined ${pendingImages.length} images from state with ${newImages.length} unique images from localStorage`);
            }
          }
        } catch (e) {
          console.error("Error parsing saved pending images:", e);
        }
      }
      
      // Log the final set of images we'll be working with
      console.log(`[saveGalleryImages] Final pending images count: ${loadedPendingImages.length}`);
      if (loadedPendingImages.length > 0) {
        console.log(`[saveGalleryImages] Image URLs:`, loadedPendingImages.map(img => img.url.substring(0, 30) + '...'));
      }
      
      if (loadedPendingImages.length === 0) {
        console.log("[saveGalleryImages] No pending images to save, exiting early");
        return;
      }
      
      setIsUploading(true);
      
      try {
        // For new projects, we don't save the gallery images yet - we'll do it after project creation
        if (isNewProject) {
          // Just commit the uploads to prevent cleanup of saved files
          if (commitUploads && uploadSessions.size > 0) {
            // Get all file URLs to commit - ensure we're tracking these files
            const fileUrls = loadedPendingImages.map(img => img.url);
            
            // Commit each session
            for (const sessionId of Array.from(uploadSessions)) {
              await commitUploads(sessionId, fileUrls);
              console.log(`Committed gallery upload session for new project: ${sessionId}`);
            }
          }
          
          toast({
            title: 'Images saved',
            description: `${loadedPendingImages.length} image${loadedPendingImages.length > 1 ? 's' : ''} will be added after project creation.`,
          });
          
          return;
        }
        
        // For existing projects, add each image to the gallery with caption and display order
        // Use dynamicProjectId instead of projectId to handle cases where the ID was updated after project creation
        console.log(`Adding ${loadedPendingImages.length} gallery images to project ${dynamicProjectId}`);
        
        // First, get all existing gallery image URLs for comparison
        console.log("[saveGalleryImages] Fetch current gallery for comparison");
        const currentGallery = await apiRequest({
          url: `/api/projects/${dynamicProjectId}/gallery`,
          method: 'GET'
        });
        
        // Define a type for the gallery items from the API
        type GalleryItem = { imageUrl: string, id: number, [key: string]: any };
        
        const existingImageUrls = (currentGallery && Array.isArray(currentGallery))
          ? currentGallery.map((img: GalleryItem) => img.imageUrl || '')
          : (projectGallery?.map(img => img.imageUrl) || []);
        
        console.log(`[saveGalleryImages] Found ${existingImageUrls.length} existing gallery images`);
        
        // Identify which images are truly new (not already in the gallery)
        // We'll use the image URL as the unique identifier
        const newPendingImages = loadedPendingImages.filter(pendingImg => {
          // Convert URLs to a common format for comparison by removing any query parameters
          const normalizedPendingUrl = pendingImg.url.split('?')[0].trim();
          
          // Check if this URL exists in the gallery (also normalize existing URLs)
          const isNew = !existingImageUrls.some(existingUrl => {
            const normalizedExistingUrl = existingUrl.split('?')[0].trim();
            return normalizedExistingUrl === normalizedPendingUrl;
          });
          
          if (!isNew) {
            console.log(`[saveGalleryImages] Image already exists in gallery: ${pendingImg.url.substring(0, 30)}...`);
          } else {
            console.log(`[saveGalleryImages] New image to be added: ${pendingImg.url.substring(0, 30)}...`);
          }
          return isNew;
        });
        
        console.log(`[saveGalleryImages] Found ${newPendingImages.length} new images to add (filtered from ${loadedPendingImages.length} total pending)`);
        
        // Only add truly new images to the database
        for (const pendingImage of newPendingImages) {
          // Make sure we have the URL before proceeding
          if (!pendingImage.url) {
            console.error("Missing URL for pending image:", pendingImage);
            continue;
          }

          const galleryImage: InsertProjectGallery = {
            projectId: dynamicProjectId, // Use the dynamic project ID which may have been updated
            imageUrl: pendingImage.url,
            caption: pendingImage.caption,
            displayOrder: pendingImage.displayOrder,
          };
          
          console.log(`[saveGalleryImages] Saving gallery image to database: ${pendingImage.url.substring(0, 30)}...`);
          try {
            const savedImage = await addProjectGalleryImage(galleryImage);
            console.log(`[saveGalleryImages] Successfully saved gallery image:`, savedImage);
          } catch (error) {
            console.error(`[saveGalleryImages] Error saving gallery image:`, error);
            throw error;
          }
        }
        
        // Commit all pending uploads to prevent cleanup of saved files
        // This includes both new and existing images to ensure nothing gets deleted
        if (commitUploads && uploadSessions.size > 0) {
          // Get all file URLs to commit - both new and existing
          const allImageUrls = [
            ...pendingImages.map(img => img.url),
            ...existingImageUrls
          ];
          
          // Commit each session with all image URLs to preserve everything
          for (const sessionId of Array.from(uploadSessions)) {
            await commitUploads(sessionId, allImageUrls);
            console.log(`Committed gallery upload session: ${sessionId}`);
          }
        }
        
        toast({
          title: 'Gallery updated',
          description: `${newPendingImages.length} image${newPendingImages.length > 1 || newPendingImages.length === 0 ? 's' : ''} added to the gallery successfully.`,
        });
        
        // Clear pending images after successful save
        setPendingImages([]);
        localStorage.removeItem(`pendingImages_project_${projectId}`);
        setShowMaxImagesWarning(false);
      } catch (error) {
        console.error("Error adding gallery images:", error);
        toast({
          title: "Save failed",
          description: "Failed to add some images to the gallery. Please try again.",
          variant: "destructive"
        });
        throw error;
      } finally {
        setIsUploading(false);
      }
    };

    const handleDeleteClick = (id: number) => {
      setSelectedImageId(id);
      setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
      if (selectedImageId !== null) {
        try {
          await deleteProjectGalleryImage(selectedImageId);
          setShowMaxImagesWarning(false);
          toast({
            title: 'Image deleted',
            description: 'The image has been removed from the gallery.',
          });
        } catch (error) {
          console.error('Error deleting image:', error);
          toast({
            title: 'Deletion failed',
            description: 'Failed to delete the image. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsDeleteDialogOpen(false);
          setSelectedImageId(null);
        }
      }
    };
    
    // Delete a pending image (not yet saved to database)
    const handleDeletePendingImage = async (index: number) => {
      const pendingImage = pendingImages[index];
      
      // First remove from state
      setPendingImages(prev => {
        const newPendingImages = [...prev];
        newPendingImages.splice(index, 1);
        return newPendingImages;
      });
      
      // If we're tracking this file via sessions, also try to clean it up server-side
      if (pendingImage && pendingImage.url) {
        // Check if this URL might be used in existing gallery images
        const existingImageUrls = projectGallery 
          ? projectGallery.map(img => img.imageUrl)
          : [];
          
        // If this URL is in the existing gallery, don't try to delete it
        if (existingImageUrls.includes(pendingImage.url)) {
          console.log(`Not deleting file ${pendingImage.url} as it exists in the gallery`);
          setShowMaxImagesWarning(false);
          return;
        }
        
        try {
          // Get list of other pending images to preserve
          const otherPendingUrls = pendingImages
            .filter((_, i) => i !== index)
            .map(img => img.url);
            
          // Make direct API call to cleanup the specific file, preserving other files
          const response = await fetch('/api/files/cleanup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              fileUrl: pendingImage.url,
              preserveUrls: [...existingImageUrls, ...otherPendingUrls]
            }),
            credentials: 'include'
          });
          
          if (response.ok) {
            console.log(`Successfully removed unused file: ${pendingImage.url}`);
          }
        } catch (err) {
          console.error('Error cleaning up deleted pending image:', err);
        }
      }
      
      setShowMaxImagesWarning(false);
    };

    // Update caption for a saved image
    const handleUpdateImageCaption = async (id: number, caption: string) => {
      try {
        // Track this caption as being modified
        setModifiedCaptions(prev => {
          const updated = new Set(prev);
          updated.add(id);
          return updated;
        });
        markEdited();
        
        await updateProjectGalleryImage(id, { caption });
        
        // Caption was successfully saved, remove from modified set
        setModifiedCaptions(prev => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
        
        toast({
          title: 'Caption updated',
          description: 'Image caption has been updated successfully.',
        });
      } catch (error) {
        console.error('Error updating image caption:', error);
        toast({
          title: 'Update failed',
          description: 'Failed to update the image caption. Please try again.',
          variant: 'destructive',
        });
      }
    };

    // Update order for a saved image
    const handleUpdateImageOrder = async (id: number, displayOrder: number | null) => {
      // If displayOrder is null, we can't process it
      if (displayOrder === null) return;
      try {
        // Track this order as being modified
        setModifiedOrders(prev => {
          const updated = new Set(prev);
          updated.add(id);
          return updated;
        });
        markEdited();
        
        await updateProjectGalleryImage(id, { displayOrder });
        
        // Order was successfully saved, remove from modified set
        setModifiedOrders(prev => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
        
        toast({
          title: 'Display order updated',
          description: 'Image display order has been updated successfully.',
        });
      } catch (error) {
        console.error('Error updating image order:', error);
        toast({
          title: 'Update failed',
          description: 'Failed to update the image display order. Please try again.',
          variant: 'destructive',
        });
      }
    };

    // Update caption for a pending image
    const handleUpdatePendingImageCaption = (index: number, caption: string) => {
      setPendingImages(prev => {
        const newPendingImages = [...prev];
        newPendingImages[index].caption = caption;
        return newPendingImages;
      });
      markEdited();
    };

    // Update order for a pending image
    const handleUpdatePendingImageOrder = (index: number, order: string) => {
      const orderValue = parseInt(order, 10);
      if (isNaN(orderValue)) return;
      
      setPendingImages(prev => {
        const newPendingImages = [...prev];
        newPendingImages[index].displayOrder = orderValue;
        return newPendingImages;
      });
      markEdited();
    };
    
    // Handle batch uploads with progress tracking
    const handleBatchUpload = async (files: File[], sessionId: string) => {
      if (!files.length) return [];
      
      setIsBatchUploading(true);
      setBatchUploadTotal(files.length);
      setBatchUploadCount(0);
      setBatchUploadProgress(0);
      
      try {
        const uploadedUrls: string[] = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            const result = await uploadFile(file, sessionId);
            uploadedUrls.push(result.url);
            
            // Update progress
            setBatchUploadCount(i + 1);
            setBatchUploadProgress(Math.round(((i + 1) / files.length) * 100));
          } catch (error) {
            console.error(`Error uploading file ${i + 1}/${files.length}:`, error);
          }
        }
        
        if (uploadedUrls.length > 0) {
          await handleFileUpload(uploadedUrls);
        }
        
        return uploadedUrls;
      } catch (error) {
        console.error('Batch upload error:', error);
        toast({
          title: 'Upload failed',
          description: 'There was an error uploading your images. Please try again.',
          variant: 'destructive',
        });
        return [];
      } finally {
        setTimeout(() => {
          setIsBatchUploading(false);
          setBatchUploadProgress(0);
          setBatchUploadCount(0);
          setBatchUploadTotal(0);
        }, 1000); // Keep progress visible momentarily
      }
    };
    
    // Removed image cropping functions

    // Move image display order up
    const moveImageOrderUp = (id: number, currentOrder: number | null) => {
      if (!projectGallery || currentOrder === null) return;
      
      // Find if there's an image with order less than current
      const higherImages = projectGallery
        .filter(img => img.displayOrder !== null && img.displayOrder < currentOrder)
        .sort((a, b) => (b.displayOrder || 0) - (a.displayOrder || 0)); // Sort in descending order
        
      if (higherImages.length > 0) {
        const targetImage = higherImages[0];
        handleUpdateImageOrder(id, targetImage.displayOrder || 0);
        handleUpdateImageOrder(targetImage.id, currentOrder);
      }
    };

    // Move image display order down
    const moveImageOrderDown = (id: number, currentOrder: number | null) => {
      if (!projectGallery || currentOrder === null) return;
      
      // Find if there's an image with order more than current
      const lowerImages = projectGallery
        .filter(img => img.displayOrder !== null && img.displayOrder > currentOrder)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)); // Sort in ascending order
        
      if (lowerImages.length > 0) {
        const targetImage = lowerImages[0];
        handleUpdateImageOrder(id, targetImage.displayOrder || 0);
        handleUpdateImageOrder(targetImage.id, currentOrder);
      }
    };

    return (
      <div className="space-y-4">
        
        {showMaxImagesWarning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Maximum of {MAX_GALLERY_IMAGES} images allowed per project. Please delete some images to add more.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Batch Upload Progress Indicator */}
        {isBatchUploading && (
          <div className="space-y-2 p-4 border rounded-md bg-muted/10">
            <div className="flex justify-between items-center">
              <span className="text-sm">Uploading {batchUploadCount} of {batchUploadTotal} images...</span>
              <span className="text-sm font-medium">{batchUploadProgress}%</span>
            </div>
            <Progress value={batchUploadProgress} />
          </div>
        )}
        
        <div className="p-4 border rounded-md bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Project Images ({currentImageCount}/{MAX_GALLERY_IMAGES})</h4>
            <div className="flex items-center gap-3">
              {/* Warning indicator for unsaved changes */}
              {(pendingImages.length > 0 || modifiedCaptions.size > 0 || modifiedOrders.size > 0) && (
                <div className="flex items-center text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Unsaved gallery changes</span>
                </div>
              )}
              
              {/* Debugging message about button visibility */}
              {console.log(`[RENDER] Save Gallery Images button should be visible: ${pendingImages.length > 0 ? 'YES' : 'NO'} (count: ${pendingImages.length})`)}
              
              {/* ALWAYS SHOW A SAVE BUTTON FOR DEBUGGING - remove in production */}
              <Button 
                size="default" 
                variant={pendingImages.length > 0 ? "default" : "outline"}
                className={pendingImages.length > 0 ? 
                  "bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 animate-pulse border-2 border-green-400" :
                  "border-green-400 text-green-600"
                }
                onClick={async (e) => {
                  e.preventDefault();
                  console.log("Save Images button clicked. pendingImages state:", pendingImages);
                  
                  // Check for images in localStorage as a fallback
                  const savedPendingImages = localStorage.getItem(`pendingImages_project_${projectId}`);
                  if (savedPendingImages) {
                    try {
                      const parsedImages = JSON.parse(savedPendingImages);
                      console.log(`Found ${parsedImages.length} images in localStorage that might not be in state`);
                      if (parsedImages.length > 0 && pendingImages.length === 0) {
                        // Directly set the state from localStorage before saving
                        setPendingImages(parsedImages);
                      }
                    } catch (e) {
                      console.error("Error parsing saved pending images on button click:", e);
                    }
                  }
                  
                  try {
                    await saveGalleryImages();
                  } catch (error) {
                    console.error("Error saving gallery images:", error);
                  }
                }}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Saving Images...
                  </>
                ) : (
                  <>
                      <ImagePlus className="h-5 w-5 mr-2" />
                      Save Gallery Images ({pendingImages.length})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          {canAddMoreImages ? (
            <div className="mb-4">
              <UploadThingFileUpload 
                endpoint="imageUploader"
                onClientUploadComplete={(files) => {
                  // Create a session ID for this upload batch
                  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                  trackUploadSession(sessionId);
                  console.log(`Created new upload session ID: ${sessionId}`);
                  
                  // Extract URLs from the response files - use ONLY ufsUrl to avoid deprecation warnings
                  const urls = files.map(file => {
                    // Access ufsUrl directly to avoid triggering deprecation warning with file.url
                    const imageUrl = file.ufsUrl || '';
                    return imageUrl;
                  });
                  
                  // Track these files in the database and register them with the session
                  if (projectId) {
                    files.forEach(file => {
                      // Use the new URL format exclusively to avoid deprecation warnings
                      if (file.ufsUrl) {
                        console.log(`Adding image to gallery: ${file.ufsUrl} (Session: ${sessionId})`);
                      }
                    });
                  }
                  
                  // Process the selected files and pass the session ID
                  console.log(`Passing ${urls.length} URLs to handleFileUpload with sessionId: ${sessionId}`);
                  console.log(`Current pendingImages count: ${pendingImages.length}`);
                  
                  // First, immediately commit these files to prevent them from being deleted
                  commitUploads(sessionId, urls).then(() => {
                    console.log(`Successfully committed files for session ${sessionId}`);
                    // Then handle the file upload with the URLs
                    handleFileUpload(urls);
                    // Add a small delay to check pendingImages after state update has processed
                    setTimeout(() => {
                      console.log(`[UPDATED STATE CHECK] pendingImages count after handleFileUpload: ${pendingImages.length}`);
                      console.log(`[UPDATED STATE CHECK] pendingImages contents:`, pendingImages);
                      console.log(`[UPDATED STATE CHECK] Save button should be visible: ${pendingImages.length > 0 ? 'YES' : 'NO'}`);
                    }, 100);
                  }).catch(error => {
                    console.error(`Error committing files for session ${sessionId}:`, error);
                    // Still try to handle the file upload in case of error
                    handleFileUpload(urls);
                  });
                }}
                onUploadError={(error) => {
                  console.error("UploadThing error:", error);
                  toast({
                    title: "Upload failed",
                    description: error.message || "There was an error uploading your images.",
                    variant: "destructive"
                  });
                }}
                onUploadBegin={() => {
                  setIsBatchUploading(true);
                }}
                multiple={true}
                accept="image/jpeg, image/png, image/webp"
                maxSizeMB={8}
                buttonText="Select Project Images"
                helpText={`Add up to ${MAX_GALLERY_IMAGES - currentImageCount} more image${MAX_GALLERY_IMAGES - currentImageCount !== 1 ? 's' : ''}`}
              />
            </div>
          ) : null}

          {isLoadingGallery ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Gallery images with drag and drop sorting */}
              {(projectGallery && projectGallery.length > 0) || pendingImages.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-muted-foreground">Gallery Images</h5>
                    {(modifiedCaptions.size > 0 || modifiedOrders.size > 0) && (
                      <span className="text-xs text-amber-600 flex items-center">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Saving changes...
                      </span>
                    )}
                  </div>
                  
                  <SortableGalleryGrid 
                    savedGalleryItems={projectGallery || []}
                    pendingGalleryItems={pendingImages}
                    previewImageUrl={previewImageUrl}
                    onReorderSavedItems={(items) => {
                      // Update the order of each item
                      items.forEach(item => {
                        // Need to update display order for each item
                        if (item.id !== undefined && item.id !== null && item.displayOrder !== undefined && item.displayOrder !== null) {
                          handleUpdateImageOrder(item.id, item.displayOrder);
                        }
                      });
                    }}
                    onReorderPendingItems={(items) => {
                      // Replace all pending items with the reordered ones
                      setPendingImages(items);
                      markEdited();
                    }}
                    onSetAsPreview={(url) => {
                      // Find the corresponding gallery item
                      const galleryItem = projectGallery?.find(item => item.imageUrl === url);
                      
                      if (galleryItem && setProjectFeatureImage) {
                        // If we found the image in the gallery, use the new feature image API
                        // Add preventDefault to prevent form submission when clicking on feature star
                        const setFeature = (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null) => {
                          if (e) e.preventDefault();
                          
                          // Optimistic update: Mark this image as the feature image in the UI
                          if (projectGallery) {
                            const updatedProjectGallery = projectGallery.map(item => ({
                              ...item,
                              isFeature: item.id === galleryItem.id
                            }));
                            
                            // Force a UI update with the new gallery state
                            // This doesn't actually modify the state but tricks React into re-rendering
                            document.querySelectorAll('.feature-image-star').forEach(el => {
                              if (el.getAttribute('data-gallery-id') === galleryItem.id.toString()) {
                                (el as HTMLElement).style.color = 'gold';
                              } else {
                                (el as HTMLElement).style.color = '';
                              }
                            });
                          }
                          
                          setProjectFeatureImage(galleryItem.id)
                            .then(() => {
                              toast({
                                title: "Feature image updated",
                                description: "This image is now the feature image for the project.",
                                variant: "default"
                              });
                            })
                            .catch((error: unknown) => {
                              console.error("Error setting feature image:", error);
                              toast({
                                title: "Error",
                                description: "Failed to set feature image. Please try again.",
                                variant: "destructive"
                              });
                            });
                        };
                        
                        // Call with null since we're not receiving the event here
                        setFeature(null);
                      } else if (props.onSetAsPreview) {
                        // Fall back to the old method for pending images or if we have a callback
                        // Add preventDefault in the handler to prevent form submission
                        const handlePreview = (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null) => {
                          if (e) e.preventDefault();
                          props.onSetAsPreview!(e, url);
                        };
                        
                        // Call with null since we're not receiving the event here
                        handlePreview(null);
                      }
                    }}
                    onDeleteSavedItem={(id) => {
                      handleDeleteClick(id);
                    }}
                    onDeletePendingItem={(index) => {
                      handleDeletePendingImage(index);
                    }}
                    onUpdateSavedItemCaption={(id, caption) => {
                      handleUpdateImageCaption(id, caption);
                    }}
                    onUpdatePendingItemCaption={(index, caption) => {
                      handleUpdatePendingImageCaption(index, caption);
                    }}
                  />
                </div>
              ) : null}
              
              {/* Empty state */}
              {currentImageCount === 0 && (
                <div className="border rounded-md p-6 text-center bg-muted/30">
                  <Image className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add up to {MAX_GALLERY_IMAGES} images to showcase this project.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Gallery Image</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this image? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeletingGalleryImage}
              >
                {isDeletingGalleryImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

export default ProjectGalleryManager;