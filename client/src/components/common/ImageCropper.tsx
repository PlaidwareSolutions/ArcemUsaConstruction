import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Crop, RotateCw, RotateCcw, ZoomIn, ZoomOut, Maximize, X } from 'lucide-react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Slider } from "@/components/ui/slider";

interface ImageCropperProps {
  imageUrl: string;
  aspectRatio?: number;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  aspectRatio = 16 / 9,
  onCropComplete,
  onCancel
}) => {
  const cropperRef = useRef<any>(null);
  const [zoom, setZoom] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  
  // Reset state when image URL changes
  useEffect(() => {
    setZoom(0);
    setRotation(0);
    setIsImageLoaded(false);
  }, [imageUrl]);
  
  const handleCrop = () => {
    if (!cropperRef.current || !cropperRef.current.cropper) {
      console.error("Cropper reference not available");
      return;
    }
    
    try {
      // Get the cropped canvas
      const croppedCanvas = cropperRef.current.cropper.getCroppedCanvas({
        minWidth: 256,
        minHeight: 256,
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      
      if (!croppedCanvas) {
        console.error("Failed to get cropped canvas");
        return;
      }
      
      // Convert canvas to blob
      croppedCanvas.toBlob((blob: Blob | null) => {
        if (!blob) {
          console.error('Canvas is empty or image is invalid');
          return;
        }
        
        // Create a File object from the blob
        const file = new File([blob], `cropped_image_${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        // Create a FileReader to read the file as a data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            // Pass the data URL to the parent component
            onCropComplete(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error("Error during crop operation:", error);
    }
  };
  
  const handleZoom = (value: number[]) => {
    try {
      if (!cropperRef.current || !cropperRef.current.cropper) {
        console.error("Cropper reference not available for zoom");
        return;
      }
      
      const newZoom = value[0];
      setZoom(newZoom);
      
      // Convert zoom scale from 0-100 to a reasonable zoom scale
      const zoomScale = 1 + (newZoom / 100);
      console.log("Zooming to:", zoomScale);
      cropperRef.current.cropper.zoomTo(zoomScale);
    } catch (error) {
      console.error("Error during zoom operation:", error);
    }
  };
  
  const handleRotate = (degrees: number) => {
    try {
      if (!cropperRef.current || !cropperRef.current.cropper) {
        console.error("Cropper reference not available for rotation");
        return;
      }
      
      console.log("Rotating by:", degrees);
      cropperRef.current.cropper.rotate(degrees);
      setRotation((prev) => prev + degrees);
    } catch (error) {
      console.error("Error during rotate operation:", error);
    }
  };
  
  const resetCropper = () => {
    try {
      if (!cropperRef.current || !cropperRef.current.cropper) {
        console.error("Cropper reference not available for reset");
        return;
      }
      
      console.log("Resetting cropper");
      cropperRef.current.cropper.reset();
      setZoom(0);
      setRotation(0);
    } catch (error) {
      console.error("Error during reset operation:", error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="my-4">
        <Cropper
          ref={cropperRef}
          src={imageUrl}
          style={{ height: 400, width: '100%' }}
          aspectRatio={aspectRatio}
          viewMode={1}
          guides={true}
          background={false}
          responsive={true}
          autoCropArea={0.8}
          checkOrientation={false}
          onInitialized={() => {
            console.log("Cropper initialized");
            setIsImageLoaded(true);
          }}
          className="cropper"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Zoom</label>
          <div className="flex items-center gap-2">
            <ZoomOut className="h-4 w-4" />
            <Slider
              value={[zoom]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => {
                console.log("Zoom slider value:", value);
                handleZoom(value);
              }}
              className="flex-1"
              disabled={!isImageLoaded}
            />
            <ZoomIn className="h-4 w-4" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Rotation</label>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                handleRotate(-90);
              }}
              disabled={!isImageLoaded}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <span className="mx-2 text-sm">{rotation}°</span>
            <Button 
              variant="outline" 
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                handleRotate(90);
              }}
              disabled={!isImageLoaded}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={(e) => {
                e.preventDefault();
                resetCropper();
              }}
              disabled={!isImageLoaded}
            >
              <Maximize className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-6">
        <Button 
          variant="outline" 
          onClick={(e) => {
            e.preventDefault();
            onCancel();
          }} 
          className="gap-1.5"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button 
          onClick={(e) => {
            e.preventDefault();
            handleCrop();
          }} 
          className="gap-1.5" 
          disabled={!isImageLoaded}
        >
          <Crop className="h-4 w-4" />
          Apply Crop
        </Button>
      </div>
    </div>
  );
};

export default ImageCropper;