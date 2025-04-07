# Database Tools for Arcem Construction Management Platform

This README provides an overview of the database utilities and tools available for managing the Arcem Construction Management Platform database.

## Available Tools

### Database Export and Import

- **Export Database**: `npm run db:export` - Exports all data from the current database to JSON files in the database-export directory.
- **Import Database**: `npm run db:import` - Imports data from the database-export directory into the current database.
- **Database Summary**: After export, a summary of exported records by table is displayed.

### Database Schema Management

- **Generate Schema SQL**: `npm run db:schema` - Generates complete DDL SQL from the current database, including sequences.
- **Reset Sequences**: `npm run db:reset-sequences` - Resets PostgreSQL sequences based on current table data.

### Database Backup and Restore

- **Create Database Dump**: `npm run db:dump` - Creates a complete database dump containing both schema and data.
- **Check Database Structure**: `npm run db:check` - Analyzes the database structure, tables, and sequences.

## Understanding the Tools

### Export Database

This tool exports all data from the current database to JSON files. Each table is exported to a separate file in the database-export directory.

```
npm run db:export
```

### Import Database

This tool imports data from JSON files in the database-export directory into the current database. It will clear the existing data first.

```
npm run db:import
```

### Generate Schema SQL

This tool generates a complete DDL SQL script that can recreate the database schema.

```
npm run db:schema
```

### Reset Sequences

This tool resets all PostgreSQL sequences to the correct values based on the current data.

```
npm run db:reset-sequences
```

### Create Database Dump

This tool creates a complete database dump containing both schema and data. By default, it runs in simulation mode.

```
npm run db:dump
```

To create an actual dump:

```
./scripts/pg-dump.sh --execute
```

### Check Database Structure

This tool analyzes the database structure, tables, and sequences.

```
npm run db:check
```

## Migration Process

To migrate data between environments:

1. **Export data** from the source environment:
   ```
   npm run db:export
   ```

2. Copy the database-export directory to the target environment.

3. **Import data** into the target environment:
   ```
   npm run db:import
   ```

4. **Reset sequences** in the target environment:
   ```
   npm run db:reset-sequences
   ```

## Database Dump Process

To create a complete database dump:

1. **Check the database structure**:
   ```
   npm run db:check
   ```

2. **Create a database dump** (simulation mode):
   ```
   npm run db:dump
   ```

3. **Create an actual database dump**:
   ```
   ./scripts/pg-dump.sh --execute
   ```

## Safety Measures

- Import operations will clear existing data in the target tables.
- The import tool requires confirmation before proceeding.
- Database dump operations run in simulation mode by default.
- Sequence reset operations are safe to run multiple times.