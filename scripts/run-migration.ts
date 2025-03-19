import { exec } from 'child_process';

const runMigration = () => {
  console.log('Running Drizzle migration...');
  
  exec('npx drizzle-kit push', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing migration: ${error}`);
      return;
    }
    
    if (stderr) {
      console.error(`Migration stderr: ${stderr}`);
    }
    
    console.log(`Migration stdout: ${stdout}`);
    console.log('Migration completed successfully');
  });
};

runMigration();