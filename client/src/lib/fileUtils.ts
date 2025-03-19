/**
 * File utilities for managing uploads and cleanup
 */
import { cleanElectronFiles } from './electronCleanup';

/**
 * Interface for tracking uploaded files
 */
interface TrackedFile {
  url: string;
  timestamp: number;
  sessionId: string;
  key?: string;
}

/**
 * Tracks a file that's been uploaded and needs to be monitored for potential cleanup
 * @param fileUrl The URL of the uploaded file (from UploadThing or other source)
 * @param sessionId A unique ID for this upload session (form instance)
 * @param fileKey Optional UploadThing key associated with the file
 */
export const trackUploadedFile = (fileUrl: string, sessionId: string, fileKey?: string): void => {
  if (!fileUrl) return;
  
  try {
    // Store in localStorage for tracking
    const storedFilesStr = localStorage.getItem('uploaded_files');
    const storedFiles: TrackedFile[] = storedFilesStr ? JSON.parse(storedFilesStr) : [];
    
    // Add the new file
    storedFiles.push({
      url: fileUrl,
      timestamp: Date.now(),
      sessionId,
      key: fileKey
    });
    
    // Save back to localStorage
    localStorage.setItem('uploaded_files', JSON.stringify(storedFiles));
    console.log(`Tracked file: ${fileUrl} for session ${sessionId}`);
    
    // Also track this file for Electron cleanup if needed
    if (fileUrl.startsWith('file://') || fileUrl.includes('/uploads/')) {
      // Extract just the filename or path for Electron cleanup
      let filePath = fileUrl;
      if (fileUrl.includes('/uploads/')) {
        filePath = fileUrl.split('/uploads/')[1];
      } else if (fileUrl.startsWith('file://')) {
        filePath = fileUrl.replace('file://', '');
      }
      
      cleanElectronFiles([filePath]);
    }
  } catch (error) {
    console.error('Error tracking uploaded file:', error);
  }
};

/**
 * Commits files for a session, marking them as permanently stored
 * @param sessionId The session ID to commit
 * @param fileUrls Optional specific file URLs to commit (if not provided, commits all for the session)
 */
export const commitFiles = async (sessionId: string, fileUrls?: string[]): Promise<string[]> => {
  try {
    // Get the existing tracked files
    const storedFilesStr = localStorage.getItem('uploaded_files');
    if (!storedFilesStr) return [];
    
    const storedFiles: TrackedFile[] = JSON.parse(storedFilesStr);
    const remainingFiles: TrackedFile[] = [];
    const committedFiles: string[] = [];
    
    // Process each file
    storedFiles.forEach(file => {
      // If this file is from this session and either no specific URLs were provided,
      // or this file's URL is in the provided URLs
      const shouldCommit = file.sessionId === sessionId && 
        (!fileUrls || fileUrls.includes(file.url));
      
      if (shouldCommit) {
        committedFiles.push(file.url);
      } else {
        remainingFiles.push(file);
      }
    });
    
    // Save the remaining files
    localStorage.setItem('uploaded_files', JSON.stringify(remainingFiles));
    
    // Tell the server to commit these files
    if (committedFiles.length > 0) {
      try {
        await fetch('/api/files/commit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId,
            fileUrls: committedFiles
          })
        });
      } catch (error) {
        console.error('Error committing files on server:', error);
      }
    }
    
    console.log(`Committed ${committedFiles.length} files for session ${sessionId}`);
    return committedFiles;
  } catch (error) {
    console.error('Error committing files:', error);
    return [];
  }
};

/**
 * Cleans up temporary files for a session
 * @param sessionId The session ID to clean up
 * @param specificFileUrl Optional specific file URL to clean up
 */
export const cleanupFiles = async (sessionId: string, specificFileUrl?: string): Promise<string[]> => {
  try {
    // Get the existing tracked files
    const storedFilesStr = localStorage.getItem('uploaded_files');
    if (!storedFilesStr) return [];
    
    const storedFiles: TrackedFile[] = JSON.parse(storedFilesStr);
    const remainingFiles: TrackedFile[] = [];
    const filesToClean: TrackedFile[] = [];
    
    // Identify which files to clean
    storedFiles.forEach(file => {
      // If this file is from this session and either no specific URL was provided,
      // or this file's URL matches the provided URL
      const shouldClean = file.sessionId === sessionId && 
        (!specificFileUrl || file.url === specificFileUrl);
      
      if (shouldClean) {
        filesToClean.push(file);
      } else {
        remainingFiles.push(file);
      }
    });
    
    // Save the remaining files before attempting any cleanup
    localStorage.setItem('uploaded_files', JSON.stringify(remainingFiles));
    
    // Clean up each file
    const cleanedUrls: string[] = [];
    const electronFiles: string[] = [];
    
    for (const file of filesToClean) {
      // If it's a blob URL, revoke it
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
      
      // If it's a file URL or uploads path, track for Electron cleanup
      if (file.url.startsWith('file://') || file.url.includes('/uploads/')) {
        let filePath = file.url;
        if (file.url.includes('/uploads/')) {
          filePath = file.url.split('/uploads/')[1];
        } else if (file.url.startsWith('file://')) {
          filePath = file.url.replace('file://', '');
        }
        
        electronFiles.push(filePath);
      }
      
      cleanedUrls.push(file.url);
    }
    
    // If we have Electron files, clean them
    if (electronFiles.length > 0) {
      await cleanElectronFiles(electronFiles);
    }
    
    // Tell the server to clean up these files
    if (cleanedUrls.length > 0) {
      try {
        const response = await fetch('/api/files/cleanup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId,
            fileUrls: specificFileUrl ? [specificFileUrl] : cleanedUrls
          })
        });
        
        const result = await response.json();
        console.log('Server cleanup response:', result);
        
        if (result.success) {
          console.log(`Server successfully cleaned up ${result.deletedCount} files`);
        } else {
          console.error('Server cleanup failed:', result.message);
        }
      } catch (error) {
        console.error('Error cleaning up files on server:', error);
      }
    }
    
    console.log(`Cleaned up ${cleanedUrls.length} files for session ${sessionId}`);
    return cleanedUrls;
  } catch (error) {
    console.error('Error cleaning up files:', error);
    return [];
  }
};

/**
 * Cleans up old temporary files that are older than a specified age
 * @param maxAgeMs Maximum age in milliseconds (default: 1 hour)
 */
export const cleanupOldFiles = async (maxAgeMs: number = 3600000): Promise<string[]> => {
  try {
    // Get the existing tracked files
    const storedFilesStr = localStorage.getItem('uploaded_files');
    if (!storedFilesStr) return [];
    
    const storedFiles: TrackedFile[] = JSON.parse(storedFilesStr);
    const now = Date.now();
    const remainingFiles: TrackedFile[] = [];
    const filesToClean: TrackedFile[] = [];
    
    // Identify which files to clean
    storedFiles.forEach(file => {
      const age = now - file.timestamp;
      if (age > maxAgeMs) {
        filesToClean.push(file);
      } else {
        remainingFiles.push(file);
      }
    });
    
    // Save the remaining files before attempting any cleanup
    localStorage.setItem('uploaded_files', JSON.stringify(remainingFiles));
    
    // Clean up each file
    const cleanedUrls: string[] = [];
    const electronFiles: string[] = [];
    
    for (const file of filesToClean) {
      // If it's a blob URL, revoke it
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
      
      // If it's a file URL or uploads path, track for Electron cleanup
      if (file.url.startsWith('file://') || file.url.includes('/uploads/')) {
        let filePath = file.url;
        if (file.url.includes('/uploads/')) {
          filePath = file.url.split('/uploads/')[1];
        } else if (file.url.startsWith('file://')) {
          filePath = file.url.replace('file://', '');
        }
        
        electronFiles.push(filePath);
      }
      
      cleanedUrls.push(file.url);
    }
    
    // If we have Electron files, clean them
    if (electronFiles.length > 0) {
      await cleanElectronFiles(electronFiles);
    }
    
    // Group files by session
    const sessionFiles: Record<string, string[]> = {};
    filesToClean.forEach(file => {
      if (!sessionFiles[file.sessionId]) {
        sessionFiles[file.sessionId] = [];
      }
      sessionFiles[file.sessionId].push(file.url);
    });
    
    // Tell the server to clean up these files, grouped by session
    for (const [sessionId, urls] of Object.entries(sessionFiles)) {
      if (urls.length > 0) {
        try {
          await fetch('/api/files/cleanup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              sessionId,
              fileUrls: urls
            })
          });
        } catch (error) {
          console.error(`Error cleaning up files for session ${sessionId}:`, error);
        }
      }
    }
    
    console.log(`Cleaned up ${cleanedUrls.length} old files`);
    return cleanedUrls;
  } catch (error) {
    console.error('Error cleaning up old files:', error);
    return [];
  }
};

/**
 * Extracts an UploadThing file key from a URL
 * @param url The file URL to extract the key from
 */
export const extractUploadThingKeyFromUrl = (url: string | null): string | null => {
  if (!url) return null;

  // Check if it's an UploadThing URL
  const isUploadThingUrl = url.includes("utfs.io") || url.includes("uploadthing.com");
  if (!isUploadThingUrl) return null;

  // Extract the key from the URL
  const urlParts = url.split("/");
  return urlParts[urlParts.length - 1] || null;
};

/**
 * Extracts a filename from a URL or path
 * @param url The URL or path to extract the filename from
 */
export const extractFilenameFromUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  // Extract the filename
  const urlParts = url.split("/");
  const filename = urlParts[urlParts.length - 1] || null;
  
  // Remove any query parameters
  if (filename && filename.includes('?')) {
    return filename.split('?')[0];
  }
  
  return filename;
};

/**
 * Format file size in bytes to human-readable format (KB, MB, etc.)
 * @param bytes File size in bytes
 * @param decimals Number of decimal places to show
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Get file extension from a URL or filename
 * @param url The URL or filename
 */
export const getFileExtension = (url: string): string => {
  if (!url) return '';
  
  const filename = extractFilenameFromUrl(url) || url;
  const parts = filename.split('.');
  
  if (parts.length === 1 || (parts[0] === '' && parts.length === 2)) {
    return '';
  }
  
  return parts.pop()?.toLowerCase() || '';
};

/**
 * Check if a URL points to an image file
 * @param url The URL to check
 */
export const isImageFile = (url: string): boolean => {
  if (!url) return false;
  
  const extension = getFileExtension(url);
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  
  return imageExtensions.includes(extension);
};

/**
 * Generate a unique session ID for tracking uploads
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Alias for trackUploadedFile for backward compatibility
 */
export const trackFile = trackUploadedFile;