import { useState, useEffect } from 'react';
import { useUploadThing } from '@/lib/uploadthing';
import * as fileUtils from '@/lib/fileUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, FileIcon, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

/**
 * A component for uploading files to UploadThing
 */
interface FileUploadProps {
  /**
   * Maximum number of files allowed to be uploaded
   */
  maxFiles?: number;
  /**
   * Initial files to display (already uploaded)
   */
  initialFiles?: string[];
  /**
   * Function called when files are successfully uploaded
   * @param fileUrls Array of uploaded file URLs
   * @param sessionId Optional session ID used for tracking
   * @param fileNames Optional array of original file names
   */
  onUploadComplete?: (fileUrls: string | string[], sessionId?: string, fileNames?: string[]) => void;
  /**
   * Function called when a file is removed from the list
   */
  onFileRemoved?: (fileUrl: string) => void;
  /**
   * Function called when all files are removed
   */
  onAllFilesRemoved?: () => void;
  /**
   * Function called when an error occurs during upload
   */
  onError?: (error: Error) => void;
  /**
   * Label for the upload button
   */
  uploadLabel?: string;
  /**
   * Message to display when there are no files
   */
  emptyMessage?: string;
  /**
   * Whether to immediately upload files when they are added
   */
  autoUpload?: boolean;
  /**
   * Whether to allow multiple files to be selected
   */
  multiple?: boolean;
  /**
   * Whether to only accept image files
   */
  imagesOnly?: boolean;
  /**
   * Session ID for tracking files
   */
  sessionId?: string;
  /**
   * Maximum file size in MB
   */
  maxSizeMB?: number;
  /**
   * MIME types to accept (e.g., 'image/*')
   */
  accept?: string;
  /**
   * Button text for the upload button
   */
  buttonText?: string;
  /**
   * Help text to display below the upload button
   */
  helpText?: string;
  /**
   * Function called when a new session ID is created
   * @param sessionId The new session ID
   */
  onSessionIdCreated?: (sessionId: string) => void;
}

export default function FileUpload({
  maxFiles = 10,
  initialFiles = [],
  onUploadComplete,
  onFileRemoved,
  onAllFilesRemoved,
  onError,
  uploadLabel = 'Upload Files',
  emptyMessage = 'No files uploaded yet',
  autoUpload = true,
  multiple = true,
  imagesOnly = false,
  sessionId: externalSessionId,
  maxSizeMB = 8,
  accept,
  buttonText,
  helpText,
  onSessionIdCreated,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>(initialFiles || []);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  // Initialize sessionId from props or generate a new one
  const generatedSessionId = fileUtils.generateSessionId();
  const initialSessionId = externalSessionId || generatedSessionId;
  console.log(`[FileUpload] Initializing with sessionId: ${initialSessionId} (${externalSessionId ? 'from props' : 'newly generated'})`);
  const [sessionId, setSessionId] = useState<string>(initialSessionId);
  const { toast } = useToast();
  
  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (results) => {
      // Log the complete results for debugging
      console.log("Upload results:", results);
      
      // Results is an array of returned file URLs from UploadThing
      const uploadedUrls = results.map((result) => {
        // Log each result to debug
        console.log("Result item:", result);
        
        // IMPORTANT: Always prefer the new ufsUrl format
        const fileUrl = result.ufsUrl || result.url;
        console.log("URL to use:", fileUrl);
        
        return fileUrl;
      });
      
      console.log("Final URLs to display:", uploadedUrls);
      setFileUrls((prev) => [...prev, ...uploadedUrls]);
      setFiles([]);
      setUploadProgress(null);
      
      // Track uploaded files for cleanup if needed and collect original filenames
      const originalFilenames: string[] = [];
      
      uploadedUrls.forEach((url, index) => {
        // Get the original filename from the results
        const originalFilename = results[index]?.name || url.split('/').pop() || 'file';
        originalFilenames.push(originalFilename);
        fileUtils.trackFile(url, sessionId, originalFilename);
      });
      
      onUploadComplete?.(uploadedUrls, sessionId, originalFilenames);
      
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
      
      onError?.(error);
      setUploadProgress(null);
    },
  });
  
  // Set initial files if provided
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      setFileUrls(initialFiles);
    }
  }, [initialFiles]);
  
  // Call onSessionIdCreated when sessionId is updated or initialized
  useEffect(() => {
    if (sessionId && onSessionIdCreated) {
      console.log(`[FileUpload] Calling onSessionIdCreated with sessionId: ${sessionId}`);
      onSessionIdCreated(sessionId);
    } else {
      console.log(`[FileUpload] Not calling onSessionIdCreated: sessionId=${!!sessionId}, callback=${!!onSessionIdCreated}`);
    }
  }, [sessionId, onSessionIdCreated]);
  
  // Handle drag events
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
    if (fileUrls.length + fileList.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }
    
    // Convert FileList to array and add to files state
    const newFiles = Array.from(fileList);
    
    // Check file size if maxSizeMB is specified
    if (maxSizeMB) {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const oversizedFiles = newFiles.filter(file => file.size > maxSizeBytes);
      
      if (oversizedFiles.length > 0) {
        toast({
          title: "File size exceeds limit",
          description: `Maximum file size is ${maxSizeMB}MB. ${oversizedFiles.length} file(s) exceeded this limit.`,
          variant: "destructive",
        });
        
        // Filter out oversized files
        const sizedFiles = newFiles.filter(file => file.size <= maxSizeBytes);
        if (sizedFiles.length === 0) return; // All files were too large
        newFiles.length = 0;
        newFiles.push(...sizedFiles);
      }
    }
    
    // Filter by image type if required
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
    
    // Also handle custom accept types
    let finalFiles = filteredFiles;
    if (accept && !imagesOnly) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const acceptedFiles = filteredFiles.filter(file => {
        // Check if file type matches any of the accepted types
        return acceptedTypes.some(type => {
          if (type.includes('/*')) {
            // Handle wildcards like 'image/*'
            const category = type.split('/')[0];
            return file.type.startsWith(`${category}/`);
          }
          return file.type === type || 
                 // Handle extensions like '.pdf'
                 (type.startsWith('.') && file.name.toLowerCase().endsWith(type.toLowerCase()));
        });
      });
      
      if (acceptedFiles.length < filteredFiles.length) {
        toast({
          title: "Invalid file type",
          description: `Only ${accept} files are allowed`,
          variant: "destructive",
        });
      }
      
      finalFiles = acceptedFiles;
    }
    
    if (finalFiles.length === 0) return; // No valid files left
    
    setFiles(prev => [...prev, ...finalFiles]);
    
    // Auto upload if enabled
    if (autoUpload && finalFiles.length > 0) {
      startUpload(finalFiles);
    }
  };
  
  // Manual upload button handler
  const handleUpload = () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }
    
    startUpload(files);
  };
  
  // Remove a file from the list
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Remove an uploaded file URL
  const handleRemoveFileUrl = (fileUrl: string) => {
    setFileUrls(prev => prev.filter(url => url !== fileUrl));
    onFileRemoved?.(fileUrl);
    
    // If all files are removed, call the callback
    if (fileUrls.length === 1) {
      onAllFilesRemoved?.();
    }
  };
  
  return (
    <div className="w-full space-y-4">
      {/* Drop zone */}
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
          multiple={multiple}
          accept={accept || (imagesOnly ? 'image/*' : undefined)}
          onChange={handleFileChange}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-gray-500" />
          <p className="text-sm font-medium">
            {buttonText || 'Drag and drop files here, or click to browse'}
          </p>
          <p className="text-xs text-gray-500">
            {helpText || (imagesOnly ? 'Only image files are allowed' : 'All file types accepted')}
          </p>
          {maxFiles && maxSizeMB && (
            <p className="text-xs text-gray-500">
              Maximum {maxFiles} files, up to {maxSizeMB}MB each
            </p>
          )}
        </div>
      </div>
      
      {/* Files pending upload */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Files to upload ({files.length})</h3>
          <div className="space-y-2">
            {files.map((file, index) => (
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {!autoUpload && (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }} 
              disabled={isUploading}
              className="mt-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                uploadLabel
              )}
            </Button>
          )}
          
          {/* Upload progress */}
          {uploadProgress !== null && (
            <div className="w-full space-y-1">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-right">{Math.round(uploadProgress)}%</p>
            </div>
          )}
        </div>
      )}
      
      {/* Uploaded files */}
      {fileUrls.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded files ({fileUrls.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {fileUrls.map((url, index) => (
              <Card key={`${url}-${index}`} className="overflow-hidden">
                {fileUtils.isImageFile(url) ? (
                  <div className="aspect-video relative">
                    <img
                      src={url}
                      alt={`Uploaded file ${index + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => console.log("Image loaded successfully:", url)}
                      onError={(e) => {
                        console.error("Image failed to load:", url);
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z'%3E%3C/path%3E%3Ccircle cx='12' cy='13' r='3'%3E%3C/circle%3E%3C/svg%3E";
                      }}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveFileUrl(url)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base flex items-center">
                        <FileIcon className="h-4 w-4 mr-2" />
                        File {index + 1}
                      </CardTitle>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveFileUrl(url)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <CardDescription className="truncate text-xs">
                      {url.split('/').pop()}
                    </CardDescription>
                  </CardHeader>
                )}
                <CardFooter className="pt-2 pb-2">
                  <Badge variant="outline" className="text-xs">
                    {fileUtils.getFileExtension(url).toUpperCase()}
                  </Badge>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline ml-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        !isUploading && files.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">{emptyMessage}</p>
        )
      )}
    </div>
  );
}