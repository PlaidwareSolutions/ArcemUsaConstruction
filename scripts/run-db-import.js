#!/usr/bin/env node

/**
 * Script to run the database import
 */

import { execSync } from 'child_process';
import fs from 'fs';
import readline from 'readline';

const EXPORT_DIR = './database-export';

// Check if export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  console.error(`Export directory ${EXPORT_DIR} does not exist.`);
  process.exit(1);
}

// Get list of exported files
const files = fs.readdirSync(EXPORT_DIR).filter(file => file.endsWith('.json'));

if (files.length === 0) {
  console.error(`No JSON files found in ${EXPORT_DIR}.`);
  process.exit(1);
}

// Display warning and confirmation prompt
console.log('⚠️  WARNING: This will delete all existing data in the database and replace it with the exported data.');
console.log('⚠️  All current data will be lost!');
console.log('');
console.log(`Found ${files.length} tables to import:`);
console.log(files.map(f => '  - ' + f.replace('.json', '')).join('\n'));
console.log('');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
  rl.close();
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('Import cancelled.');
    process.exit(0);
  }
  
  console.log('🚀 Starting database import...');
  
  try {
    // Run the import script
    execSync('npx tsx ./scripts/import-database.ts', { stdio: 'inherit' });
    
    // Show summary after import
    execSync('npx tsx ./scripts/export-summary.js', { stdio: 'inherit' });
    
    console.log('✅ Database import completed successfully!');
  } catch (error) {
    console.error('❌ Database import failed:', error.message);
    process.exit(1);
  }
});