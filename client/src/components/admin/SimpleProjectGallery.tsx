import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useUploadThing } from '@/lib/uploadthing';
import {
  ImagePlus,
  Loader2,
  Star,
  StarIcon,
  Trash2,
  UploadCloud,
  X,
  PencilLine
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { ProjectGallery } from '@shared/schema';

interface SimpleProjectGalleryProps {
  projectId?: number;
  existingImages: Array<{
    id?: number;
    imageUrl: string;
    caption?: string;
    displayOrder?: number;
    isFeature?: boolean;
  }>;
  newImages: Array<{
    imageUrl: string;
    caption?: string;
    displayOrder?: number;
    isFeature?: boolean;
  }>;
  onImagesUploaded: (images: Array<{ url: string }>) => void;
  onGalleryChange: (gallery: any[]) => void;
  onSetAsFeature: (imageUrl: string) => void;
  onDeleteImage: (imageId: number | undefined, imageUrl: string) => void;
}

const SimpleProjectGallery: React.FC<SimpleProjectGalleryProps> = ({
  projectId,
  existingImages,
  newImages,
  onImagesUploaded,
  onGalleryChange,
  onSetAsFeature,
  onDeleteImage
}) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingCaption, setEditingCaption] = useState<{ id?: number, url: string, caption: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id?: number, url: string } | null>(null);

  // Get all images (existing + new uploads) ensuring type consistency
  const allImages: Array<{
    id?: number;
    imageUrl: string;
    caption?: string;
    displayOrder?: number;
    isFeature?: boolean;
  }> = [
    ...existingImages,
    ...newImages.map(img => ({
      ...img,
      id: undefined // Explicitly add undefined id to new images
    }))
  ];

  // UploadThing setup
  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (!res || res.length === 0) return;
      
      console.log('Upload complete:', res);
      
      // Process the response to use only the ufsUrl
      const uploadedImages = res.map(file => ({
        url: file.ufsUrl || ''
      }));
      
      // Clear selected files
      setSelectedFiles([]);
      
      // Notify parent component
      onImagesUploaded(uploadedImages);
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'There was an error uploading your images.',
        variant: 'destructive'
      });
    },
    onUploadBegin: () => {
      console.log('Upload starting...');
    },
  });

  // File input change handler
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;
    
    const files = Array.from(fileList);
    
    // Validate files (size, type, etc.)
    const validFiles = files.filter(file => {
      // Check file type (only images)
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not an image file.`,
          variant: 'destructive'
        });
        return false;
      }
      
      // Check file size (max 16MB)
      if (file.size > 15 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the 16MB size limit.`,
          variant: 'destructive'
        });
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    setSelectedFiles(validFiles);
    startUpload(validFiles);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    
    // Validate files (size, type, etc.)
    const validFiles = files.filter(file => {
      // Check file type (only images)
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not an image file.`,
          variant: 'destructive'
        });
        return false;
      }
      
      // Check file size (max 16MB)
      if (file.size > 15 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the 16MB size limit.`,
          variant: 'destructive'
        });
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    setSelectedFiles(validFiles);
    startUpload(validFiles);
  };

  // Set feature image
  const handleSetFeatureImage = (imageUrl: string) => {
    onSetAsFeature(imageUrl);
  };

  // Delete image
  const handleDeleteImageClick = (id: number | undefined, imageUrl: string) => {
    setConfirmDelete({ id, url: imageUrl });
  };

  // Confirm deletion
  const confirmDeleteImage = () => {
    if (!confirmDelete) return;
    
    onDeleteImage(confirmDelete.id, confirmDelete.url);
    setConfirmDelete(null);
    
    toast({
      title: 'Image deleted',
      description: 'The image has been removed from the gallery.'
    });
  };

  // Edit caption
  const handleEditCaption = (id: number | undefined, imageUrl: string, caption: string = '') => {
    setEditingCaption({ id, url: imageUrl, caption });
  };

  // Save caption
  const handleSaveCaption = () => {
    if (!editingCaption) return;
    
    const { id, url, caption } = editingCaption;
    
    // Update existing images
    if (id) {
      const updatedGallery = existingImages.map(img => 
        img.id === id ? { ...img, caption } : img
      );
      onGalleryChange(updatedGallery);
    } else {
      // Update new uploads
      const updatedNewImages = newImages.map(img => 
        img.imageUrl === url ? { ...img, caption } : img
      );
      onGalleryChange([...existingImages, ...updatedNewImages]);
    }
    
    setEditingCaption(null);
    
    toast({
      title: 'Caption updated',
      description: 'The image caption has been updated.'
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-3 rounded-full bg-primary/10">
            <UploadCloud className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              Drag & drop files here, or click to browse
            </h3>
            <p className="text-sm text-muted-foreground">
              Upload images (JPG, PNG, WebP) up to 16MB each
            </p>
          </div>
          
          <label className="cursor-pointer">
            <Button 
              type="button" 
              variant="outline"
              disabled={isUploading}
              className="relative"
            >
              {isUploading ? "Uploading..." : "Select Images"}
              <input
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
                multiple={true}
                disabled={isUploading}
              />
            </Button>
          </label>
        </div>
      </div>
      
      {/* Upload progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <Loader2 className="animate-spin h-4 w-4 mr-2 text-primary" />
            <span className="text-sm font-medium">Uploading...</span>
          </div>
          <Progress value={45} className="h-2" />
        </div>
      )}
      
      {/* Gallery display */}
      {allImages.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium mb-4">Project Gallery ({allImages.length} images)</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allImages.map((image, index) => (
              <Card key={image.id ? `existing-${image.id}` : `new-${image.imageUrl}`} className="overflow-hidden">
                <div className="relative aspect-video">
                  <img 
                    src={image.imageUrl} 
                    alt={image.caption || `Project image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Feature icon */}
                  {image.isFeature && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white p-1 rounded-full">
                      <Star className="h-4 w-4" />
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      variant="gold"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      title={image.isFeature ? "This is the feature image" : "Set as feature image"}
                      onClick={() => handleSetFeatureImage(image.imageUrl)}
                    >
                      <StarIcon className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="gold"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600"
                      title="Edit caption"
                      onClick={() => handleEditCaption(image.id, image.imageUrl, image.caption)}
                    >
                      <PencilLine className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white"
                      title="Delete image"
                      onClick={() => handleDeleteImageClick(image.id, image.imageUrl)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-3">
                  <p className="text-sm truncate">
                    {image.caption || `Project image ${index + 1}`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Edit caption dialog */}
      <Dialog open={!!editingCaption} onOpenChange={(open) => !open && setEditingCaption(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image Caption</DialogTitle>
          </DialogHeader>
          
          {editingCaption && (
            <>
              <div className="space-y-4 py-4">
                <div className="aspect-video w-full overflow-hidden rounded-md">
                  <img 
                    src={editingCaption.url} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Input 
                    id="caption" 
                    value={editingCaption.caption} 
                    onChange={(e) => setEditingCaption({...editingCaption, caption: e.target.value})}
                    placeholder="Enter image caption"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingCaption(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCaption}>
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Are you sure you want to delete this image?</p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
            
            {confirmDelete && (
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-md">
                <img 
                  src={confirmDelete.url} 
                  alt="Image to delete" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteImage}>
              Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SimpleProjectGallery;