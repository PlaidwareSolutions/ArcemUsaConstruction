#!/bin/bash

# Database Utility Tools for Arcem Construction Management Platform
# This script provides convenient access to all database management tools

# Define colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display header
echo -e "${BLUE}=======================================================${NC}"
echo -e "${BLUE}   Arcem Construction Database Management Tools${NC}"
echo -e "${BLUE}=======================================================${NC}"

# Function to display usage information
function show_usage {
  echo -e "${YELLOW}Usage:${NC} ./db-tools.sh [command]"
  echo
  echo -e "${YELLOW}Available commands:${NC}"
  echo -e "  ${GREEN}export${NC}            Export database to JSON files"
  echo -e "  ${GREEN}import${NC}            Import database from JSON files"
  echo -e "  ${GREEN}schema${NC}            Generate complete schema SQL"
  echo -e "  ${GREEN}reset-sequences${NC}   Reset database sequences to match data"
  echo -e "  ${GREEN}dump${NC}              Create complete database dump (simulation mode)"
  echo -e "  ${GREEN}dump-execute${NC}      Create complete database dump (execute mode)"
  echo -e "  ${GREEN}check${NC}             Check database structure"
  echo -e "  ${GREEN}help${NC}              Display this help message"
  echo
  echo -e "${YELLOW}Examples:${NC}"
  echo -e "  ./db-tools.sh export"
  echo -e "  ./db-tools.sh dump"
  echo
}

# Check if a command was provided
if [ $# -eq 0 ]; then
  show_usage
  exit 1
fi

# Process command
case "$1" in
  export)
    echo -e "${GREEN}Exporting database to JSON files...${NC}"
    node scripts/run-db-export.js
    ;;
  import)
    echo -e "${YELLOW}Importing database from JSON files...${NC}"
    echo -e "${RED}Warning: This will clear existing data in the target tables.${NC}"
    node scripts/run-db-import.js
    ;;
  schema)
    echo -e "${GREEN}Generating complete schema SQL...${NC}"
    node scripts/run-schema-sql.js
    ;;
  reset-sequences)
    echo -e "${GREEN}Resetting database sequences...${NC}"
    node scripts/run-sequence-reset.js
    ;;
  dump)
    echo -e "${GREEN}Creating database dump (simulation mode)...${NC}"
    node scripts/run-db-dump.js
    ;;
  dump-execute)
    echo -e "${YELLOW}Creating database dump (execute mode)...${NC}"
    echo -e "${RED}Warning: This will write a complete database dump file.${NC}"
    ./scripts/pg-dump.sh --execute
    ;;
  check)
    echo -e "${GREEN}Checking database structure...${NC}"
    node scripts/run-db-check.js
    ;;
  help)
    show_usage
    ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    show_usage
    exit 1
    ;;
esac

echo -e "${BLUE}=======================================================${NC}"
echo -e "${GREEN}Operation complete.${NC}"
echo -e "${BLUE}=======================================================${NC}"