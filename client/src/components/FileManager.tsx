import { useState, useEffect } from 'react';
import { useUploadThing } from '@/lib/uploadthing';
import * as fileUtils from '@/lib/fileUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusIcon, TrashIcon, ExternalLinkIcon, FileIcon, ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileManagerProps {
  /**
   * Array of file URLs
   */
  value: string[];
  /**
   * Callback when files change
   */
  onChange: (files: string[]) => void;
  /**
   * Maximum number of files allowed
   */
  maxFiles?: number;
  /**
   * Title for the file manager
   */
  title?: string;
  /**
   * Description for the file manager
   */
  description?: string;
  /**
   * Show thumbnails for image files
   */
  showThumbnails?: boolean;
  /**
   * Display files in a grid layout
   */
  gridLayout?: boolean;
  /**
   * Allow only image files
   */
  imagesOnly?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export default function FileManager({
  value = [],
  onChange,
  maxFiles = 10,
  title = 'Manage Files',
  description = 'Upload and manage your files',
  showThumbnails = true,
  gridLayout = true,
  imagesOnly = false,
  className,
}: FileManagerProps) {
  const [files, setFiles] = useState<string[]>(value);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [sessionId] = useState<string>(fileUtils.generateSessionId());
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  
  const { toast } = useToast();
  
  // Set up upload thing hook
  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (results) => {
      // Process upload results
      const uploadedUrls = results.map((result) => result.ufsUrl || result.url); // Prefer ufsUrl, fallback to url for compatibility
      
      // Track uploaded files for cleanup if needed
      uploadedUrls.forEach(url => {
        fileUtils.trackFile(url, sessionId);
      });
      
      // Add new files to state
      setFiles(prev => [...prev, ...uploadedUrls]);
      
      // Call onChange with new files
      onChange([...files, ...uploadedUrls]);
      
      // Reset upload state
      setPendingFiles([]);
      setUploadProgress(null);
      setUploadDialogOpen(false);
      
      toast({
        title: "Files uploaded successfully",
        description: `${uploadedUrls.length} file(s) uploaded successfully.`,
      });
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onUploadError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong during upload",
        variant: "destructive",
      });
      
      setUploadProgress(null);
    },
  });
  
  // Sync files when value prop changes
  useEffect(() => {
    setFiles(value);
  }, [value]);
  
  // Handle drag and drop events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  // Process selected files
  const handleFiles = (fileList: FileList) => {
    // Check if we've exceeded maximum files
    if (files.length + fileList.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }
    
    // Convert FileList to array and filter by type if needed
    const newFiles = Array.from(fileList);
    const filteredFiles = imagesOnly 
      ? newFiles.filter(file => file.type.startsWith('image/'))
      : newFiles;
    
    if (imagesOnly && filteredFiles.length < newFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Only image files are allowed",
        variant: "destructive",
      });
    }
    
    setPendingFiles(filteredFiles);
  };
  
  // Upload selected files
  const uploadFiles = () => {
    if (pendingFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }
    
    startUpload(pendingFiles);
  };
  
  // Remove a file
  const removeFile = (fileUrl: string) => {
    const newFiles = files.filter(f => f !== fileUrl);
    setFiles(newFiles);
    onChange(newFiles);
    
    toast({
      title: "File removed",
      description: "The file has been removed",
    });
  };
  
  // Preview a file
  const previewFileHandler = (fileUrl: string) => {
    setPreviewFile(fileUrl);
    setPreviewDialogOpen(true);
  };
  
  // Render a file item
  const renderFileItem = (file: string, index: number) => {
    const isImage = fileUtils.isImageFile(file);
    const fileName = file.split('/').pop() || 'File';
    const fileExt = fileUtils.getFileExtension(file).toUpperCase();
    
    return (
      <Card key={`${file}-${index}`} className="overflow-hidden">
        {showThumbnails && isImage ? (
          <div 
            className="aspect-square relative cursor-pointer" 
            onClick={() => previewFileHandler(file)}
          >
            <img
              src={file}
              alt={fileName}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Image failed to load:", file);
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z'%3E%3C/path%3E%3Ccircle cx='12' cy='13' r='3'%3E%3C/circle%3E%3C/svg%3E";
              }}
            />
          </div>
        ) : (
          <CardHeader className="p-4">
            <CardTitle className="text-sm flex items-center">
              {isImage ? (
                <ImageIcon className="h-4 w-4 mr-2" />
              ) : (
                <FileIcon className="h-4 w-4 mr-2" />
              )}
              <span className="truncate">{fileName}</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardFooter className="p-2 flex justify-between bg-gray-50">
          <span className="text-xs text-gray-500">{fileExt}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => window.open(file, '_blank')}
            >
              <ExternalLinkIcon className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={() => removeFile(file)}
            >
              <TrashIcon className="h-3 w-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <Button 
          onClick={() => setUploadDialogOpen(true)} 
          disabled={files.length >= maxFiles}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Files
        </Button>
      </div>
      
      {/* File Grid/List */}
      {files.length > 0 ? (
        <div className={gridLayout ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}>
          {files.map((file, index) => renderFileItem(file, index))}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <p className="text-gray-500">No files added yet</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => setUploadDialogOpen(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Files
          </Button>
        </div>
      )}
      
      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              {imagesOnly 
                ? 'Select or drag and drop image files to upload.' 
                : 'Select or drag and drop files to upload.'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Drop area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary/50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input
              id="fileInput"
              type="file"
              className="hidden"
              multiple
              accept={imagesOnly ? 'image/*' : undefined}
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center justify-center space-y-2">
              <PlusIcon className="h-8 w-8 text-gray-500" />
              <p className="text-sm font-medium">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                {imagesOnly ? 'Only image files are allowed' : 'All file types accepted'}
              </p>
              {maxFiles && (
                <p className="text-xs text-gray-500">
                  Maximum {maxFiles} files (you have {files.length})
                </p>
              )}
            </div>
          </div>
          
          {/* Files to upload */}
          {pendingFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Selected files ({pendingFiles.length})</h4>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {pendingFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center space-x-2">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4 text-gray-500" />
                        ) : (
                          <FileIcon className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-gray-500">{fileUtils.formatFileSize(file.size)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setPendingFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* Upload progress */}
          {uploadProgress !== null && (
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-right mt-1">{Math.round(uploadProgress)}%</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={uploadFiles} 
              disabled={pendingFiles.length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>File Preview</DialogTitle>
          </DialogHeader>
          
          {previewFile && (
            fileUtils.isImageFile(previewFile) ? (
              <div className="w-full overflow-hidden rounded-md">
                <img 
                  src={previewFile} 
                  alt="Preview" 
                  className="w-full h-auto object-contain max-h-[60vh]"
                />
              </div>
            ) : (
              <div className="text-center p-8">
                <FileIcon className="h-16 w-16 mx-auto text-gray-400" />
                <p className="mt-4">
                  This file type cannot be previewed.{' '}
                  <a 
                    href={previewFile} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open in new tab
                  </a>
                </p>
              </div>
            )
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (previewFile) {
                  window.open(previewFile, '_blank');
                }
              }}
            >
              Open in New Tab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}