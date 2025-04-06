/**
 * This file provides a simple entry point to run the DDL generation script
 */
import { generateDDL } from './generate-ddl';

// Execute the DDL generation function
generateDDL().then(() => {
  console.log('DDL generation completed!');
  process.exit(0);
}).catch(error => {
  console.error('DDL generation failed:', error);
  process.exit(1);
});