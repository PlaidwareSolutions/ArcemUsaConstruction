# Database Management Scripts

This directory contains utility scripts for managing the database, exporting data, and generating schema SQL. These scripts are essential for database backups, migrations, and development environment setup.

## Available Scripts

### Database Export

- export-database.ts: Exports all tables from the database to JSON files in the `database-export` directory.
- run-db-export.js: Wrapper script that runs the export and generates schema SQL.

### Database Import

- import-database.ts: Imports data from JSON files in the `database-export` directory into the database.
- run-db-import.js: Wrapper script with confirmation prompts before running import.

### Schema Generation

- generate-schema-sql.ts: Generates a complete SQL schema of the database into `complete-schema.sql`.
- run-schema-sql.js: Wrapper script for generating the schema SQL.

### Utility Scripts

- export-summary.js: Provides a summary of exported database content, showing record counts by table.
- demo-db-utils.sh: Interactive demo script showing the usage of all utility scripts.

## Usage Instructions

### Exporting Database Data

To export all data from your database:

    node ./scripts/run-db-export.js

This will:
1. Export all tables to JSON files in the `database-export` directory
2. Generate the complete SQL schema to `complete-schema.sql`
3. Show a summary of exported records

### Importing Database Data

To import data into a database:

    node ./scripts/run-db-import.js

**Warning**: This will delete all existing data in the database before importing.

The script will:
1. Show a list of tables to be imported
2. Ask for confirmation before proceeding
3. Clear all tables (respecting foreign key constraints)
4. Import data from the JSON files
5. Show a summary of imported records

### Generating Schema SQL

To generate just the schema SQL:

    node ./scripts/run-schema-sql.js

This will create a `complete-schema.sql` file with the complete database structure (tables, constraints, indexes).

### Viewing Export Summary

To see a summary of the exported data:

    npx tsx ./scripts/export-summary.js

This will show the number of records exported from each table.

### Interactive Demo

To see an interactive demo of all utilities:

    ./scripts/demo-db-utils.sh

This will guide you through using each utility with explanations.

## Best Practices

1. Run exports regularly to maintain up-to-date backups
2. Use imports only when setting up new environments or for recovery
3. Always verify the export summary before performing imports
4. Keep the exported files in version control for historical tracking
5. Regenerate the schema SQL whenever database structure changes
