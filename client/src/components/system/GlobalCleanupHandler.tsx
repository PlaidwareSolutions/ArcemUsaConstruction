import { useEffect } from 'react';
import { cleanupOldFiles } from '@/lib/fileUtils';

/**
 * Global handler component for cleaning up temporary files
 * This component should be mounted at the application root
 */
export default function GlobalCleanupHandler() {
  useEffect(() => {
    console.log('GlobalCleanupHandler: Initializing');
    
    // Run initial cleanup on startup
    cleanupOldFiles();
    
    // Setup periodic cleanup (every 5 minutes)
    const intervalId = setInterval(() => {
      console.log('GlobalCleanupHandler: Running periodic cleanup');
      cleanupOldFiles(30 * 60 * 1000); // 30 minutes old files
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Cleanup before unmounting
    return () => {
      console.log('GlobalCleanupHandler: Shutting down');
      clearInterval(intervalId);
      cleanupOldFiles(); // Final cleanup
    };
  }, []);
  
  // This component doesn't render anything
  return null;
}