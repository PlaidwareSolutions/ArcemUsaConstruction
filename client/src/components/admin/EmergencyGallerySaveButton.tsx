import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmergencyGallerySaveButtonProps {
  projectId: number;
}

const EmergencyGallerySaveButton: React.FC<EmergencyGallerySaveButtonProps> = ({ projectId }) => {
  const { toast } = useToast();
  const [pendingImages, setPendingImages] = useState<Array<{url: string, caption?: string, displayOrder?: number}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  // Load pending images from localStorage on mount
  useEffect(() => {
    const checkForPendingImages = () => {
      console.log(`[EmergencyButton] Checking for pending images for project ${projectId}`);
      const savedPendingImages = localStorage.getItem(`pendingImages_project_${projectId}`);
      
      if (savedPendingImages) {
        try {
          const parsedImages = JSON.parse(savedPendingImages);
          console.log(`[EmergencyButton] Found ${parsedImages.length} pending images in localStorage`);
          setPendingImages(parsedImages);
        } catch (e) {
          console.error("[EmergencyButton] Error parsing saved pending images:", e);
        }
      } else {
        console.log(`[EmergencyButton] No pending images found in localStorage for project ${projectId}`);
      }
      
      setHasCheckedStorage(true);
    };
    
    checkForPendingImages();
    
    // Also check periodically in case the component was mounted before uploads finished
    const intervalId = setInterval(checkForPendingImages, 2000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [projectId]);

  // Save the gallery images
  const saveGalleryImages = async () => {
    console.log("[EmergencyButton] Save button clicked", pendingImages);
    
    if (pendingImages.length === 0) {
      console.log("[EmergencyButton] No pending images to save");
      
      // Check localStorage again in case state is out of sync
      const savedPendingImages = localStorage.getItem(`pendingImages_project_${projectId}`);
      if (savedPendingImages) {
        try {
          const parsedImages = JSON.parse(savedPendingImages);
          if (parsedImages.length > 0) {
            console.log(`[EmergencyButton] Found ${parsedImages.length} pending images in localStorage, trying to save them`);
            await saveImagesToGallery(parsedImages);
            return;
          }
        } catch (e) {
          console.error("[EmergencyButton] Error parsing saved pending images:", e);
        }
      }
      
      toast({
        title: "No images to save",
        description: "There are no new gallery images to save.",
      });
      return;
    }
    
    await saveImagesToGallery(pendingImages);
  };
  
  // Helper function to save images to gallery
  const saveImagesToGallery = async (images: Array<{url: string, caption?: string, displayOrder?: number}>) => {
    setIsLoading(true);
    
    try {
      console.log(`[EmergencyButton] Saving ${images.length} images to gallery for project ${projectId}`);
      
      // Save each image directly via fetch
      const savePromises = images.map((img, index) => {
        console.log(`[EmergencyButton] Saving image ${index + 1}/${images.length}:`, img.url);
        
        return fetch(`/api/projects/${projectId}/gallery`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: projectId,
            imageUrl: img.url,
            caption: img.caption || `Project image ${index + 1}`,
            displayOrder: img.displayOrder || index + 1
          })
        });
      });
      
      await Promise.all(savePromises);
      
      // Clear pending images from localStorage
      localStorage.removeItem(`pendingImages_project_${projectId}`);
      setPendingImages([]);
      
      toast({
        title: "Gallery images saved",
        description: `${images.length} images saved successfully.`,
      });
      
      // Refresh the page to show the updated gallery
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error("[EmergencyButton] Error saving gallery images:", error);
      toast({
        title: "Error",
        description: "Failed to save gallery images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasCheckedStorage) {
    return null; // Don't render anything until we've checked localStorage
  }

  return (
    <Button
      type="button"
      size="default"
      variant="default"
      className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 border-2 border-red-400 animate-pulse"
      onClick={saveGalleryImages}
      disabled={isLoading || pendingImages.length === 0}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Saving Images...
        </>
      ) : (
        <>
          <ImagePlus className="h-5 w-5 mr-2" />
          EMERGENCY: Save {pendingImages.length} Gallery Image{pendingImages.length !== 1 ? 's' : ''}
        </>
      )}
    </Button>
  );
};

export default EmergencyGallerySaveButton;