#!/bin/bash

# Script to export and then import all database data
# Useful for migration between environments

# Create exports directory if it doesn't exist
mkdir -p exports

echo "==== STEP 1: Exporting current database data ===="
npx tsx scripts/run-export.ts

echo ""
echo "==== STEP 2: Importing data to target database ===="
echo "WARNING: This will overwrite data in the target database."
read -p "Do you want to continue? (y/n): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
  npx tsx scripts/run-import.ts
  echo "Migration completed successfully!"
else
  echo "Import cancelled. Export data is still available in the 'exports' directory."
fi
