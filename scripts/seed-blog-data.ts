import { db } from '../server/db';
import { blogCategories, blogTags } from '../shared/schema';
import { generateSlug } from '../client/src/lib/utils';

// Define default categories
const defaultCategories = [
  {
    name: 'Construction',
    description: 'Articles about construction techniques, trends, and case studies'
  },
  {
    name: 'Renovation',
    description: 'Articles about renovation projects and home improvement'
  },
  {
    name: 'Architecture',
    description: 'Articles about architectural design and concepts'
  },
  {
    name: 'Sustainability',
    description: 'Articles about sustainable and eco-friendly building practices'
  },
  {
    name: 'Industry News',
    description: 'Latest news and updates from the construction industry'
  }
];

// Define default tags
const defaultTags = [
  { name: 'Residential' },
  { name: 'Commercial' },
  { name: 'Green Building' },
  { name: 'Interior Design' },
  { name: 'Project Management' },
  { name: 'Building Materials' },
  { name: 'Safety' },
  { name: 'Technology' },
  { name: 'Cost Efficiency' },
  { name: 'Design Trends' }
];

async function seedBlogData() {
  console.log('Seeding default blog categories and tags...');
  
  // Insert categories
  for (const category of defaultCategories) {
    try {
      await db.insert(blogCategories).values({
        name: category.name,
        slug: generateSlug(category.name),
        description: category.description
      }).onConflictDoNothing();
      
      console.log(`Added category: ${category.name}`);
    } catch (error) {
      console.error(`Error adding category ${category.name}:`, error);
    }
  }
  
  // Insert tags
  for (const tag of defaultTags) {
    try {
      await db.insert(blogTags).values({
        name: tag.name,
        slug: generateSlug(tag.name)
      }).onConflictDoNothing();
      
      console.log(`Added tag: ${tag.name}`);
    } catch (error) {
      console.error(`Error adding tag ${tag.name}:`, error);
    }
  }
  
  console.log('Blog data seeding completed!');
}

// Execute the seeding
seedBlogData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error during blog data seeding:', err);
    process.exit(1);
  });