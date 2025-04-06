#!/bin/bash

# Script to export all database data
echo "Starting database export..."
npx tsx scripts/run-export.ts
echo "Export script completed!"
