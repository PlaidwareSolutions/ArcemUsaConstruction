import React, { useState, useCallback, useEffect } from 'react';
import { useUploadThing } from '@/lib/uploadthing';
import { useToast } from '@/hooks/use-toast';
import * as fileUtils from '@/lib/fileUtils';
import { 
  UploadCloud, 
  X, 
  Loader2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface UploadFileResponse {
  name: string;
  size: number;
  key: string;
  url: string;
  ufsUrl?: string;
  serverData?: Record<string, unknown>;
}

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  caption: string;
  displayOrder: number;
  isFeature: boolean;
}

interface UploadThingDropzoneProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  sessionId: string;
  existingFiles?: UploadedFile[];
  maxFiles?: number;
}

export default function UploadThingDropzone({ 
  onFilesUploaded, 
  sessionId, 
  existingFiles = [],
  maxFiles = 10 
}: UploadThingDropzoneProps) {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(existingFiles);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Calculate remaining slots
  const remainingSlots = maxFiles - uploadedFiles.length;
  const canUploadMore = remainingSlots > 0;

  // useUploadThing hook from the uploadthing library
  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (files) => {
      if (!files || files.length === 0) return;
      
      console.log('Upload complete:', files);
      
      // Create UploadedFile objects from the response
      const newFiles = files.map((file, index) => {
        // Always use ufsUrl when available to avoid deprecation warnings
        const fileUrl = file.ufsUrl || file.url;
        
        return {
          url: fileUrl,
          name: file.name,
          size: file.size,
          caption: `Project image ${uploadedFiles.length + index + 1}`,
          displayOrder: uploadedFiles.length + index + 1,
          isFeature: uploadedFiles.length === 0 && index === 0 // First image is feature by default
        };
      });

      // Update the local state with the new files
      setUploadedFiles(prev => {
        const updated = [...prev, ...newFiles];
        return updated;
      });
      
      // Call the parent component callback
      onFilesUploaded([...uploadedFiles, ...newFiles]);
      
      setUploadProgress(0);
      toast({
        title: 'Upload complete',
        description: `Successfully uploaded ${files.length} file${files.length > 1 ? 's' : ''}.`,
      });
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      setUploadProgress(0);
      toast({
        title: 'Upload failed',
        description: error.message || 'An error occurred during upload.',
        variant: 'destructive',
      });
    },
    onUploadBegin: () => {
      console.log('Upload starting...');
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    }
  });

  // File input change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const filesToUpload = Array.from(e.target.files);
    if (filesToUpload.length > remainingSlots) {
      toast({
        title: 'Too many files',
        description: `You can only upload ${remainingSlots} more file${remainingSlots !== 1 ? 's' : ''}.`,
        variant: 'destructive',
      });
      return;
    }

    uploadFiles(filesToUpload);
  };

  // Drag handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!canUploadMore) {
      toast({
        title: 'Maximum files reached',
        description: `You can upload a maximum of ${maxFiles} files.`,
        variant: 'destructive',
      });
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesToUpload = Array.from(e.dataTransfer.files);
      if (filesToUpload.length > remainingSlots) {
        toast({
          title: 'Too many files',
          description: `You can only upload ${remainingSlots} more file${remainingSlots !== 1 ? 's' : ''}.`,
          variant: 'destructive',
        });
        return;
      }

      uploadFiles(filesToUpload);
    }
  }, [canUploadMore, maxFiles, remainingSlots, toast]);

  // Function to upload files using UploadThing
  const uploadFiles = async (files: File[]) => {
    try {
      // Filter only image files
      const imageFiles = files.filter(file => 
        file.type.startsWith('image/') && 
        ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)
      );

      if (imageFiles.length === 0) {
        toast({
          title: 'Invalid files',
          description: 'Please upload only image files (JPEG, PNG, WebP, GIF).',
          variant: 'destructive',
        });
        return;
      }

      if (imageFiles.length > remainingSlots) {
        imageFiles.splice(remainingSlots);
        toast({
          title: 'Some files skipped',
          description: `Only uploaded ${remainingSlots} file(s) to stay within the limit.`,
        });
      }

      // Start the upload - UploadThing expects no metadata in this version
      await startUpload(imageFiles);
    } catch (error) {
      console.error('Error starting upload:', error);
      toast({
        title: 'Upload error',
        description: 'Failed to start file upload. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Remove a file from the list
  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const updated = [...prev];
      const removed = updated.splice(index, 1)[0];
      
      // If we're removing the feature image, assign a new one if possible
      if (removed.isFeature && updated.length > 0) {
        updated[0].isFeature = true;
      }
      
      // Re-order the remaining files
      updated.forEach((file, idx) => {
        file.displayOrder = idx + 1;
      });
      
      // Notify parent of change
      onFilesUploaded(updated);
      
      return updated;
    });
  };

  // Set a file as the feature image
  const setAsFeature = (index: number) => {
    setUploadedFiles(prev => {
      const updated = prev.map((file, idx) => ({
        ...file,
        isFeature: idx === index
      }));
      
      // Notify parent of change
      onFilesUploaded(updated);
      
      return updated;
    });
    
    toast({
      title: 'Feature image set',
      description: 'Feature image has been updated.',
    });
  };

  // Update a file's caption
  const updateCaption = (index: number, caption: string) => {
    setUploadedFiles(prev => {
      const updated = [...prev];
      updated[index].caption = caption;
      
      // Notify parent of change
      onFilesUploaded(updated);
      
      return updated;
    });
  };

  // Define permitted file types
  const fileTypesString = 'images (jpg, png, webp, gif)';

  return (
    <div className="w-full space-y-4">
      {/* Dropzone */}
      {canUploadMore && (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:bg-muted/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="p-3 rounded-full bg-primary/10">
              <UploadCloud className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-medium">
              Drag & drop files here
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Upload up to {remainingSlots} more image{remainingSlots !== 1 ? 's' : ''}
              <br />
              Accepted formats: {fileTypesString}
            </p>
            <Button 
              type="button" 
              variant="secondary" 
              size="sm"
              disabled={isUploading}
              className="relative"
            >
              {isUploading ? 'Uploading...' : 'Browse files'}
              <input
                type="file"
                multiple
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </Button>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Uploading...</span>
            <span className="text-sm">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Uploaded files grid */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">
            Uploaded images ({uploadedFiles.length}/{maxFiles})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file, index) => (
              <div 
                key={`${file.url}-${index}`} 
                className={`relative group border rounded-lg overflow-hidden ${
                  file.isFeature ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <div className="relative aspect-video bg-muted">
                  <img 
                    src={file.url} 
                    alt={file.caption}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Feature image badge */}
                  {file.isFeature && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 left-2 bg-yellow-400 text-yellow-950"
                    >
                      <Star className="h-3 w-3 mr-1 fill-yellow-950" />
                      Feature
                    </Badge>
                  )}
                  
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!file.isFeature && (
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => setAsFeature(index)}
                        title="Set as feature image"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => removeFile(index)}
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Caption input */}
                <div className="p-3">
                  <Input
                    value={file.caption}
                    onChange={(e) => updateCaption(index, e.target.value)}
                    placeholder="Image caption"
                    className="text-sm"
                  />
                  <div className="mt-1 text-xs text-muted-foreground flex justify-between">
                    <span>Order: {file.displayOrder}</span>
                    <span>{fileUtils.formatFileSize(file.size)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* No file state */}
      {uploadedFiles.length === 0 && !isUploading && (
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">No images uploaded yet. Images will appear here.</p>
        </div>
      )}
    </div>
  );
}