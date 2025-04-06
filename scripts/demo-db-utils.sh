#!/bin/bash

# Script to demonstrate database utility functions

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Print a header
print_header() {
  echo -e "\n${BOLD}${BLUE}$1${NC}\n"
}

# Print a section
print_section() {
  echo -e "\n${YELLOW}$1${NC}"
}

# Print success message
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

# Print error message
print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Show main menu
show_menu() {
  clear
  print_header "Database Utility Tools Demo"
  echo -e "This script demonstrates the database utility functions available in this project."
  echo -e "Choose an option below to see how each utility works.\n"
  
  echo -e "1. ${BOLD}Export Database${NC} - Export all tables to JSON files"
  echo -e "2. ${BOLD}View Export Summary${NC} - See counts of exported records by table"
  echo -e "3. ${BOLD}Generate Schema SQL${NC} - Create the complete SQL schema file"
  echo -e "4. ${BOLD}About Import Database${NC} - Learn about the import process (no execution)"
  echo -e "5. ${BOLD}Exit${NC}"
  
  read -p "Enter your choice (1-5): " choice
  
  case $choice in
    1) demo_export ;;
    2) demo_summary ;;
    3) demo_schema ;;
    4) demo_import_info ;;
    5) exit 0 ;;
    *) 
      echo -e "\n${RED}Invalid choice. Press any key to try again.${NC}"
      read -n 1
      show_menu
      ;;
  esac
}

# Demo export database
demo_export() {
  print_header "Database Export Demo"
  echo -e "This utility exports all tables from the database to JSON files."
  echo -e "Files will be saved in the ${BOLD}./database-export${NC} directory."
  echo -e "The script will also generate a complete schema SQL file.\n"
  
  read -p "Would you like to run the export now? (y/n): " confirm
  
  if [[ $confirm == "y" || $confirm == "Y" ]]; then
    print_section "Running database export..."
    node ./scripts/run-db-export.js
    
    print_section "Export completed!"
    echo -e "Press any key to return to the main menu..."
    read -n 1
  fi
  
  show_menu
}

# Demo export summary
demo_summary() {
  print_header "Export Summary Demo"
  echo -e "This utility shows a summary of the exported database records."
  echo -e "It will display the number of records in each table from the export files.\n"
  
  if [ ! -d "./database-export" ]; then
    print_error "The database-export directory does not exist."
    echo -e "You need to run the export utility first."
    echo -e "Press any key to return to the main menu..."
    read -n 1
    show_menu
    return
  fi
  
  print_section "Running export summary..."
  npx tsx ./scripts/export-summary.js
  
  echo -e "\nPress any key to return to the main menu..."
  read -n 1
  show_menu
}

# Demo schema generation
demo_schema() {
  print_header "Schema SQL Generation Demo"
  echo -e "This utility generates a complete SQL schema file from the database."
  echo -e "The file will contain all CREATE TABLE statements, constraints, and indexes."
  echo -e "It will be saved as ${BOLD}./complete-schema.sql${NC}.\n"
  
  read -p "Would you like to generate the schema SQL now? (y/n): " confirm
  
  if [[ $confirm == "y" || $confirm == "Y" ]]; then
    print_section "Generating schema SQL..."
    node ./scripts/run-schema-sql.js
    
    if [ -f "./complete-schema.sql" ]; then
      file_size=$(stat -c %s "./complete-schema.sql" | numfmt --to=iec-i --suffix=B --format="%.2f")
      print_success "Schema SQL generated successfully (${file_size})"
      echo -e "File saved to: ./complete-schema.sql"
    else
      print_error "Failed to generate schema SQL"
    fi
    
    echo -e "\nPress any key to return to the main menu..."
    read -n 1
  fi
  
  show_menu
}

# Demo import database info
demo_import_info() {
  print_header "Database Import Information"
  echo -e "${RED}⚠️  WARNING: The import process deletes all existing data!${NC}\n"
  
  echo -e "The import utility does the following:"
  echo -e "1. Reads JSON files from the ${BOLD}./database-export${NC} directory"
  echo -e "2. Clears all existing data from the database"
  echo -e "3. Imports the data from the JSON files"
  echo -e "4. Shows a summary of imported records\n"
  
  echo -e "${YELLOW}Typical Use Cases:${NC}"
  echo -e "- Setting up a new development environment"
  echo -e "- Migrating data between environments"
  echo -e "- Restoring from backups\n"
  
  echo -e "${BLUE}To run the actual import:${NC}"
  echo -e "node ./scripts/run-db-import.js\n"
  
  echo -e "${RED}⚠️  IMPORTANT:${NC} Always backup your data before importing!"
  
  echo -e "\nPress any key to return to the main menu..."
  read -n 1
  show_menu
}

# Start the demo
show_menu