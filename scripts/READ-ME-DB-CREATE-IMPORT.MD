I've created three data management utilities to help with database operations:

Database Export Script (scripts/export-database.ts)

This script creates a backup of your entire database by exporting all tables to JSON files
The files are saved in a database-export directory
It's 100% read-only and doesn't modify your database in any way
Database Schema Generation (scripts/generate-schema-sql.ts)

This script generates a complete SQL schema file with all tables, constraints, and indices
Useful for documentation or creating a new database with the same structure
It's also 100% read-only and doesn't modify your database
Database Import Script (scripts/import-database.ts)

This script is used ONLY when setting up a new environment or during data migration
It requires multiple confirmations before proceeding
Has strong safety measures to prevent accidental data loss
I've also created Node.js wrapper scripts to run these utilities:

scripts/run-db-export.js - For exporting database data
scripts/run-db-import.js - For importing database data (with warnings)
scripts/run-schema-sql.js - For generating SQL schema
To use these tools:

# To export your database (safe, read-only operation)
node scripts/run-db-export.js
# To generate SQL schema (safe, read-only operation)
node scripts/run-schema-sql.js
# To import data (USE WITH CAUTION - only in new environments)
node scripts/run-db-import.js
The export and schema generation scripts are completely safe and will never modify your database. The import script has multiple safety prompts that require explicit confirmation before proceeding.

