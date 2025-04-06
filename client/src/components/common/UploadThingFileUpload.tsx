import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUploadThing } from '@/lib/uploadthing';
import { Progress } from '@/components/ui/progress';

interface UploadThingFileUploadProps {
  onUploadComplete: (files: {
    fileName: string;
    fileUrl: string;
    fileKey: string;
    fileSize: number;
    fileType: string;
  }[]) => void;
  uploadType: 'imageUploader' | 'quoteDocumentUploader';
  maxFiles?: number;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
}

const UploadThingFileUpload: React.FC<UploadThingFileUploadProps> = ({
  onUploadComplete,
  uploadType,
  maxFiles = 3,
  maxFileSize = 10, // Default max size is 10MB
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // UploadThing hook
  const { startUpload } = useUploadThing(uploadType, {
    onClientUploadComplete: (res) => {
      setUploading(false);
      setProgress(100);
      
      // Format the response for the parent component
      const uploadedFiles = res.map(file => ({
        fileName: file.name,
        fileUrl: file.url,
        fileKey: file.key,
        fileSize: file.size,
        fileType: file.name.split('.').pop() || ''
      }));
      
      onUploadComplete(uploadedFiles);
      
      // Show success toast
      toast({
        title: "Files uploaded successfully!",
        description: `${res.length} file${res.length > 1 ? 's' : ''} uploaded.`,
      });
      
      // Clear files after successful upload
      setFiles([]);
      
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 2000);
    },
    onUploadError: (error) => {
      setUploading(false);
      setProgress(0);
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong with the upload.",
        variant: "destructive",
      });
    },
    onUploadProgress: (progress) => {
      setProgress(progress);
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter out files that are too large or not allowed types
    const validFiles = acceptedFiles.filter(file => {
      const isValidSize = file.size <= maxFileSize * 1024 * 1024;
      const isValidType = allowedFileTypes.includes(file.type);
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the ${maxFileSize}MB limit.`,
          variant: "destructive",
        });
      }
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an accepted file type.`,
          variant: "destructive",
        });
      }
      
      return isValidSize && isValidType;
    });
    
    // Check if adding these files would exceed the max files limit
    if (files.length + validFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files.`,
        variant: "destructive",
      });
      // Only add files up to the limit
      const remainingSlots = maxFiles - files.length;
      setFiles(prevFiles => [...prevFiles, ...validFiles.slice(0, remainingSlots)]);
    } else {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  }, [files, maxFiles, maxFileSize, allowedFileTypes, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles
  });

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      // Start the upload process
      await startUpload(files);
    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
      setProgress(0);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred during the upload.",
        variant: "destructive",
      });
    }
  };

  const getFileIconColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'text-red-500';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        aria-label="File upload dropzone"
      >
        <input {...getInputProps()} disabled={uploading} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-gray-400" />
          <p className="text-sm text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select files'}
          </p>
          <p className="text-xs text-gray-500">
            Supported files: JPG, PNG, PDF (Max {maxFileSize}MB)
          </p>
          <p className="text-xs text-gray-500">
            Maximum {maxFiles} file{maxFiles !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Selected Files ({files.length}/{maxFiles})</div>
          <div className="grid gap-2">
            {files.map((file, index) => (
              <Card key={index} className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className={`h-5 w-5 ${getFileIconColor(file.name)}`} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {progress > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Uploading...</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} max={100} />
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={files.length === 0 || uploading}
        className="w-full"
        aria-label="Upload files"
      >
        {uploading ? 'Uploading...' : 'Upload Files'}
      </Button>
    </div>
  );
};

export default UploadThingFileUpload;