# Database Export

This directory contains exported data from the database in JSON format. These files can be used to restore the database or migrate data between environments.

## Files

Each JSON file corresponds to a table in the database. The files contain all records from the respective tables.

## Usage

### Exporting Data

To create or update these export files, run:

```bash
node ./scripts/run-db-export.js
```

This will export all tables from the database to this directory.

### Viewing Export Summary

To see a summary of the exported data, run:

```bash
npx tsx ./scripts/export-summary.js
```

This will show the number of records exported from each table.

### Importing Data

To import this data into a database, run:

```bash
node ./scripts/run-db-import.js
```

**WARNING**: This will delete all existing data in the target database. Only use this command when setting up a new environment or when you're sure you want to replace all existing data.

### Schema SQL

The schema of the database is also exported to `./complete-schema.sql`. This file contains the SQL statements needed to recreate the database structure without any data.

To generate just the schema SQL, run:

```bash
node ./scripts/run-schema-sql.js
```

## Best Practices

1. **Regular Backups**: Run the export regularly to ensure you have recent backups of your data.
2. **Version Control**: Commit the exported files to version control to track changes over time.
3. **Sensitive Data**: Be careful with sensitive data in these exports. Consider using environment-specific configurations to mask sensitive information.
4. **Schema Changes**: When making schema changes, regenerate the schema SQL file to keep it up-to-date.

## Table Relationships

These exports maintain referential integrity through ID references. The import script respects these relationships by importing tables in the correct order to maintain foreign key constraints.
