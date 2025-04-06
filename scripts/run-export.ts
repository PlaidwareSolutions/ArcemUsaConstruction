/**
 * This file provides a simple entry point to run the data export script
 */
import { exportAllData } from './export-all-data';

// Execute the export function
exportAllData().then(() => {
  console.log('Export completed!');
  process.exit(0);
}).catch(error => {
  console.error('Export failed:', error);
  process.exit(1);
});