import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useService } from '@/hooks/useService';
import { ServiceGallery, InsertServiceGallery } from '@shared/schema';
import { Trash2, Image, Loader2, AlertCircle } from 'lucide-react';
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import UploadThingFileUpload from '@/components/common/UploadThingFileUpload';
import * as fileUtils from '@/lib/fileUtils';

interface ServiceGalleryManagerProps {
  serviceId: number;
  isNewService?: boolean;
}

export interface ServiceGalleryManagerHandle {
  saveGalleryImages: () => Promise<void>;
}

const MAX_GALLERY_IMAGES = 3;

const ServiceGalleryManager = forwardRef<ServiceGalleryManagerHandle, ServiceGalleryManagerProps>(
  function ServiceGalleryManager(props, ref) {
    const { serviceId, isNewService = false } = props;
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [pendingImages, setPendingImages] = useState<string[]>([]);
    const [showMaxImagesWarning, setShowMaxImagesWarning] = useState(false);
    const [uploadSession, setUploadSession] = useState<string>('');
    const [isCommitted, setIsCommitted] = useState(false);

    const {
      serviceGallery,
      isLoadingGallery,
      uploadFile,
      addGalleryImage,
      deleteGalleryImage,
      isDeletingGalleryImage,
      trackUploadSession,
      commitUploads,
      cleanupUploads
    } = useService(serviceId);

    // Check if we've reached the maximum image limit
    const currentImageCount = (serviceGallery?.length || 0) + pendingImages.length;
    const canAddMoreImages = currentImageCount < MAX_GALLERY_IMAGES;

    // Expose the saveGalleryImages method via ref
    useImperativeHandle(ref, () => ({
      saveGalleryImages: async () => {
        return saveGalleryImages();
      }
    }));

    // Save pending images to localStorage on change
    useEffect(() => {
      if (pendingImages.length > 0) {
        localStorage.setItem(`pendingImages_service_${serviceId}`, JSON.stringify(pendingImages));
      } else {
        localStorage.removeItem(`pendingImages_service_${serviceId}`);
      }
    }, [pendingImages, serviceId]);

    // Load pending images from localStorage on mount
    useEffect(() => {
      const savedPendingImages = localStorage.getItem(`pendingImages_service_${serviceId}`);
      if (savedPendingImages) {
        try {
          setPendingImages(JSON.parse(savedPendingImages));
        } catch (e) {
          console.error("Error parsing saved pending images:", e);
          localStorage.removeItem(`pendingImages_service_${serviceId}`);
        }
      }
    }, [serviceId]);
    
    // Function to clean up uncommitted files
    const cleanupUncommittedFiles = async () => {
      if (uploadSession && !isCommitted && pendingImages.length > 0) {
        try {
          // Get all existing gallery image URLs to preserve
          const existingImageUrls = serviceGallery
            ? serviceGallery.map(img => img.imageUrl).filter(Boolean)
            : [];
            
          console.log(`Cleaning up uncommitted files for session ${uploadSession} while preserving ${existingImageUrls.length} existing gallery images`);
          
          await cleanupUploads(uploadSession, existingImageUrls);
          console.log('Successfully cleaned up uncommitted files');
        } catch (err) {
          console.error('Error cleaning up files:', err);
        }
      }
    };
    
    // Handle component unmount - clean up any uncommitted files
    useEffect(() => {
      return () => {
        cleanupUncommittedFiles();
      };
    }, [uploadSession, isCommitted, pendingImages]);
    
    // This function handles the file upload but doesn't save to database
    const handleFileUpload = async (urls: string | string[], sessionId?: string) => {
      if (!Array.isArray(urls)) {
        urls = [urls];
      }
      
      // If we received a session ID, track it for cleanup
      if (sessionId) {
        setUploadSession(sessionId);
        setIsCommitted(false);
        trackUploadSession(sessionId);
      }
      
      // Check if adding these images would exceed the limit
      const totalAfterAdd = (serviceGallery?.length || 0) + pendingImages.length + urls.length;
      
      if (totalAfterAdd > MAX_GALLERY_IMAGES) {
        // Calculate how many we can actually add
        const allowedToAdd = Math.max(0, MAX_GALLERY_IMAGES - (serviceGallery?.length || 0) - pendingImages.length);
        
        if (allowedToAdd > 0) {
          // Only add the allowed number of images
          const limitedUrls = urls.slice(0, allowedToAdd);
          setPendingImages(prev => [...prev, ...limitedUrls]);
          
          toast({
            title: 'Maximum images reached',
            description: `Added ${allowedToAdd} image(s). Services can have a maximum of ${MAX_GALLERY_IMAGES} images.`,
            variant: 'default'
          });
        } else {
          // Can't add any more images
          setShowMaxImagesWarning(true);
          
          toast({
            title: 'Maximum images reached',
            description: `Services can have a maximum of ${MAX_GALLERY_IMAGES} images. Delete some images to add more.`,
            variant: 'destructive'
          });
        }
      } else {
        // We can add all the images
        setPendingImages(prev => [...prev, ...urls]);
        
        toast({
          title: 'Images added',
          description: `${urls.length} image${urls.length > 1 ? 's' : ''} ready to be saved.`,
        });
      }
    };
    
    // This function will be called by the ServiceManager when the service is saved
    const saveGalleryImages = async () => {
      if (pendingImages.length === 0) return;
      
      setIsUploading(true);
      
      try {
        // Mark files as committed so they don't get cleaned up
        setIsCommitted(true);
        
        // First, identify which images are truly new (not already in the gallery)
        // We'll use the image URL as the unique identifier
        const existingImageUrls = serviceGallery?.map(img => img.imageUrl) || [];
        const newPendingImages = pendingImages.filter(url => 
          !existingImageUrls.includes(url)
        );
        
        console.log(`Found ${newPendingImages.length} new images to add (filtered from ${pendingImages.length} total pending)`);
        
        // If we have a session ID, mark ALL files as committed on the server (both existing and new)
        // This ensures we don't accidentally delete any existing images
        if (uploadSession) {
          try {
            // Include both new pending images and existing images in commit
            const allImageUrls = [...pendingImages, ...existingImageUrls];
            await commitUploads(uploadSession, allImageUrls);
          } catch (err) {
            console.error('Error committing files:', err);
            // Continue anyway since we've already marked them as committed client-side
          }
        }
        
        // Only proceed with adding new images that don't already exist
        if (newPendingImages.length > 0) {
          // Calculate next display order
          const nextOrder = serviceGallery && serviceGallery.length > 0 
            ? Math.max(...serviceGallery.map(img => img.order !== null ? img.order : 0)) + 1 
            : 1;
          
          // Add each new image to the gallery with sequential display order
          for (let i = 0; i < newPendingImages.length; i++) {
            const galleryImage: InsertServiceGallery = {
              serviceId,
              imageUrl: newPendingImages[i],
              alt: `Gallery image ${i + 1}`,
              order: nextOrder + i,
            };
            
            await addGalleryImage(serviceId, galleryImage);
          }
          
          toast({
            title: 'Gallery updated',
            description: `${newPendingImages.length} image${newPendingImages.length > 1 ? 's' : ''} added to the gallery successfully.`,
          });
        } else {
          toast({
            title: 'Gallery unchanged',
            description: 'No new images were added to the gallery.',
          });
        }
        
        // Clear pending images after successful save
        setPendingImages([]);
        localStorage.removeItem(`pendingImages_service_${serviceId}`);
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
          await deleteGalleryImage(selectedImageId);
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
      // Get the URL of the image to delete
      const imageUrl = pendingImages[index];
      
      // Update state first for responsive UI
      setPendingImages(prev => {
        const newPendingImages = [...prev];
        newPendingImages.splice(index, 1);
        return newPendingImages;
      });
      setShowMaxImagesWarning(false);
      
      // If there's a valid URL, try to delete the file from the server
      if (imageUrl) {
        try {
          console.log('Deleting file:', imageUrl);
          if (uploadSession) {
            // Get existing gallery images to preserve
            const existingImageUrls = serviceGallery
              ? serviceGallery.map(img => img.imageUrl).filter(Boolean)
              : [];
              
            // Filter out the image we're trying to delete
            const preserveUrls = existingImageUrls.filter(url => url !== imageUrl);
            
            // Also preserve other pending images
            const otherPendingUrls = pendingImages
              .filter(url => url !== imageUrl)
              .filter(Boolean);
              
            await cleanupUploads(uploadSession, [...preserveUrls, ...otherPendingUrls]);
          } else {
            // Fallback if no session ID (unlikely but possible)
            await fetch('/api/files/cleanup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ fileUrl: imageUrl }),
              credentials: 'include'
            });
          }
          console.log('Successfully deleted file:', imageUrl);
        } catch (err) {
          console.error('Error deleting file:', err);
        }
      }
    };

    return (
      <div className="space-y-4">
        {showMaxImagesWarning && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Maximum of {MAX_GALLERY_IMAGES} images allowed per service. Please delete some images to add more.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="p-4 border rounded-md bg-muted/20">
          <h4 className="font-medium mb-3">Service Images ({currentImageCount}/{MAX_GALLERY_IMAGES})</h4>
          
          {canAddMoreImages ? (
            <div className="mb-4">
              <UploadThingFileUpload 
                endpoint="imageUploader"
                onClientUploadComplete={(files) => {
                  // Create a session ID for this upload batch
                  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                  trackUploadSession(sessionId);
                  console.log(`Created new upload session ID: ${sessionId}`);
                  
                  // Extract URLs from the response files
                  const urls = files.map(file => {
                    // Access ufsUrl directly to avoid triggering deprecation warning with file.url
                    const imageUrl = file.ufsUrl || '';
                    return imageUrl;
                  });
                  
                  // Track these files in the database and register them with the session
                  if (serviceId) {
                    files.forEach(file => {
                      // Use the new URL format exclusively to avoid deprecation warnings
                      if (file.ufsUrl) {
                        console.log(`Adding image to service gallery: ${file.ufsUrl} (Session: ${sessionId})`);
                      }
                    });
                  }
                  
                  // First, immediately commit these files to prevent them from being deleted
                  if (urls.length > 0) {
                    console.log(`Committing ${urls.length} files for session ${sessionId}`);
                    commitUploads(sessionId, urls).then(() => {
                      console.log(`Successfully committed files for session ${sessionId}`);
                      // Then handle the file upload with the URLs
                      handleFileUpload(urls, sessionId);
                    }).catch(error => {
                      console.error(`Error committing files for session ${sessionId}:`, error);
                      // Still try to handle the file upload in case of error
                      handleFileUpload(urls, sessionId);
                    });
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
                  // You can add loading state here if needed
                }}
                multiple={true}
                accept="image/jpeg, image/png, image/webp"
                maxSizeMB={5}
                buttonText="Add Images"
                helpText={`Add up to ${MAX_GALLERY_IMAGES - currentImageCount} more image${MAX_GALLERY_IMAGES - currentImageCount !== 1 ? 's' : ''}`}
              />
            </div>
          ) : null}

          {isLoadingGallery ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Existing saved images */}
              {serviceGallery && serviceGallery.map((image) => (
                <Card key={`saved-${image.id}`} className="overflow-hidden">
                  <div className="aspect-video relative group">
                    <img
                      src={image.imageUrl}
                      alt={image.alt || `Gallery image ${image.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/1e293b?text=Image+Error";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(image.id)}
                        disabled={isDeletingGalleryImage}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Newly added (pending) images */}
              {pendingImages.map((imageUrl, index) => (
                <Card key={`pending-${index}`} className="overflow-hidden border-dashed border-2">
                  <div className="aspect-video relative group">
                    <img 
                      src={imageUrl} 
                      alt={`New image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePendingImage(index)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3 bg-muted/20">
                    <p className="text-sm truncate text-muted-foreground">New image (not saved yet)</p>
                  </CardContent>
                </Card>
              ))}
              
              {/* Empty state */}
              {currentImageCount === 0 && (
                <div className="col-span-full border rounded-md p-6 text-center bg-muted/30">
                  <Image className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Add up to {MAX_GALLERY_IMAGES} images to showcase this service.
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

export default ServiceGalleryManager;