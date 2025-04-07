/**
 * TypeScript script to create a complete PostgreSQL database dump
 * This creates a single file containing both schema and data
 * that can be used for database migration to another environment
 */

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execPromise = util.promisify(exec);

/**
 * Creates a complete database dump
 */
async function createDatabaseDump(executeDump: boolean = false): Promise<void> {
  try {
    // Format current timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
    const dumpFile = path.resolve(__dirname, `../database-dump-${timestamp}.sql`);

    // Print information about what this script would do
    console.log(`This script would create a complete database dump at: ${dumpFile}`);
    console.log('Using connection parameters from environment variables');
    console.log('');
    console.log('The dump would include:');
    console.log('- All database schemas (tables, views, functions, triggers)');
    console.log('- All constraints (primary keys, foreign keys, unique constraints)');
    console.log('- All sequences with their current values');
    console.log('- All stored data');
    console.log('- All indexes');
    console.log('');

    // Construct the pg_dump command that would be executed
    const pgDumpCommand = `pg_dump \\
  --host=\${PGHOST} \\
  --port=\${PGPORT} \\
  --username=\${PGUSER} \\
  --dbname=\${PGDATABASE} \\
  --format=plain \\
  --create \\
  --clean \\
  --if-exists \\
  --no-owner \\
  --no-privileges \\
  > ${dumpFile}`;

    console.log('To actually perform the dump, run with --execute flag or modify this script');
    console.log(pgDumpCommand);
    console.log('');
    console.log('To restore this dump on another system, you would use:');
    console.log(`psql -f ${dumpFile} postgres://<username>:<password>@<hostname>:<port>/<dbname>`);
    
    // Exit here unless executeDump is true
    if (!executeDump) {
      console.log('');
      console.log('SIMULATION MODE: No actual dump was created to protect your data.');
      console.log('Run with --execute flag to perform the actual dump operation.');
      return;
    }

    // Execute the actual dump command
    const actualCommand = `pg_dump \
  --host=${process.env.PGHOST} \
  --port=${process.env.PGPORT} \
  --username=${process.env.PGUSER} \
  --dbname=${process.env.PGDATABASE} \
  --format=plain \
  --create \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > ${dumpFile}`;

    console.log('Creating database dump...');
    
    await execPromise(actualCommand);
    
    // Get file size
    const stats = fs.statSync(dumpFile);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`Database dump created successfully: ${dumpFile}`);
    console.log(`File size: ${fileSizeMB} MB`);
    
  } catch (error) {
    console.error('Error creating database dump:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const executeFlag = process.argv.includes('--execute');

// Run the function with the execute flag
createDatabaseDump(executeFlag);