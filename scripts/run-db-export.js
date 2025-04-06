#!/usr/bin/env node

/**
 * Script to run the database export
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const EXPORT_DIR = './database-export';

// Ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

console.log('🚀 Starting database export...');

try {
  // Run the export script
  execSync('npx tsx ./scripts/export-database.ts', { stdio: 'inherit' });
  
  // Generate schema SQL
  execSync('npx tsx ./scripts/generate-schema-sql.ts', { stdio: 'inherit' });
  
  // Show summary
  execSync('npx tsx ./scripts/export-summary.js', { stdio: 'inherit' });
  
  console.log('✅ Database export completed successfully!');
} catch (error) {
  console.error('❌ Database export failed:', error.message);
  process.exit(1);
}