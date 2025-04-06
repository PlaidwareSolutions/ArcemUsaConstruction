#!/bin/bash

# Script to import all database data
echo "Starting database import..."
npx tsx scripts/run-import.ts
echo "Import script completed!"
