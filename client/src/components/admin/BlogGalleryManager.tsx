import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useBlog } from '@/hooks/useBlog';
import { BlogGallery } from '@shared/schema';
import { Trash2, Upload, Image, Loader2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import UploadThingFileUpload from '@/components/common/UploadThingFileUpload';

interface BlogGalleryManagerProps {
  postId: number;
}

const BlogGalleryManager: React.FC<BlogGalleryManagerProps> = ({ postId }) => {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [captionInput, setCaptionInput] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploadSession, setUploadSession] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isCommitted, setIsCommitted] = useState(false);

  const {
    galleryImages,
    isLoadingGallery,
    addGalleryImage,
    deleteGalleryImage,
    isAddingGalleryImage,
    isDeletingGalleryImage,
    uploadFile,
    commitUploads,
    cleanupUploads,
  } = useBlog(postId);

  // Handle component unmount - clean up any uncommitted files
  useEffect(() => {
    return () => {
      console.log(`[BlogGalleryManager] Component unmounting, cleaning up uncommitted files.`);
      console.log(`[BlogGalleryManager] Cleanup state: uploadSession=${uploadSession}, isCommitted=${isCommitted}, files=${uploadedFiles.length}`);
      cleanupUncommittedFiles();
    };
  }, [uploadSession, isCommitted, uploadedFiles, cleanupUploads]);

  // Clean up uncommitted files when dialog is closed without saving
  useEffect(() => {
    if (!isAddDialogOpen && uploadSession && !isCommitted && uploadedFiles.length > 0) {
      console.log(`[BlogGalleryManager] Dialog closed without committing, cleaning up files.`);
      console.log(`[BlogGalleryManager] Cleanup state: uploadSession=${uploadSession}, files=${uploadedFiles.length}`);
      cleanupUncommittedFiles();
    }
  }, [isAddDialogOpen, uploadSession, isCommitted, uploadedFiles, cleanupUploads]);

  const cleanupUncommittedFiles = async () => {
    console.log(`[BlogGalleryManager] cleanupUncommittedFiles called with state:`, {
      hasUploadSession: !!uploadSession,
      sessionId: uploadSession,
      isCommitted,
      uploadedFilesCount: uploadedFiles.length,
      uploadedFiles
    });
    
    if (uploadSession && !isCommitted && uploadedFiles.length > 0) {
      try {
        // Get all existing gallery image URLs to preserve
        const existingImageUrls: string[] = Array.isArray(galleryImages)
          ? galleryImages.map((img: BlogGallery) => img.imageUrl).filter(Boolean)
          : [];
          
        console.log(`[BlogGalleryManager] Cleaning up uncommitted files for session ${uploadSession}`);
        console.log(`[BlogGalleryManager] Files to clean up:`, uploadedFiles);
        console.log(`[BlogGalleryManager] Preserving ${existingImageUrls.length} existing gallery images:`, existingImageUrls);
        
        // Call cleanupUploads with existing gallery URLs to preserve
        const success = await cleanupUploads(uploadSession, existingImageUrls);
        
        if (success) {
          console.log('[BlogGalleryManager] Successfully cleaned up uncommitted files');
          setUploadedFiles([]);
        } else {
          console.log('[BlogGalleryManager] Failed to clean up uncommitted files');
        }
      } catch (err) {
        console.error('[BlogGalleryManager] Error cleaning up files:', err);
      }
    } else {
      console.log(`[BlogGalleryManager] Skipping cleanup - conditions not met: hasSession=${!!uploadSession}, isCommitted=${isCommitted}, filesCount=${uploadedFiles.length}`);
    }
  };

  const handleFileUploadComplete = async (fileUrl: string | string[], sessionId?: string) => {
    try {
      console.log(`[BlogGalleryManager] handleFileUploadComplete called with:`, 
        { fileUrlType: typeof fileUrl, isArray: Array.isArray(fileUrl), count: Array.isArray(fileUrl) ? fileUrl.length : 1 });
      console.log(`[BlogGalleryManager] Session ID from upload:`, sessionId);
      console.log(`[BlogGalleryManager] Current upload session:`, uploadSession);
      
      if (sessionId) {
        console.log(`[BlogGalleryManager] Setting new upload session:`, sessionId);
        setUploadSession(sessionId);
      }
      
      setIsCommitted(false);
      
      // Store the current session ID to use for commitment
      const currentSessionId = sessionId || uploadSession;
      console.log(`[BlogGalleryManager] Using session ID for commitment:`, currentSessionId);
      
      if (typeof fileUrl === 'string') {
        console.log(`[BlogGalleryManager] Processing single file URL:`, fileUrl);
        // Track for potential cleanup
        setUploadedFiles([fileUrl]);
        
        // Single file upload
        console.log(`[BlogGalleryManager] Adding gallery image to database:`, { url: fileUrl, caption: captionInput });
        await addGalleryImage(fileUrl, captionInput || null);
        
        // Commit the file
        console.log(`[BlogGalleryManager] Committing file with session:`, currentSessionId);
        const commitResult = await commitUploads(currentSessionId, [fileUrl]);
        console.log(`[BlogGalleryManager] Commit result:`, commitResult);
        
        // Mark as committed
        setIsCommitted(true);
      } else if (Array.isArray(fileUrl) && fileUrl.length > 0) {
        console.log(`[BlogGalleryManager] Processing ${fileUrl.length} files:`, fileUrl);
        // Track for potential cleanup
        setUploadedFiles(fileUrl);
        
        // Multiple files upload - process each file
        for (const url of fileUrl) {
          console.log(`[BlogGalleryManager] Adding gallery image to database:`, { url, caption: captionInput });
          await addGalleryImage(url, captionInput || null);
        }
        
        // Commit all files
        console.log(`[BlogGalleryManager] Committing files with session:`, currentSessionId);
        const commitResult = await commitUploads(currentSessionId, fileUrl);
        console.log(`[BlogGalleryManager] Commit result:`, commitResult);
        
        // Mark as committed
        setIsCommitted(true);
      }
      
      setCaptionInput('');
      setIsAddDialogOpen(false);
      console.log(`[BlogGalleryManager] Upload process completed successfully`);
    } catch (error) {
      console.error('[BlogGalleryManager] Error adding gallery image(s):', error);
      // Clean up files on error
      cleanupUncommittedFiles();
    }
  };

  const handleDeleteImage = async () => {
    if (selectedImageId !== null) {
      try {
        await deleteGalleryImage(selectedImageId);
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error('Error deleting gallery image:', error);
      }
    }
  };

  const confirmDelete = (imageId: number) => {
    setSelectedImageId(imageId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Blog Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Blog Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Image caption (optional)"
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
              />
              <UploadThingFileUpload 
                onUploadComplete={(files) => {
                  console.log("[BlogGalleryManager] Files from UploadThingFileUpload:", files);
                  if (files && files.length > 0) {
                    const fileUrls = files.map(file => file.fileUrl);
                    handleFileUploadComplete(fileUrls);
                  }
                }}
                uploadType="imageUploader"
                maxFiles={1}
                maxFileSize={16}
                allowedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
              />
            </div>
            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button variant="secondary" type="button">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingGallery ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !galleryImages || !Array.isArray(galleryImages) || galleryImages.length === 0 ? (
        <div className="text-center py-4 border border-dashed rounded-md">
          <Image className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No blog images yet</p>
          <Button 
            variant="link" 
            className="mt-1 text-sm"
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add blog image
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {Array.isArray(galleryImages) && galleryImages.map((image: BlogGallery) => (
            <Card key={image.id} className="overflow-hidden group relative">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img 
                    src={image.imageUrl} 
                    alt={image.caption || `Blog image ${image.id}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => confirmDelete(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {image.caption && (
                  <div className="p-1 text-xs truncate">{image.caption}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Blog Image</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this blog image? This action cannot be undone.</p>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeletingGalleryImage}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteImage}
              disabled={isDeletingGalleryImage}
            >
              {isDeletingGalleryImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogGalleryManager;