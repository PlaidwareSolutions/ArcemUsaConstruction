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

type PendingImage = {
  url: string;
  caption: string;
  displayOrder: number;
}

const ProjectGalleryManager = forwardRef<ProjectGalleryManagerHandle, ProjectGalleryManagerProps>(
  (props, ref) => {
    const { 
      projectId, 
      isNewProject = false, 
      previewImageUrl, 
      commitUploads,
      trackUploadSession,
      onSetAsPreview, 
      allowReordering = true,
      ...rest 
    } = props;
    
    // Store a dynamic version of the project ID that can be updated after project creation
    const [dynamicProjectId, setDynamicProjectId] = useState<number>(projectId);
    
    const { toast } = useToast();
    
    // Track upload sessions to clean up on unmount if needed
    const [uploadSessions, setUploadSessions] = useState<Set<string>>(new Set());
    
    // Add a session ID to track for cleanup
    const trackSession = (sessionId: string) => {
      if (trackUploadSession) {
        trackUploadSession(sessionId);
      }
      
      setUploadSessions(prev => {
        const updated = new Set(prev);
        updated.add(sessionId);
        return updated;
      });
      
      console.log(`[ProjectGalleryManager] Added sessionId to tracked sessions: ${sessionId}`);
    };
    
    const { 
      projectGallery,
      isLoadingGallery,
      setProjectFeatureImage,
      addProjectGalleryImage,
      updateProjectGalleryImage,
      deleteProjectGalleryImage,
      cleanupUploads,
    } = useProject(dynamicProjectId);

    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isBatchUploading, setIsBatchUploading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<number | null>(null);
    const [pendingImageToDelete, setPendingImageToDelete] = useState<number | null>(null);
    const [isDeletingGalleryImage, setIsDeletingGalleryImage] = useState(false);
    const [showMaxImagesWarning, setShowMaxImagesWarning] = useState(false);
    const [wasRecenltyEdited, setWasRecentlyEdited] = useState(false);
    
    // Track caption and order changes that need to be saved
    const [modifiedCaptions, setModifiedCaptions] = useState<Map<number, string>>(new Map());
    const [modifiedOrders, setModifiedOrders] = useState<Map<number, number>>(new Map());
    const [isSavingModifications, setIsSavingModifications] = useState(false);
    
    // Determine if we can add more images based on the limit
    const currentImageCount = (projectGallery?.length || 0) + pendingImages.length;
    const canAddMoreImages = currentImageCount < MAX_GALLERY_IMAGES;
    
    // Mark the gallery as edited
    const markEdited = () => {
      setWasRecentlyEdited(true);
      
      // Auto-reset the edited flag after a delay
      setTimeout(() => {
        setWasRecentlyEdited(false);
      }, 3000);
    };
    
    // Update the project ID (used after project creation)
    const updateProjectId = (newId: number) => {
      console.log(`[ProjectGalleryManager] Updating project ID from ${dynamicProjectId} to ${newId}`);
      setDynamicProjectId(newId);
    };
    
    // Save modified captions and orders in batches
    useEffect(() => {
      const saveModifications = async () => {
        // Skip if nothing to save or already saving
        if ((modifiedCaptions.size === 0 && modifiedOrders.size === 0) || isSavingModifications) {
          return;
        }
        
        setIsSavingModifications(true);
        
        try {
          // Process caption updates
          const captionEntries = Array.from(modifiedCaptions.entries());
          for (let i = 0; i < captionEntries.length; i++) {
            const [id, caption] = captionEntries[i];
            try {
              await updateProjectGalleryImage(id, { caption });
              console.log(`Updated caption for image ID ${id}: "${caption}"`);
            } catch (err) {
              console.error(`Error updating caption for image ID ${id}:`, err);
            }
          }
          
          // Process order updates
          const orderEntries = Array.from(modifiedOrders.entries());
          for (let i = 0; i < orderEntries.length; i++) {
            const [id, displayOrder] = orderEntries[i];
            try {
              await updateProjectGalleryImage(id, { displayOrder });
              console.log(`Updated display order for image ID ${id}: ${displayOrder}`);
            } catch (err) {
              console.error(`Error updating display order for image ID ${id}:`, err);
            }
          }
          
          // Clear modified maps after successful save
          setModifiedCaptions(new Map());
          setModifiedOrders(new Map());
        } catch (error) {
          console.error("Error saving gallery modifications:", error);
        } finally {
          setIsSavingModifications(false);
        }
      };
      
      // Debounce the save operation to avoid excessive API calls
      const timer = setTimeout(saveModifications, 1500);
      
      return () => clearTimeout(timer);
    }, [modifiedCaptions, modifiedOrders, updateProjectGalleryImage, isSavingModifications]);
    
    // Update a gallery image caption (for existing images)
    const handleUpdateImageCaption = (id: number, caption: string) => {
      setModifiedCaptions(prev => {
        const updated = new Map(prev);
        updated.set(id, caption);
        return updated;
      });
      markEdited();
    };
    
    // Update a gallery image order (for existing images)
    const handleUpdateImageOrder = (id: number, order: number) => {
      setModifiedOrders(prev => {
        const updated = new Map(prev);
        updated.set(id, order);
        return updated;
      });
      markEdited();
    };
    
    // Update a pending image caption
    const handleUpdatePendingImageCaption = (index: number, caption: string) => {
      setPendingImages(prev => {
        const updated = [...prev];
        updated[index].caption = caption;
        return updated;
      });
      markEdited();
    };
    
    // Delete a pending image
    const handleDeletePendingImage = (index: number) => {
      setPendingImages(prev => {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      });
      markEdited();
    };
    
    // Prepare to delete a gallery image
    const handleDeleteClick = (id: number) => {
      setImageToDelete(id);
      setIsDeleteDialogOpen(true);
    };
    
    // Confirm and actually delete a gallery image
    const confirmDelete = async () => {
      setIsDeletingGalleryImage(true);
      
      try {
        if (imageToDelete !== null) {
          // Delete from the database
          await deleteProjectGalleryImage(imageToDelete);
          
          // Close dialog and reset state
          setIsDeleteDialogOpen(false);
          setImageToDelete(null);
          
          toast({
            title: 'Gallery image deleted',
            description: 'The image has been removed from the gallery.',
          });
        } else if (pendingImageToDelete !== null) {
          // Remove from pending images
          setPendingImages(prev => {
            const updated = [...prev];
            updated.splice(pendingImageToDelete, 1);
            return updated;
          });
          
          // Close dialog and reset state
          setIsDeleteDialogOpen(false);
          setPendingImageToDelete(null);
          
          toast({
            title: 'Image removed',
            description: 'The image has been removed from the pending uploads.',
          });
        }
      } catch (error) {
        console.error("Error deleting gallery image:", error);
        toast({
          title: 'Error',
          description: 'Failed to delete the gallery image. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsDeletingGalleryImage(false);
      }
    };
    
    // Expose methods to the parent component
    useImperativeHandle(ref, () => ({
      saveGalleryImages: async () => {
        await saveGalleryImages();
      },
      hasPendingImages: () => {
        return pendingImages.length > 0;
      },
      hasUnsavedChanges: () => {
        return pendingImages.length > 0 || modifiedCaptions.size > 0 || modifiedOrders.size > 0;
      },
      hasRecentlyModified: () => {
        return wasRecenltyEdited;
      },
      getUnsavedChangesCount: () => {
        return pendingImages.length + modifiedCaptions.size + modifiedOrders.size;
      },
      getPendingImages: () => {
        return pendingImages;
      },
      updateProjectId: (newProjectId: number) => {
        updateProjectId(newProjectId);
      }
    }));
    
    // Persist pending images to localStorage when they change
    useEffect(() => {
      if (pendingImages.length > 0) {
        localStorage.setItem(`pendingImages_project_${projectId}`, JSON.stringify(pendingImages));
        console.log(`Saved ${pendingImages.length} pending images to localStorage for project ${projectId}`);
      } else {
        // Clear from localStorage if empty
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
        console.log(`Clearing ${pendingImages.length} pending images after save`);
        setPendingImages([]);
        localStorage.removeItem(`pendingImages_project_${projectId}`);
        
        // Clear upload sessions as they've been committed
        setUploadSessions(new Set());
        
      } catch (error) {
        console.error("Error saving gallery images:", error);
        toast({
          title: 'Error',
          description: 'Failed to save gallery images. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    };

    // Render the component
    return (
      <div className="space-y-4">
        <div className="rounded-md border bg-card">
          <div className="p-6 space-y-6">
            {/* Header and Save button */}
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold">Project Gallery</h4>
              
              <div className="flex items-center gap-3">
                {/* Warning indicator for unsaved changes */}
                {(pendingImages.length > 0 || modifiedCaptions.size > 0 || modifiedOrders.size > 0) && (
                  <div className="flex items-center text-amber-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Unsaved gallery changes</span>
                  </div>
                )}
                
                {/* Debug message */}
                {console.log(`[RENDER] Save Gallery Images button should be visible: ${pendingImages.length > 0 ? 'YES' : 'NO'} (count: ${pendingImages.length})`)}
                
                {/* Always visible save button */}
                <Button 
                  size="default" 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 animate-pulse border-2 border-green-400"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Save Images button clicked. pendingImages state:", pendingImages);
                    
                    // Check localStorage as fallback
                    const savedPendingImages = localStorage.getItem(`pendingImages_project_${projectId}`);
                    if (savedPendingImages) {
                      try {
                        const parsedImages = JSON.parse(savedPendingImages);
                        console.log(`Found ${parsedImages.length} images in localStorage`);
                        if (parsedImages.length > 0 && pendingImages.length === 0) {
                          setPendingImages(parsedImages);
                        }
                      } catch (e) {
                        console.error("Error parsing saved pending images:", e);
                      }
                    }
                    
                    // Call saveGalleryImages without async/await
                    saveGalleryImages().catch(error => {
                      console.error("Error saving gallery images:", error);
                    });
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
              </div>
            </div>
            
            {canAddMoreImages ? (
              <div className="mb-4">
                <UploadThingFileUpload 
                  endpoint="imageUploader"
                  onClientUploadComplete={(files) => {
                    // Create a session ID for this upload batch
                    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                    if (trackUploadSession) {
                      trackUploadSession(sessionId);
                    }
                    // Always track locally regardless of callback
                    trackSession(sessionId);
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
                    if (commitUploads) {
                      commitUploads(sessionId, urls)
                        .then(() => {
                          console.log(`Successfully committed files for session ${sessionId}`);
                          // Then handle the file upload with the URLs
                          handleFileUpload(urls);
                          // Add a small delay to check pendingImages after state update has processed
                          setTimeout(() => {
                            console.log(`[UPDATED STATE CHECK] pendingImages count after handleFileUpload: ${pendingImages.length}`);
                            console.log(`[UPDATED STATE CHECK] pendingImages contents:`, pendingImages);
                            console.log(`[UPDATED STATE CHECK] Save button should be visible: ${pendingImages.length > 0 ? 'YES' : 'NO'}`);
                          }, 100);
                        })
                        .catch(error => {
                          console.error(`Error committing files for session ${sessionId}:`, error);
                          // Still try to handle the file upload in case of error
                          handleFileUpload(urls);
                        });
                    } else {
                      // Just handle the file upload if we don't have commitUploads
                      handleFileUpload(urls);
                    }
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
                              const stars = document.querySelectorAll('.feature-image-star');
                              stars.forEach(el => {
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
      </div>
    );
  }
);

export default ProjectGalleryManager;