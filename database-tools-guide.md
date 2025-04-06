# Database Management Tools Guide

This document provides information about the database management tools available in this project.

## Overview

The database tooling suite provides a comprehensive set of utilities to:

1. Export database content to JSON files
2. Import database content from JSON files
3. Generate complete SQL schema
4. Reset sequence values

## Available Tools

### Database Export

Exports all database tables to JSON files in the `database-export` directory.

```bash
node scripts/run-db-export.js
```

### Database Import

Imports data from JSON files in the `database-export` directory into the database.

**WARNING**: This tool will truncate existing tables before importing data. Use with caution.

```bash
node scripts/run-db-import.js
```

### Schema SQL Generation

Generates a complete SQL schema including tables, constraints, indexes, and sequence reset statements.

```bash
node scripts/run-schema-sql.js
```

### Sequence Reset

Resets all sequence values to the current maximum ID value + 1. This is useful after importing data to ensure that new records get correct ID values.

```bash
node scripts/run-sequence-reset.js
```

## Workflow Examples

### Migrating Database Between Environments

1. Export data from source environment:
   ```bash
   node scripts/run-db-export.js
   ```

2. Copy the `database-export` directory to the target environment

3. Import data in the target environment:
   ```bash
   node scripts/run-db-import.js
   ```

4. Reset sequences in the target environment:
   ```bash
   node scripts/run-sequence-reset.js
   ```

### Fixing Sequence Values

If you encounter errors like "duplicate key value violates unique constraint" when inserting new records, the sequence values might be out of sync. Use the sequence reset tool:

```bash
node scripts/run-sequence-reset.js
```

## Implementation Details

- All export/import operations use raw SQL queries via the `postgres` library
- Sequence reset operations identify and update all sequences associated with ID columns
- Schema generation includes sequence reset statements in the generated SQL file
- Database operations are performed with proper transaction handling and error reporting