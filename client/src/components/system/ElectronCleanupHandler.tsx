import { useEffect } from 'react';
import { isElectronContext, runPendingElectronCleanup } from '@/lib/electronCleanup';

/**
 * Component that handles cleaning up temporary files in Electron's Isolated Context
 * This component should be mounted at the app root level
 */
export default function ElectronCleanupHandler() {
  useEffect(() => {
    // Only run in Electron context
    if (!isElectronContext()) {
      console.log('Not in Electron context, skipping ElectronCleanupHandler');
      return;
    }
    
    console.log('ElectronCleanupHandler: Initializing in Electron context');
    
    // Run cleanup on startup immediately
    runPendingElectronCleanup();
    
    // Add listeners to run cleanup on file change events
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'electron_cleanup_needed' || event.key === 'electron_files_to_clean') {
        console.log('ElectronCleanupHandler: Detected cleanup request via storage event');
        runPendingElectronCleanup();
      }
    };
    
    window.addEventListener('storage', handleStorageEvent);
    
    // Setup periodic cleanup check (every 15 seconds)
    const intervalId = setInterval(() => {
      // Check if there are any pending cleanups
      const cleanupTimeStr = localStorage.getItem('electron_cleanup_time');
      if (!cleanupTimeStr) return;
      
      const cleanupTime = parseInt(cleanupTimeStr, 10);
      const now = Date.now();
      
      // Only run if cleanup was requested in the last 5 minutes
      if (now - cleanupTime < 5 * 60 * 1000) {
        console.log('ElectronCleanupHandler: Running periodic cleanup check');
        runPendingElectronCleanup();
      } else {
        // Clear old cleanup requests
        localStorage.removeItem('electron_cleanup_time');
        localStorage.removeItem('electron_files_to_clean');
      }
    }, 15000); // Run every 15 seconds to be more aggressive with cleanup
    
    // Cleanup function when component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(intervalId);
    };
  }, []);
  
  // This component doesn't render anything
  return null;
}