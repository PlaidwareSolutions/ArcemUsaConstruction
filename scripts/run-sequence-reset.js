#!/usr/bin/env node

/**
 * Script to run the database sequence reset utility
 */

import { execSync } from 'child_process';

console.log('Running database sequence reset utility...');

try {
  // Execute the TypeScript tool with tsx
  execSync('npx tsx ./scripts/reset-sequences.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running sequence reset:', error);
  process.exit(1);
}