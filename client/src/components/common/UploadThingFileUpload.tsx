import { useCallback, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, XCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { OurFileRouter } from "@shared/uploadthing";

// Define the types required for the component
interface UploadFileResponse {
  url: string;
  ufsUrl?: string; // New URL format from UploadThing
  key: string;
  name: string;
  size: number;
}

interface UploadThingError extends Error {
  code?: string;
  data?: Record<string, any>;
}

interface UploadThingFileUploadProps {
  endpoint: "imageUploader";
  onClientUploadComplete?: (files: UploadFileResponse[]) => void;
  onUploadError?: (error: UploadThingError) => void;
  onUploadBegin?: () => void;
  buttonText?: string;
  helpText?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
}

export default function UploadThingFileUpload({
  endpoint,
  onClientUploadComplete,
  onUploadError,
  onUploadBegin,
  buttonText = "Upload files",
  helpText = "Upload images (JPG, PNG) up to 8MB each",
  accept = "image/jpeg, image/png, image/webp",
  multiple = true,
  maxSizeMB = 8
}: UploadThingFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileSelectionError, setFileSelectionError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Convert the maxSizeMB to bytes for file validation
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Use the UploadThing hook
  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (files) => {
      if (!files || files.length === 0) return;
      
      // Add logging to debug
      console.log('UploadThing complete, files:', files);
      
      // Process files to use ONLY the new ufsUrl format to avoid triggering deprecation warnings
      const processedFiles = files.map(file => {
        // Create a new object with only the properties we need
        const processedFile = {
          name: file.name,
          size: file.size,
          key: file.key,
          // Use ONLY ufsUrl to avoid accessing deprecated properties
          url: file.ufsUrl || '', 
          serverData: file.serverData
        };
        
        // Log file details for debugging without accessing deprecated properties
        console.log('📁 File details:', {
          name: processedFile.name,
          size: (processedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
          key: processedFile.key,
          url: processedFile.url?.substring(0, 50) + '...' // Truncated for log readability
        });
        
        return processedFile;
      });
      
      if (onClientUploadComplete) {
        onClientUploadComplete(processedFiles);
      }
      
      setSelectedFiles([]);
      setErrorMessage(null);
      toast({
        title: "Upload complete",
        description: `Successfully uploaded ${files.length} file${files.length !== 1 ? "s" : ""}.`,
      });
    },
    onUploadError: (error) => {
      setErrorMessage(error.message);
      if (onUploadError) {
        // Type assertion to make TypeScript happy
        onUploadError(error as UploadThingError);
      }
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload.",
        variant: "destructive",
      });
    },
    onUploadBegin: () => {
      if (onUploadBegin) {
        onUploadBegin();
      }
      setErrorMessage(null);
    },
  });

  // Validate selected files
  const validateFiles = useCallback((files: File[]): File[] => {
    setFileSelectionError(null);

    // Filter files based on type and size
    const validFiles = Array.from(files).filter((file) => {
      // Check file type
      const fileType = file.type.toLowerCase();
      const acceptTypes = accept.split(',').map(type => type.trim().toLowerCase());
      const isValidType = acceptTypes.some(type => {
        // Handle wildcards like "image/*"
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return fileType.startsWith(`${category}/`);
        }
        return type === fileType;
      });

      if (!isValidType) {
        setFileSelectionError(`File type not supported: ${file.name}`);
        return false;
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        setFileSelectionError(`File too large: ${file.name} (max ${maxSizeMB}MB)`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0 && files.length > 0) {
      setFileSelectionError("No valid files were selected");
    }

    return validFiles;
  }, [accept, maxSizeBytes, maxSizeMB]);

  // Handle file selection - now immediately prepares files for project saving
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const filesArray = Array.from(fileList);
    const validFiles = validateFiles(filesArray);
    
    // Set the selected files for display and tracking
    setSelectedFiles(validFiles);
    
    // We need to upload the files to UploadThing immediately to get real URLs
    if (validFiles.length > 0) {
      // Notify user that upload is starting
      toast({
        title: 'Uploading files',
        description: `Starting upload of ${validFiles.length} file${validFiles.length === 1 ? '' : 's'}...`,
      });
      
      // Start the actual upload to UploadThing
      if (onUploadBegin) {
        onUploadBegin();
      }
      
      // Now upload files to get real URLs
      startUpload(validFiles);
      
      // The onClientUploadComplete callback will be triggered by the useUploadThing hook
      // once the upload completes, with actual server URLs
    }
  }, [validateFiles, onUploadBegin, startUpload, toast]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const files: File[] = [];

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
    } else {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        files.push(e.dataTransfer.files[i]);
      }
    }

    const validFiles = validateFiles(files);
    setSelectedFiles(validFiles);
    
    // We need to upload the files to UploadThing immediately to get real URLs
    if (validFiles.length > 0) {
      // Notify user that upload is starting
      toast({
        title: 'Uploading files',
        description: `Starting upload of ${validFiles.length} file${validFiles.length === 1 ? '' : 's'}...`,
      });
      
      // Start the actual upload to UploadThing
      if (onUploadBegin) {
        onUploadBegin();
      }
      
      // Now upload files to get real URLs
      startUpload(validFiles);
      
      // The onClientUploadComplete callback will be triggered by the useUploadThing hook
      // once the upload completes, with actual server URLs
    }
  }, [validateFiles, onUploadBegin, startUpload, toast]);

  // We no longer need a separate upload button click handler
  // as files are now automatically processed when the parent form is submitted

  // Define allowed file types for display
  const allowedFileTypes = accept.split(',').map(type => type.trim());
  const formattedFileTypes = allowedFileTypes.join(", ");

  // Fixed fileTypes that we support
  const supportedFileTypes = ['image/jpeg', 'image/png', 'image/webp'];

  return (
    <div className="w-full">
      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors 
          ${isDragging 
            ? "border-primary bg-primary/10" 
            : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
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
              {helpText} <br />
              Allowed types: {formattedFileTypes}
            </p>
          </div>
          
          <label className="cursor-pointer">
            <Button 
              type="button" 
              variant="outline"
              disabled={isUploading}
              className="relative"
            >
              {isUploading ? "Uploading..." : buttonText}
              <input
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept={accept}
                multiple={multiple}
                disabled={isUploading}
              />
            </Button>
          </label>
        </div>
      </div>

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Selected files ({selectedFiles.length})</h4>
            
            {/* Upload status */}
            <p className="text-sm text-muted-foreground italic">
              {isUploading ? "Files are uploading..." : "Files being processed"}
            </p>
          </div>
          
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <Card key={`${file.name}-${index}`} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {file.type.startsWith('image/') ? (
                        <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-full w-full object-cover"
                            onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))}
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-mono text-primary uppercase">
                            {file.name.split('.').pop() || 'FILE'}
                          </span>
                        </div>
                      )}
                      <div className="space-y-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-8 w-8 p-0"
                      onClick={() => {
                        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                      disabled={isUploading}
                    >
                      <XCircle className="h-5 w-5" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload progress indicator */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center mb-2">
            <Loader2 className="animate-spin h-4 w-4 mr-2 text-primary" />
            <span className="text-sm font-medium">Uploading...</span>
          </div>
          <Progress value={45} className="h-2" />
        </div>
      )}

      {/* Error message display */}
      {(errorMessage || fileSelectionError) && (
        <div className="mt-4 p-3 rounded bg-destructive/10 text-destructive flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Upload Error</p>
            <p className="text-xs">{errorMessage || fileSelectionError}</p>
          </div>
        </div>
      )}
    </div>
  );
}