#!/bin/bash

# Script to export all database data and generate schema
echo "Starting database export..."
npx tsx scripts/run-export.ts
echo "Export script completed!"

echo "Generating database schema..."
npx tsx scripts/run-generate-ddl.ts
echo "Schema generation completed!"

echo "All done! Database data exported to /exports directory and schema to database-schema.sql"
