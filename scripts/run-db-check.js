/**
 * Helper script to run the database structure check utility
 */

console.log('Running database structure check...');
console.log('-------------------------------');

// Run the check script
import { spawn } from 'child_process';

const checkProcess = spawn('node', ['scripts/check-db-structure.js'], {
  stdio: 'inherit',
  shell: true,
});

checkProcess.on('error', (error) => {
  console.error(`Error executing the script: ${error.message}`);
  process.exit(1);
});

checkProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Database structure check exited with code ${code}`);
    process.exit(code);
  }
});