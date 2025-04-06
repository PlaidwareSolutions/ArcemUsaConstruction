#!/bin/bash

# Create a temporary file
temp_file=$(mktemp)

# Process the Services.tsx file line by line
while IFS= read -r line; do
  # Replace "reveal" with "reveal active" but not if "active" is already there
  if [[ $line == *"reveal"* && $line != *"reveal active"* ]]; then
    echo "${line/reveal/reveal active}" >> "$temp_file"
  else
    echo "$line" >> "$temp_file"
  fi
done < client/src/pages/Services.tsx

# Replace the original file with the modified one
mv "$temp_file" client/src/pages/Services.tsx

# Clean up
echo "Services.tsx updated"
