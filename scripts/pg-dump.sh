#!/bin/bash

# PostgreSQL dump script for creating a complete database dump with schema and data
# This script creates a single SQL file that can be used for database migration
# between different environments.

# Exit immediately if a command exits with a non-zero status
set -e

# Generate timestamp for filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_FILE="database-dump-${TIMESTAMP}.sql"

# Check if --execute flag was provided
EXECUTE=false
for arg in "$@"; do
  if [ "$arg" == "--execute" ]; then
    EXECUTE=true
  fi
done

# Display information
echo "PostgreSQL Database Dump Utility"
echo "---------------------------------"
echo "This will create a complete database dump at: $DUMP_FILE"
echo
echo "The dump will include:"
echo "- All tables, views, functions, and triggers"
echo "- All constraints and indexes"
echo "- All sequence values"
echo "- All data from all tables"
echo

# Check PostgreSQL environment variables
if [ -z "$PGHOST" ] || [ -z "$PGPORT" ] || [ -z "$PGUSER" ] || [ -z "$PGDATABASE" ]; then
  echo "ERROR: Missing PostgreSQL environment variables."
  echo "Please set these environment variables:"
  echo "  PGHOST - Database host"
  echo "  PGPORT - Database port"
  echo "  PGUSER - Database username"
  echo "  PGDATABASE - Database name"
  echo "  PGPASSWORD - Database password (or use .pgpass file)"
  exit 1
fi

# Construct dump command
PG_DUMP_CMD="pg_dump \\
  --host=${PGHOST} \\
  --port=${PGPORT} \\
  --username=${PGUSER} \\
  --dbname=${PGDATABASE} \\
  --format=plain \\
  --create \\
  --clean \\
  --if-exists \\
  --no-owner \\
  --no-privileges \\
  > ${DUMP_FILE}"

# Run in simulation mode unless --execute flag is provided
if [ "$EXECUTE" = false ]; then
  echo "SIMULATION MODE: The following command would be executed:"
  echo "$PG_DUMP_CMD"
  echo
  echo "To create the actual dump, run with --execute flag:"
  echo "  ./pg-dump.sh --execute"
  echo
  echo "To restore this dump on another system, use:"
  echo "  psql -f ${DUMP_FILE} postgres://<username>:<password>@<hostname>:<port>/<dbname>"
  exit 0
fi

# Execute dump command
echo "Creating database dump..."
pg_dump \
  --host=${PGHOST} \
  --port=${PGPORT} \
  --username=${PGUSER} \
  --dbname=${PGDATABASE} \
  --format=plain \
  --create \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  > ${DUMP_FILE}

# Check if dump was successful
if [ $? -eq 0 ]; then
  # Get file size
  FILE_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
  echo "Database dump created successfully: $DUMP_FILE"
  echo "File size: $FILE_SIZE"
  echo
  echo "To restore this dump on another system, use:"
  echo "  psql -f ${DUMP_FILE} postgres://<username>:<password>@<hostname>:<port>/<dbname>"
else
  echo "Error creating database dump."
  exit 1
fi
