/**
 * This file provides a simple entry point to run the data import script
 */
import { importAllData } from './export-all-data';

// Execute the import function
importAllData().then(() => {
  console.log('Import completed!');
  process.exit(0);
}).catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});