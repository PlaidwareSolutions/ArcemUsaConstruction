#!/bin/bash

# Script to seed database from exported data
echo "Starting database seeding..."
npx tsx scripts/seed-full-database.ts
echo "Seeding script completed!"
