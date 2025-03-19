/**
 * Utility for cleaning up files in Electron's Isolated Context
 * This is needed because Electron maintains a separate filesystem
 */

/**
 * Cleans up temporary files in the Electron Isolated Context
 * @param filePaths Array of file paths to clean up
 */
export const cleanElectronFiles = async (filePaths: string[]): Promise<void> => {
  if (!isElectronContext()) {
    console.log('Not in Electron context, skipping direct Electron cleanup');
    return;
  }
  
  console.log('Performing direct Electron file cleanup for:', filePaths);
  
  // Try to use Electron's IPC if available
  await cleanViaIPC(filePaths);
  
  // Mark these files for cleanup on next cycle
  storeFilesForCleanup(filePaths);
};

/**
 * Checks if we're running in an Electron context
 */
export const isElectronContext = (): boolean => {
  // Check if the user agent includes Electron
  const isElectron = window.navigator.userAgent.toLowerCase().includes('electron');
  
  // Additional check for Electron-specific objects
  const hasElectronAPIs = 'electron' in window || '__electron' in window;
  
  return isElectron || hasElectronAPIs;
};

/**
 * Tries to clean files via Electron's IPC mechanism
 */
const cleanViaIPC = async (filePaths: string[]): Promise<void> => {
  try {
    // Try to access Electron's IPC if available
    if ('electron' in window) {
      // @ts-ignore
      const ipcRenderer = window.electron?.ipcRenderer;
      if (ipcRenderer) {
        console.log('Using Electron IPC to clean files');
        await ipcRenderer.invoke('cleanup-files', filePaths);
        return;
      }
    }
    
    console.log('Electron IPC not available');
  } catch (error) {
    console.error('Error using Electron IPC:', error);
  }
};

/**
 * Stores files that need to be cleaned up for future cleanup cycles
 */
const storeFilesForCleanup = (filePaths: string[]): void => {
  try {
    // Get existing files marked for cleanup
    const existingStr = localStorage.getItem('electron_files_to_clean');
    const existingFiles = existingStr ? JSON.parse(existingStr) as string[] : [];
    
    // Add new files (avoid duplicates)
    const uniqueFilesMap: { [key: string]: boolean } = {};
    
    // First add existing files
    existingFiles.forEach(file => {
      uniqueFilesMap[file] = true;
    });
    
    // Then add new files
    filePaths.forEach(file => {
      uniqueFilesMap[file] = true;
    });
    
    // Convert back to array
    const allFiles = Object.keys(uniqueFilesMap);
    
    // Store back in localStorage
    localStorage.setItem('electron_files_to_clean', JSON.stringify(allFiles));
    localStorage.setItem('electron_cleanup_time', Date.now().toString());
    
    console.log('Stored files for future Electron cleanup:', allFiles);
  } catch (error) {
    console.error('Error storing files for cleanup:', error);
  }
};

/**
 * Attempts to clean up files stored for cleanup
 * This is called automatically on app startup via ElectronCleanupHandler
 */
export const runPendingElectronCleanup = async (): Promise<void> => {
  try {
    // Check if we have any pending files
    const filesToCleanStr = localStorage.getItem('electron_files_to_clean');
    if (!filesToCleanStr) return;
    
    const filesToClean = JSON.parse(filesToCleanStr) as string[];
    console.log('Running pending Electron cleanup for files:', filesToClean);
    
    // Try to clean up using direct file system access
    await cleanFilesDirectly(filesToClean);
    
    // Remove from localStorage (whether successful or not)
    localStorage.removeItem('electron_files_to_clean');
    localStorage.removeItem('electron_cleanup_time');
  } catch (error) {
    console.error('Error running pending Electron cleanup:', error);
  }
};

/**
 * Clean files by directly accessing the file system
 */
const cleanFilesDirectly = async (filePaths: string[]): Promise<void> => {
  if (!filePaths || filePaths.length === 0) return;
  
  console.log('Attempting direct file system cleanup in Electron context');
  
  // Try several methods - at least one might work in different Electron versions/contexts
  
  // 1. Try using Node.js fs module if available in Electron's context
  try {
    // @ts-ignore - Electron might expose Node.js fs
    if (window.fs && window.fs.unlinkSync) {
      for (const filePath of filePaths) {
        try {
          // Try both with and without "/uploads/" prefix
          try {
            // @ts-ignore
            window.fs.unlinkSync(`/uploads/${filePath}`);
            console.log(`Deleted file via Node.js fs: /uploads/${filePath}`);
          } catch (e) {
            // Try directly with the path
            // @ts-ignore
            window.fs.unlinkSync(filePath);
            console.log(`Deleted file via Node.js fs: ${filePath}`);
          }
        } catch (error) {
          console.log(`Could not delete file: ${filePath}`, error);
        }
      }
    }
  } catch (error) {
    console.log('Node.js fs not available in Electron context');
  }
  
  // 2. Try using Electron's custom API if available
  try {
    // @ts-ignore - Electron might have custom removeFile
    if (window.electron && window.electron.removeFile) {
      for (const filePath of filePaths) {
        try {
          // @ts-ignore
          await window.electron.removeFile(`/uploads/${filePath}`);
          console.log(`Deleted file via Electron API: /uploads/${filePath}`);
        } catch (error) {
          console.log(`Could not delete file via Electron API: ${filePath}`, error);
        }
      }
    }
  } catch (error) {
    console.log('Electron removeFile API not available');
  }
  
  // 3. Try using WebKit File System API
  try {
    if ('webkitRequestFileSystem' in window) {
      // @ts-ignore
      window.webkitRequestFileSystem(
        // @ts-ignore
        window.TEMPORARY, 
        1024 * 1024 * 50, // 50MB space
        (fs: any) => {
          for (const filePath of filePaths) {
            try {
              // Extract just the filename from the path
              const filename = filePath.includes('/') 
                ? filePath.split('/').pop() 
                : filePath;
                
              if (!filename) continue;
              
              // Try to get and delete the file
              fs.root.getFile(filename, {}, (fileEntry: any) => {
                fileEntry.remove(() => {
                  console.log(`Deleted file via WebKit FS: ${filename}`);
                }, (err: any) => {
                  console.error(`Error removing file ${filename}:`, err);
                });
              }, (err: any) => {
                console.log(`File not found in WebKit FS: ${filename}`);
              });
            } catch (e) {
              console.error(`Error processing file ${filePath}:`, e);
            }
          }
        },
        (err: any) => {
          console.error('Error accessing WebKit filesystem:', err);
        }
      );
    }
  } catch (error) {
    console.log('WebKit File System API not available:', error);
  }
};