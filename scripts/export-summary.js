#!/usr/bin/env node

/**
 * Script to provide a summary of exported database content
 */

import fs from 'fs';
import path from 'path';

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

console.log('📊 Database Export Summary');
console.log('=========================');

let totalRecords = 0;

// Sort files alphabetically
files.sort();

// Build a summary table
const summaryData = files.map(file => {
  const filePath = path.join(EXPORT_DIR, file);
  const tableName = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const recordCount = data.length;
  totalRecords += recordCount;
  
  return {
    table: tableName,
    count: recordCount
  };
});

// Find the longest table name for nice formatting
const maxTableLength = Math.max(...summaryData.map(item => item.table.length));

// Print the summary
summaryData.forEach(item => {
  const paddedName = item.table.padEnd(maxTableLength);
  const countStr = String(item.count).padStart(4);
  console.log(`${paddedName} | ${countStr} records`);
});

console.log('=========================');
console.log(`Total: ${totalRecords} records in ${files.length} tables`);

// Print file with the schema SQL
if (fs.existsSync('./complete-schema.sql')) {
  const stats = fs.statSync('./complete-schema.sql');
  const size = (stats.size / 1024).toFixed(2);
  console.log(`\nComplete SQL schema: ${size} KB`);
} else {
  console.log('\nComplete SQL schema file not found.');
}