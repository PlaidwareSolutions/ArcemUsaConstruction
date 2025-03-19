import { useCallback, useState, useRef } from 'react';
import type { OurFileRouter } from '@/lib/uploadthing';
import { useUploadThing } from '@/lib/uploadthing';
import * as fileUtils from '@/lib/fileUtils';
import { generateId } from '@/lib/utils';

interface UseFileUploadProps {
  onClientUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: Error) => void;
  onUploadBegin?: () => void;
  onUploadProgress?: (progress: number) => void;
  sessionId?: string;
}

export function useFileUpload({
  onClientUploadComplete,
  onUploadError,
  onUploadBegin,
  onUploadProgress,
  sessionId: providedSessionId,
}: UseFileUploadProps = {}) {
  // If a session ID wasn't provided, generate one that we'll use consistently
  const sessionIdRef = useRef<string>(providedSessionId || generateId());
  const sessionId = sessionIdRef.current;
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  const { startUpload, isUploading: uploading } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res: any[]) => {
      setIsUploading(false);
      setUploadProgress(100);
      
      // Extract URLs from response, preferring ufsUrl over the deprecated url
      const urls = res ? res.map((file: any) => file.ufsUrl || file.url) : [];
      
      console.log("Upload complete:", urls);
      
      // Track the uploaded URLs for cleanup later if needed
      setUploadedUrls(prevUrls => [...prevUrls, ...urls]);
      
      // Track the files on the server for this session
      urls.forEach(url => {
        // Get original filename if available
        const filename = files.find(f => f.name)?.name || 'unknown';
        const key = fileUtils.extractUploadThingKeyFromUrl(url);
        fileUtils.trackUploadedFile(url, sessionId, key || undefined);
      });
      
      if (onClientUploadComplete) {
        onClientUploadComplete(urls);
      }
      
      // Reset file state after successful upload
      setFiles([]);
    },
    onUploadError: (error: Error) => {
      setIsUploading(false);
      setUploadProgress(0);
      
      if (onUploadError) {
        onUploadError(error);
      }
    },
    onUploadBegin: () => {
      setIsUploading(true);
      setUploadProgress(0);
      
      if (onUploadBegin) {
        onUploadBegin();
      }
    },
    onUploadProgress: (progress: number) => {
      setUploadProgress(progress);
      
      if (onUploadProgress) {
        onUploadProgress(progress);
      }
    },
  });

  // Set default max file size (8MB)
  const maxFileSize = 8 * 1024 * 1024; // 8MB in bytes

  // Helper to format file size in human-readable format
  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // Add files to state
  const addFiles = useCallback((newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  // Remove file from state
  const removeFile = useCallback((index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }, []);

  // Clear all files and optionally clean up any uploaded URLs
  const clearFiles = useCallback((cleanupUploaded: boolean = false) => {
    // Clear local file state
    setFiles([]);
    
    // If cleanup is requested and we have uploaded URLs, clean them up
    if (cleanupUploaded && uploadedUrls.length > 0) {
      console.log(`Cleaning up ${uploadedUrls.length} uploaded files for session ${sessionId}`);
      
      // Clean up the files both on server and in browser
      fileUtils.cleanupFiles(sessionId)
        .then((cleanedUrls) => {
          console.log(`Cleaned up ${cleanedUrls.length} files`);
          setUploadedUrls([]); // Clear the tracked URLs after cleanup
        })
        .catch((error: Error) => {
          console.error('Error cleaning up files:', error);
        });
    }
  }, [sessionId, uploadedUrls]);

  // Start the upload process
  const upload = useCallback(async () => {
    if (files.length === 0) {
      return [];
    }

    try {
      setIsUploading(true);
      // Start the upload with files
      const result = await startUpload(files);
      
      // Successfully uploaded
      setIsUploading(false);
      
      // Process result before returning
      const urls = result ? result.map((file) => file.ufsUrl || file.url) : [];
      
      // Add to our tracked URLs
      setUploadedUrls(prevUrls => [...prevUrls, ...urls]);
      
      // Track the files on the server for this session
      urls.forEach((url, index) => {
        const file = files[index];
        const fileKey = fileUtils.extractUploadThingKeyFromUrl(url);
        if (fileKey) {
          fileUtils.trackUploadedFile(url, sessionId, fileKey);
        }
      });
      
      // Call the onClientUploadComplete callback with the URLs
      if (urls.length > 0 && onClientUploadComplete) {
        console.log('Upload complete! URLs:', urls);
        onClientUploadComplete(urls);
      }
      
      return urls;
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      
      // Call the error handler if provided
      if (onUploadError && error instanceof Error) {
        onUploadError(error);
      }
      
      return [];
    }
  }, [files, startUpload, onClientUploadComplete, onUploadError, sessionId]);

  // Cleanup function to handle both server and browser files
  const cleanup = useCallback(async () => {
    console.log(`Cleaning up session ${sessionId} with ${uploadedUrls.length} tracked URLs`);
    
    // Clean up on both server and browser
    const cleanedFiles = await fileUtils.cleanupFiles(sessionId);
    
    // Reset state after cleanup
    setUploadedUrls([]);
    setFiles([]);
    
    return cleanedFiles;
  }, [sessionId, uploadedUrls]);

  // Define file size limits and permitted information
  const permittedFileInfo = {
    config: {
      maxFileSize: "8MB",
      maxFileCount: 10
    }
  };
  
  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    upload,
    cleanup,
    isUploading,
    uploadProgress,
    permittedFileInfo,
    maxFileSize,
    formatFileSize,
    sessionId, // Expose the session ID for external reference
    uploadedUrls, // Expose the tracked uploaded URLs
  };
}