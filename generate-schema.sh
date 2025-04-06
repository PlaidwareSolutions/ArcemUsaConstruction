#!/bin/bash

echo "Generating database schema SQL..."
npx tsx scripts/run-generate-ddl.ts

if [ $? -eq 0 ]; then
  echo "Schema generation successful! The schema file is at database-schema.sql"
else
  echo "Error generating schema"
  exit 1
fi
