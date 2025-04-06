#!/bin/bash

# Update files to immediately activate reveal animations
# Skip home page components

# Files to update
FILES=(
  "client/src/pages/BlogPost.tsx"
  "client/src/pages/JoinTogether.tsx"
  "client/src/pages/Blog.tsx"
  "client/src/pages/Resources.tsx"
  "client/src/pages/ProjectDetail.tsx"
  "client/src/pages/About.tsx"
  "client/src/pages/Subcontractors.tsx"
  "client/src/pages/JoinUs.tsx"
  "client/src/pages/Contact.tsx"
  "client/src/pages/Services.tsx"
  "client/src/pages/Projects.tsx"
  "client/src/pages/ServiceDetail.tsx"
  "client/src/pages/CareerDetail.tsx"
  "client/src/pages/Careers.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file"
    # Replace initializeRevealEffects() with initializeRevealEffects(true)
    sed -i 's/initializeRevealEffects()/initializeRevealEffects(true)/g' "$file"
  else
    echo "File $file not found"
  fi
done

echo "Update complete"
