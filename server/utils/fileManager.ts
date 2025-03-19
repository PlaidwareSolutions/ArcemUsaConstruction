import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { uploadThingService } from '../services/uploadthingService';

const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);

/**
 * Extract the UploadThing file key from a URL
 * @param url The file URL to extract the key from
 * @returns The file key or null if not an UploadThing URL
 */
export function extractUploadThingKeyFromUrl(url: string | null): string | null {
  if (!url) return null;
  
  try {
    // Check if this is an UploadThing URL
    if (url.includes('utfs.io/f/') || url.includes('ufs.sh/f/') || url.includes('uploadthing.com/f/')) {
      // Extract the key from the URL
      // Format: https://utfs.io/f/{key} 
      // or https://{tenant}.ufs.sh/f/{key}
      // or https://uploadthing.com/f/{key}
      
      // Split by '/f/'
      const parts = url.split('/f/');
      if (parts.length === 2) {
        // Handle any query parameters or hash fragments
        const keyPart = parts[1].split('?')[0].split('#')[0];
        return keyPart;
      }
    }
    
    // Alternative method for edge cases
    if (url.includes('utfs.io') || url.includes('ufs.sh') || url.includes('uploadthing.com')) {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        if (pathParts.length >= 3 && pathParts[1] === 'f') {
          return pathParts[2];
        }
      } catch (e) {
        // URL parsing failed, continue with other methods
      }
    }
  } catch (e) {
    console.error('Error extracting key from URL:', e);
  }
  
  return null;
}

interface PendingFile {
  url: string;
  timestamp: number;
  sessionId: string;
  filename?: string; // Original filename
}

/**
 * Manages file operations for the application, including deletion and tracking
 */
export class FileManager {
  // Track files that are uploaded but not yet saved to the database
  private static pendingFiles: Map<string, PendingFile> = new Map();
  
  /**
   * Get the current state of pending files (for debugging)
   * @returns Object with pending files
   */
  static getPendingFiles(): Record<string, PendingFile> {
    const files: Record<string, PendingFile> = {};
    this.pendingFiles.forEach((file, key) => {
      files[key] = file;
    });
    return files;
  }

  /**
   * Tracks a newly uploaded file that hasn't been saved to the database yet
   * @param fileUrl The URL of the uploaded file
   * @param sessionId A unique identifier for the upload session (form instance)
   * @param filename Optional original filename of the uploaded file
   * @returns The tracked file URL
   */
  static trackPendingFile(fileUrl: string, sessionId: string, filename?: string): string {
    if (!fileUrl || !sessionId) {
      console.error('Invalid parameters for tracking file:', { fileUrl, sessionId });
      return fileUrl;
    }
    
    // Extract key for UploadThing files or use the URL as key
    const key = extractUploadThingKeyFromUrl(fileUrl) || fileUrl;
    
    // Check if this URL is already tracked for this session to avoid duplicates
    const existing = Array.from(this.pendingFiles.entries())
      .find(([_, file]) => file.url === fileUrl && file.sessionId === sessionId);
    
    if (!existing) {
      console.log(`Tracking new pending file: ${fileUrl} for session ${sessionId}`);
      this.pendingFiles.set(key, {
        url: fileUrl,
        timestamp: Date.now(),
        sessionId,
        filename
      });
    } else {
      console.log(`File already tracked: ${fileUrl} for session ${sessionId}`);
      // Update the timestamp to keep it fresh
      const existingKey = existing[0];
      this.pendingFiles.set(existingKey, {
        ...this.pendingFiles.get(existingKey)!,
        timestamp: Date.now()
      });
    }
    
    return fileUrl;
  }

  /**
   * Marks files from a session as permanent (committed to database)
   * @param sessionId The session ID to commit
   * @param fileUrls Optional array of specific file URLs to commit
   * @returns Array of committed file URLs
   */
  static commitFiles(sessionId: string, fileUrls?: string[]): string[] {
    if (!sessionId) {
      console.error('Invalid sessionId for committing files');
      return [];
    }
    
    console.log(`Committing files for session ${sessionId}${fileUrls ? `, count: ${fileUrls.length}` : ''}`);
    const committedFiles: string[] = [];
    
    // Iterate through all pending files
    for (const entry of Array.from(this.pendingFiles.entries())) {
      const [key, pendingFile] = entry;
      
      // If file belongs to this session and is in the list to commit (or no list provided)
      const shouldCommit = pendingFile.sessionId === sessionId && 
                           (!fileUrls || fileUrls.includes(pendingFile.url));
      
      if (shouldCommit) {
        // Remove from pending files since it's now committed
        this.pendingFiles.delete(key);
        committedFiles.push(pendingFile.url);
        console.log(`Committed file: ${pendingFile.url}`);
      }
    }
    
    console.log(`Committed ${committedFiles.length} files for session ${sessionId}`);
    return committedFiles;
  }

  /**
   * Deletes all pending files for a session (when form is cancelled)
   * @param sessionId The session ID to cleanup
   * @param specificFileUrl Optional specific file URL to delete from the session
   * @param preserveUrls Optional array of URLs to preserve (not delete)
   * @returns Object with arrays of deleted and failed file URLs
   */
  static async cleanupSession(sessionId: string, specificFileUrl?: string, preserveUrls: string[] = []): Promise<{ deletedUrls: string[], failedUrls: string[], preservedUrls: string[] }> {
    if (!sessionId) {
      console.error('Invalid sessionId for cleanup');
      return { deletedUrls: [], failedUrls: [], preservedUrls: [] };
    }
    
    console.log(`Cleaning up session ${sessionId}${specificFileUrl ? ` (specific file: ${specificFileUrl})` : ''}`);
    if (preserveUrls.length > 0) {
      console.log(`Preserving ${preserveUrls.length} files during cleanup`);
    }
    
    const filesToDelete: string[] = [];
    const keysToDelete: string[] = [];
    const preservedFiles: string[] = [];
    
    // Find files for deletion
    for (const entry of Array.from(this.pendingFiles.entries())) {
      const [key, pendingFile] = entry;
      
      // Match session ID and specific file URL if provided
      const matchesSession = pendingFile.sessionId === sessionId;
      const matchesSpecificUrl = !specificFileUrl || pendingFile.url === specificFileUrl;
      const shouldPreserve = preserveUrls.includes(pendingFile.url);
      
      // Only delete if it matches the criteria and is not in the preserve list
      if (matchesSession && matchesSpecificUrl) {
        if (shouldPreserve) {
          preservedFiles.push(pendingFile.url);
          console.log(`Preserving file: ${pendingFile.url}`);
        } else {
          filesToDelete.push(pendingFile.url);
          keysToDelete.push(key);
        }
      }
    }
    
    console.log(`Found ${filesToDelete.length} files to delete and ${preservedFiles.length} files to preserve for session ${sessionId}`);
    
    // If specific URL was provided but not found in tracking, still try to delete it
    // But only if it's not in the preserve list
    if (specificFileUrl && 
        !filesToDelete.includes(specificFileUrl) && 
        !preservedFiles.includes(specificFileUrl) &&
        !preserveUrls.includes(specificFileUrl)) {
      console.log(`Specific URL ${specificFileUrl} not found in tracking, attempting direct deletion`);
      filesToDelete.push(specificFileUrl);
    }
    
    // Delete files from their storage locations
    const deletedUrls: string[] = [];
    const failedUrls: string[] = [];
    
    for (const fileUrl of filesToDelete) {
      // Extra check to make sure we don't delete preserved files
      if (preserveUrls.includes(fileUrl)) {
        console.log(`Skipping deletion of preserved file: ${fileUrl}`);
        preservedFiles.push(fileUrl);
        continue;
      }
      
      try {
        // Check if this is an UploadThing file and delete it
        const uploadThingKey = extractUploadThingKeyFromUrl(fileUrl);
        
        if (uploadThingKey) {
          console.log(`Deleting UploadThing file with key: ${uploadThingKey}`);
          
          try {
            const result = await uploadThingService.deleteFile(uploadThingKey);
            if (result.success) {
              console.log(`Successfully deleted UploadThing file: ${uploadThingKey}`);
              deletedUrls.push(fileUrl);
            } else {
              console.log(`Failed to delete UploadThing file: ${uploadThingKey}`);
              failedUrls.push(fileUrl);
            }
          } catch (err) {
            console.error(`Error deleting UploadThing file with key ${uploadThingKey}:`, err);
            failedUrls.push(fileUrl);
          }
        } 
        // For local files in the filesystem
        else if (fileUrl.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', fileUrl);
          if (await exists(filePath)) {
            await unlink(filePath);
            console.log(`Deleted local file: ${filePath}`);
            deletedUrls.push(fileUrl);
          } else {
            console.log(`Local file not found: ${filePath}`);
            // Still mark as processed
            deletedUrls.push(fileUrl);
          }
        } 
        else {
          console.log(`Unknown file format, can't delete: ${fileUrl}`);
          // Add to failed URLs since we can't properly delete it
          failedUrls.push(fileUrl);
        }
      } catch (error) {
        console.error(`Error deleting file ${fileUrl}:`, error);
        failedUrls.push(fileUrl);
      }
    }
    
    // Remove tracking entries for successful deletions and failed attempts
    // We still remove tracking for failed attempts to prevent accumulation of bad entries
    for (const key of keysToDelete) {
      this.pendingFiles.delete(key);
    }
    
    console.log(`Cleanup completed: ${deletedUrls.length} files deleted, ${failedUrls.length} failed, ${preservedFiles.length} preserved for session ${sessionId}`);
    
    return {
      deletedUrls,
      failedUrls,
      preservedUrls: preservedFiles
    };
  }

  /**
   * Cleans up old pending files that are older than the specified age
   * @param maxAgeMs Maximum age in milliseconds (default: 1 hour)
   * @returns Number of files cleaned up
   */
  static async cleanupOldPendingFiles(maxAgeMs: number = 3600000): Promise<number> {
    const now = Date.now();
    const oldSessionIds = new Set<string>();
    
    // Identify old sessions
    for (const entry of Array.from(this.pendingFiles.entries())) {
      const [key, pendingFile] = entry;
      if (now - pendingFile.timestamp > maxAgeMs) {
        oldSessionIds.add(pendingFile.sessionId);
      }
    }
    
    // Clean up each old session
    let totalCleaned = 0;
    for (const sessionId of Array.from(oldSessionIds)) {
      const result = await this.cleanupSession(sessionId);
      totalCleaned += result.deletedUrls.length;
    }
    
    return totalCleaned;
  }

  /**
   * Deletes a file from storage (local filesystem or UploadThing)
   * @param fileUrl The URL of the file to delete
   * @returns Promise<boolean> True if the file was deleted, false otherwise
   */
  static async deleteFile(fileUrl: string | null): Promise<boolean> {
    if (!fileUrl) return false;
    
    try {
      // Check if this is an UploadThing file
      const uploadThingKey = extractUploadThingKeyFromUrl(fileUrl);
      if (uploadThingKey) {
        // Delete from UploadThing using their API
        console.log(`Deleting UploadThing file with key: ${uploadThingKey}`);
        try {
          const result = await uploadThingService.deleteFile(uploadThingKey);
          return result.success;
        } catch (err) {
          console.error(`Error deleting UploadThing file with key ${uploadThingKey}:`, err);
          // Continue execution even if UploadThing fails - it might be a temporary issue
          // and we don't want to block database cleanup
          return false;
        }
      }
      
      // For locally uploaded files, delete them from the filesystem
      if (fileUrl.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', fileUrl);
        if (await exists(filePath)) {
          await unlink(filePath);
          return true;
        }
      }
      
      // If we reach here, either the file doesn't exist or it's not in a recognized format
      console.log(`File not found or in unrecognized format: ${fileUrl}`);
      return false;
    } catch (error) {
      console.error(`Error deleting file ${fileUrl}:`, error);
      return false;
    }
  }

  /**
   * Safely deletes a file, checking for references in other entities
   * In the future, this could be extended to check for file usage across the system
   * @param fileUrl The URL of the file to delete
   * @returns Promise<boolean> True if the file was deleted, false otherwise
   */
  static async safeDeleteFile(fileUrl: string | null): Promise<boolean> {
    if (!fileUrl) return false;
    
    try {
      // Here we would check if the file is used elsewhere in the system
      // For now, we'll just delete it directly
      return await this.deleteFile(fileUrl);
    } catch (error) {
      console.error(`Error safely deleting file ${fileUrl}:`, error);
      return false;
    }
  }
}