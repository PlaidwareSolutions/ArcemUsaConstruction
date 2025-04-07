# Database Tools Guide

This guide provides comprehensive documentation for all database management tools available in the Arcem Construction Management Platform.

## Table of Contents

1. [Database Export and Import](#database-export-and-import)
   - [Export Database](#export-database)
   - [Import Database](#import-database)
   - [Database Summary](#database-summary)

2. [Database Schema Management](#database-schema-management)
   - [Generate Schema SQL](#generate-schema-sql)
   - [Reset Sequences](#reset-sequences)

3. [Database Backup and Restore](#database-backup-and-restore)
   - [Create Database Dump](#create-database-dump)
   - [Check Database Structure](#check-database-structure)

4. [Migration Workflows](#migration-workflows)
   - [Between Environments](#between-environments)
   - [Database Backup](#database-backup)
   - [Database Restoration](#database-restoration)

5. [Troubleshooting](#troubleshooting)
   - [Common Issues](#common-issues)
   - [Best Practices](#best-practices)

## Database Export and Import

### Export Database

The database export tool extracts all data from the database into JSON files, organized by table.

**Usage:**

```
npm run db:export
```

**What it does:**

1. Creates a `database-export` directory if it doesn't exist
2. For each table in the database:
   - Queries all records in the table
   - Writes the results to a JSON file named after the table
3. Generates a summary of exported records by table

**Files:**
- Primary script: `scripts/export-database.ts`
- Helper script: `scripts/run-db-export.js`
- Summary script: `scripts/export-summary.js`

### Import Database

The database import tool loads data from JSON files into the database, clearing existing data first.

**Usage:**

```
npm run db:import
```

**What it does:**

1. Prompts for confirmation before proceeding (to prevent accidental data loss)
2. For each JSON file in the `database-export` directory:
   - Clears the corresponding table
   - Inserts the records from the JSON file
3. Resets all sequences to match the imported data

**Files:**
- Primary script: `scripts/import-database.ts`
- Helper script: `scripts/run-db-import.js`

### Database Summary

After exporting data, a summary is displayed showing the number of records exported from each table.

**Usage:**

The summary is displayed automatically after running `npm run db:export`, but it can also be run separately:

```
node scripts/export-summary.js
```

**What it does:**

1. Scans the `database-export` directory
2. For each JSON file:
   - Counts the number of records
   - Reports the table name and count

**Files:**
- Summary script: `scripts/export-summary.js`

## Database Schema Management

### Generate Schema SQL

This tool generates a complete SQL script that can recreate the database schema.

**Usage:**

```
npm run db:schema
```

**What it does:**

1. Connects to the database
2. Generates SQL statements for:
   - Tables
   - Constraints
   - Indexes
   - Sequences (including current values)
3. Writes the SQL to a file named `complete-schema.sql`

**Files:**
- Primary script: `scripts/generate-schema-sql.ts`
- Helper script: `scripts/run-schema-sql.js`

### Reset Sequences

This tool resets all PostgreSQL sequences to match the current data in the tables.

**Usage:**

```
npm run db:reset-sequences
```

**What it does:**

1. For each table with an ID column:
   - Finds the maximum ID value
   - Updates the corresponding sequence to start at max_id + 1
2. Reports the updated sequences

**Files:**
- Primary script: `scripts/reset-sequences.ts`
- Helper script: `scripts/run-sequence-reset.js`

## Database Backup and Restore

### Create Database Dump

This tool creates a complete PostgreSQL dump file containing both schema and data.

**Usage:**

Simulation mode (default):
```
npm run db:dump
```

Execute mode:
```
./scripts/pg-dump.sh --execute
```

**What it does:**

1. Uses pg_dump to create a complete database dump
2. Includes options for:
   - Creating/dropping database
   - Including all objects and data
   - Excluding ownership information
3. Creates a timestamped SQL file

**Files:**
- Primary script: `scripts/pg-dump.ts` or `scripts/pg-dump.sh`
- Helper script: `scripts/run-db-dump.js`
- JavaScript version: `scripts/create-db-dump.js`

### Check Database Structure

This tool analyzes the database structure before creating a dump.

**Usage:**

```
npm run db:check
```

**What it does:**

1. Connects to the database
2. Analyzes and reports:
   - Table counts by schema
   - Record counts by table
   - Total database size
   - Constraint counts by type
   - Total indexes
   - List of sequences with current values

**Files:**
- Primary script: `scripts/check-db-structure.js`
- Helper script: `scripts/run-db-check.js`

## Migration Workflows

### Between Environments

To migrate data between environments:

1. **Source Environment:**
   ```
   npm run db:export
   ```

2. **Copy files:**
   ```
   # Copy the database-export directory to the target environment
   ```

3. **Target Environment:**
   ```
   npm run db:import
   ```

### Database Backup

To create a complete database backup:

1. **Check structure:**
   ```
   npm run db:check
   ```

2. **Create dump (simulation):**
   ```
   npm run db:dump
   ```

3. **Create dump (execute):**
   ```
   ./scripts/pg-dump.sh --execute
   ```

### Database Restoration

To restore from a database dump:

```
psql -f database-dump-YYYYMMDD_HHMMSS.sql postgres://<username>:<password>@<hostname>:<port>/<dbname>
```

After restoration, reset sequences:

```
npm run db:reset-sequences
```

## Troubleshooting

### Common Issues

**Import fails due to foreign key constraints:**

The import process handles tables in an order that should respect foreign key constraints. If you encounter issues:

1. Verify that the export contains all required tables
2. Check the import logs for specific errors
3. Try importing tables individually, starting with those that have no foreign key dependencies

**Sequences are out of sync after import:**

Run the sequence reset tool:

```
npm run db:reset-sequences
```

**Large tables cause memory issues during export:**

The export process loads all records into memory before writing. For very large tables, consider:

1. Exporting tables individually
2. Using the database dump approach instead

### Best Practices

1. **Always back up before importing**:
   ```
   npm run db:dump
   ```

2. **Use simulation mode first**:
   Always preview operations in simulation mode before executing

3. **Version control your schema**:
   Regularly generate and commit your schema:
   ```
   npm run db:schema
   ```

4. **Regular exports**:
   Schedule regular exports to maintain backup JSON files

5. **Validation after migration**:
   After migrating data, verify record counts match the source environment