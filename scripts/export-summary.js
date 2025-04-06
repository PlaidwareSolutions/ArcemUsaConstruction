#!/usr/bin/env node

/**
 * Script to provide a summary of exported database content
 */

import fs from 'fs';
import path from 'path';

const EXPORT_DIR = './database-export';

// ANSI color codes for formatting
const COLORS = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  BLUE: '\x1b[34m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
  BG_BLUE: '\x1b[44m',
};

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getSummary() {
  console.log(`${COLORS.BG_BLUE}${COLORS.WHITE}${COLORS.BOLD} Database Export Summary ${COLORS.RESET}\n`);
  
  if (!fs.existsSync(EXPORT_DIR)) {
    console.log(`${COLORS.YELLOW}Export directory not found: ${EXPORT_DIR}${COLORS.RESET}`);
    return;
  }
  
  const files = fs.readdirSync(EXPORT_DIR).filter(file => file.endsWith('.json'));
  
  if (files.length === 0) {
    console.log(`${COLORS.YELLOW}No export files found in ${EXPORT_DIR}${COLORS.RESET}`);
    return;
  }
  
  console.log(`${COLORS.CYAN}Found ${files.length} export files in ${EXPORT_DIR}${COLORS.RESET}\n`);
  
  // Sort files by table name (alphabetically)
  files.sort();
  
  // Calculate the total size of all export files
  let totalSize = 0;
  let totalRecords = 0;
  
  console.log(`${COLORS.BOLD}Table Name               Records    File Size${COLORS.RESET}`);
  console.log(`${COLORS.DIM}----------------------------------------${COLORS.RESET}`);
  
  files.forEach(file => {
    const filePath = path.join(EXPORT_DIR, file);
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    totalSize += fileSize;
    
    // Read the file to count records
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const recordCount = Array.isArray(data) ? data.length : 0;
    totalRecords += recordCount;
    
    // Format the table name (remove .json extension)
    const tableName = file.replace('.json', '');
    
    // Add padding to align columns
    const paddedTableName = tableName.padEnd(24);
    const paddedRecordCount = recordCount.toString().padEnd(10);
    
    console.log(`${paddedTableName} ${paddedRecordCount} ${formatFileSize(fileSize)}`);
  });
  
  console.log(`${COLORS.DIM}----------------------------------------${COLORS.RESET}`);
  console.log(`${COLORS.BOLD}Total                     ${totalRecords.toString().padEnd(10)} ${formatFileSize(totalSize)}${COLORS.RESET}\n`);
  
  console.log(`${COLORS.GREEN}Export date: ${new Date().toLocaleString()}${COLORS.RESET}`);
}

// Run the summary function
getSummary();