#!/usr/bin/env node

/**
 * Script to generate the complete SQL schema
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔍 Generating complete database schema SQL...');

try {
  // Run the schema generation script
  execSync('npx tsx ./scripts/generate-schema-sql.ts', { stdio: 'inherit' });
  
  // Check if the file was created
  if (fs.existsSync('./complete-schema.sql')) {
    const stats = fs.statSync('./complete-schema.sql');
    const size = (stats.size / 1024).toFixed(2);
    console.log(`✅ Schema SQL generated successfully (${size} KB)`);
    console.log('   File location: ./complete-schema.sql');
  } else {
    console.error('❌ Schema SQL file was not created.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Schema SQL generation failed:', error.message);
  process.exit(1);
}