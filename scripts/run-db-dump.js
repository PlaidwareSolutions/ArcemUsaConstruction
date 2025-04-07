/**
 * Helper script to run the database dump utility
 */

console.log('Running database dump utility...');
console.log('-------------------------------');

// Pass all arguments to the TypeScript script
import { spawn } from 'child_process';
const args = process.argv.slice(2);

const tscProcess = spawn('tsx', ['scripts/pg-dump.ts', ...args], {
  stdio: 'inherit',
  shell: true,
});

tscProcess.on('error', (error) => {
  console.error(`Error executing the script: ${error.message}`);
  process.exit(1);
});

tscProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Database dump script exited with code ${code}`);
    process.exit(code);
  }
});