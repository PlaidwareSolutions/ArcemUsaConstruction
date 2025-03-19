import { exec } from 'child_process';

// This script fixes the storage.ts file by removing all references to the 'solutions' field
// Run it with: node -r ts-node/register server/fixes.ts

const fixStorageFile = () => {
  // Use sed to remove all occurrences of the solutions field
  const command = `sed -i '/solutions: project\\.solutions || null,/d' server/storage.ts`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Fixed storage.ts by removing solutions field references`);
  });
};

fixStorageFile();