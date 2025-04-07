# Database Dump Utility

This document explains how to use the database dump utility to create a complete PostgreSQL database dump for the Arcem Construction Management Platform.

## Overview

The database dump utility creates a single SQL file containing:
- All tables, views, functions, and triggers
- All constraints and indexes
- All sequence values
- All data from all tables

This dump can be used to migrate the database to another environment or to create a backup.

## Available Scripts

- **Check Database Structure**: `npm run db:check` - Analyzes the database structure before creating a dump
- **Create Database Dump (Simulation)**: `npm run db:dump` - Shows what would be done without actually creating a dump
- **Create Database Dump (Execute)**: `./scripts/pg-dump.sh --execute` - Creates the actual dump file

## Using the Utility

### Step 1: Check the Database Structure

Before creating a dump, it's good practice to check the database structure:

```
npm run db:check
```

This will show:
- Table counts by schema
- Estimated record counts by table
- Total database size
- Constraint counts by type
- Total indexes
- List of sequences with current values

### Step 2: Create a Database Dump (Simulation)

To see what would happen without creating an actual dump:

```
npm run db:dump
```

This will show the exact command that would be executed, including all parameters and the output file name.

Example output:
```
PostgreSQL Database Dump Utility
---------------------------------
This will create a complete database dump at: database-dump-20250406_234621.sql

The dump will include:
- All tables, views, functions, and triggers
- All constraints and indexes
- All sequence values
- All data from all tables

SIMULATION MODE: The following command would be executed:
pg_dump \
  --host=host.example.com \
  --port=5432 \
  --username=username \
  --dbname=dbname \
  --format=plain \
  --create \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > database-dump-20250406_234621.sql

To create the actual dump, run with --execute flag:
  ./pg-dump.sh --execute
```

### Step 3: Create the Actual Dump

To create the actual dump file:

```
./scripts/pg-dump.sh --execute
```

This will create a SQL file in the format `database-dump-YYYYMMDD_HHMMSS.sql`

## Restoring from a Dump

To restore a database from a dump on another system, use:

```
psql -f database-dump-YYYYMMDD_HHMMSS.sql postgres://<username>:<password>@<hostname>:<port>/<dbname>
```

Replace `<username>`, `<password>`, `<hostname>`, `<port>`, and `<dbname>` with the appropriate values for your target database.

## Important Notes

1. The dump file will include `CREATE DATABASE` statements, so it can be used to create a new database from scratch.
2. The dump will use `--clean` and `--if-exists` flags, which means it will drop existing objects before creating new ones.
3. The dump will use `--no-owner` and `--no-privileges` flags, which means it will not include ownership or privilege information.
4. The dump will include all data from all tables, so it may be large if your database has a lot of data.
5. After restoring, you may need to reset sequences using `npm run db:reset-sequences` on the target database.

## Alternative Methods

If you prefer to use JSON files instead of a single SQL dump, you can use:

1. Export to JSON: `npm run db:export`
2. Import from JSON: `npm run db:import`

These methods are documented in the main database tools README.