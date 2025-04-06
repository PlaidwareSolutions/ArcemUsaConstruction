import { UTApi } from "uploadthing/server";

/**
 * Interface for a file returned from UploadThing API
 */
interface UploadThingFile {
  key: string;
  name?: string;
  url?: string;        // Deprecated, will be removed in v9
  ufsUrl?: string;     // New URL format (tenant-specific)
  appUrl?: string;     // Deprecated, will be removed in v9
  size: number;
  uploadedAt: number;
  id: string;
  status: "Uploaded" | "Uploading" | "Failed" | "Deletion Pending";
  customId: string | null;
}

/**
 * Interface for the response from UploadThing listFiles API
 */
interface UploadThingListFilesResponse {
  files: UploadThingFile[];
  hasMore: boolean;
}

/**
 * Interface for file list response
 */
export interface FileListItem {
  key: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  category: string;
}

/**
 * Service class to interact with UploadThing API
 */
export class UploadThingService {
  private utapi: UTApi;

  constructor() {
    // Initialize the UploadThing API client
    this.utapi = new UTApi();
  }

  /**
   * Get a list of all files from UploadThing
   * @returns Promise with an array of file list items
   */
  async listFiles(): Promise<FileListItem[]> {
    try {
      const response = await this.utapi.listFiles() as UploadThingListFilesResponse;
      
      // Check if files property exists
      if (!response.files || !Array.isArray(response.files)) {
        return [];
      }
      
      // Map to our interface with normalized properties
      return response.files.map((file: UploadThingFile) => {
        // Prefer new ufsUrl format, fall back to deprecated url
        let fileUrl = file.ufsUrl || file.url;
        
        // If no URL is provided at all, generate one from the key
        if (!fileUrl && file.key) {
          // UploadThing uses a tenant subdomain format: https://{tenant-id}.ufs.sh/f/{file-key}
          // For this application, we'll use the environment APP_ID or a default prefix
          const appId = process.env.UPLOADTHING_APP_ID || '';
          // Extract tenant ID from app ID or use a default
          const tenantId = appId.substring(0, 10).toLowerCase() || 'hdbd2e27pi';
          
          // Modern keys start with 'o1' and use the new URL format
          if (file.key.startsWith('o1')) {
            fileUrl = `https://${tenantId}.ufs.sh/f/${file.key}`;
          } else {
            // Legacy format for older keys
            fileUrl = `https://utfs.io/f/${file.key}`;
          }
        }
        
        // Determine file category based on file name or structure
        let category = 'Other';
        
        // Project files typically have specific naming patterns
        const fileName = file.name || '';
        
        // First check for project-specific patterns to ensure everything gets properly categorized
        if (fileName.match(/golden-tree|golden_tree|goldentree/i)) {
          category = 'Projects/Golden Tree';
        } else if (fileName.match(/tenant-imp|tenant_imp|tenant_improvement|tenantimprovement/i)) {
          category = 'Projects/Tenant Improvements';
        } else if (fileName.match(/mecca-cemetry|mecca_cemetry|meccacemetry|cemetery/i)) {
          category = 'Projects/Mecca Cemetery';
        } else if (fileName.match(/truckstop-gas|truckstop_gas|truck-stop|gas-station|gasstation/i)) {
          category = 'Projects/Truck Stop & Gas Station';
        } else if (fileName.match(/cstore|c-store|convenience|conv-store/i)) {
          category = 'Projects/Convenience Store';
        } else if (fileName.match(/^p\d+/i)) {
          // Project files that start with p followed by numbers (e.g., p001, p123)
          category = 'Projects/Project Files';
        } else if (fileName.match(/project|construction|building|site|structure|renovation/i)) {
          // Generic project files that don't match specific patterns
          category = 'Projects/Other Projects';
        } else if (fileName.match(/quote|request|attachment|inquiry|estimate/i)) {
          // Quote request related files
          if (fileName.match(/attachment|file|doc/i)) {
            category = 'Quote Requests/Attachments';
          } else {
            category = 'Quote Requests';
          }
        } else if (fileName.match(/blog|post|article|news/i)) {
          // Blog related files
          if (fileName.match(/image|thumbnail|featured/i)) {
            category = 'Blog/Images';
          } else if (fileName.match(/video|media/i)) {
            category = 'Blog/Media';
          } else {
            category = 'Blog/Content';
          }
        } else if (fileName.match(/service|offering|expertise/i)) {
          // Service related files
          if (fileName.match(/image|photo|gallery/i)) {
            category = 'Services/Gallery';
          } else if (fileName.match(/icon|symbol/i)) {
            category = 'Services/Icons';
          } else {
            category = 'Services';
          }
        } else if (fileName.match(/team|member|employee|staff|personnel/i)) {
          category = 'Team Members';
        } else if (fileName.match(/logo|brand|icon|identity|favicon/i)) {
          category = 'Brand Assets';
        } else if (fileName.endsWith('.pdf')) {
          category = 'Documents';
        } else if (fileName.match(/contract|agreement|proposal|legal/i)) {
          category = 'Legal Documents';
        }
        
        // Log URL formats for debugging
        console.log(`File ${file.name || file.key} URLs:`, {
          ufsUrl: file.ufsUrl?.substring(0, 30) + '...' || '[not provided]',
          url: file.url?.substring(0, 30) + '...' || '[not provided]',
          calculated: fileUrl?.substring(0, 30) + '...' || '[none]'
        });
        
        return {
          key: file.key,
          name: file.name || file.key,
          url: fileUrl || '',
          size: file.size || 0,
          uploadedAt: new Date(file.uploadedAt || Date.now()).toISOString(),
          category: category
        };
      });
    } catch (error) {
      console.error("Error listing UploadThing files:", error);
      throw error;
    }
  }

  /**
   * Delete a file from UploadThing by its key
   * @param key The file key to delete
   * @returns Promise with the deletion result
   */
  async deleteFile(key: string): Promise<{ success: boolean }> {
    try {
      const result = await this.utapi.deleteFiles(key);
      return { success: result.success };
    } catch (error) {
      console.error(`Error deleting UploadThing file with key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete multiple files from UploadThing by their keys
   * @param keys Array of file keys to delete
   * @returns Promise with the deletion results
   */
  async deleteFiles(keys: string[]): Promise<{ success: boolean, deletedCount: number }> {
    try {
      const result = await this.utapi.deleteFiles(keys);
      return { 
        success: result.success,
        deletedCount: keys.length
      };
    } catch (error) {
      console.error(`Error deleting multiple UploadThing files:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const uploadThingService = new UploadThingService();