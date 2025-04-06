import { db } from '../server/db';

// Direct SQL queries since actual database schema doesn't match schema.ts
// (missing created_at columns that are defined in schema.ts)

// Define default categories - omitting createdAt field which has a default
const defaultCategories = [
  {
    name: 'Construction',
    description: 'Articles about construction techniques, trends, and case studies',
    slug: 'construction'
  },
  {
    name: 'Renovation',
    description: 'Articles about renovation projects and home improvement',
    slug: 'renovation'
  },
  {
    name: 'Architecture',
    description: 'Articles about architectural design and concepts',
    slug: 'architecture'
  },
  {
    name: 'Sustainability',
    description: 'Articles about sustainable and eco-friendly building practices',
    slug: 'sustainability'
  },
  {
    name: 'Industry News',
    description: 'Latest news and updates from the construction industry',
    slug: 'industry-news'
  },
  {
    name: 'Technology',
    description: 'How technology is transforming the construction industry',
    slug: 'technology'
  }
];

// Define default tags - omitting createdAt field which has a default
const defaultTags = [
  { name: 'Building', slug: 'building' },
  { name: 'Design', slug: 'design' },
  { name: 'Innovation', slug: 'innovation' },
  { name: 'Green Building', slug: 'green-building' },
  { name: 'Construction Techniques', slug: 'construction-techniques' },
  { name: 'Safety', slug: 'safety' },
  { name: 'Project Management', slug: 'project-management' },
  { name: 'Materials', slug: 'materials' },
  { name: 'Trends', slug: 'trends' },
  { name: 'Equipment', slug: 'equipment' }
];

async function seedBlogCategoriesAndTags() {
  try {
    console.log('Starting to seed blog categories and tags...');
    
    // First, check if there are existing categories
    const existingCategories = await db.query.blogCategories.findMany();
    
    if (existingCategories.length === 0) {
      console.log('No existing categories found. Adding default categories...');
      
      // Insert categories one by one to avoid schema mismatch
      let categoryCount = 0;
      for (const category of defaultCategories) {
        await db.insert(blogCategories).values({
          name: category.name,
          slug: category.slug,
          description: category.description
        });
        categoryCount++;
      }
        
      console.log(`Successfully inserted ${categoryCount} categories`);
    } else {
      console.log(`Found ${existingCategories.length} existing categories. Skipping category insertion.`);
    }
    
    // Check if there are existing tags
    const existingTags = await db.query.blogTags.findMany();
    
    if (existingTags.length === 0) {
      console.log('No existing tags found. Adding default tags...');
      
      // Insert tags one by one to avoid schema mismatch
      let tagCount = 0;
      for (const tag of defaultTags) {
        await db.insert(blogTags).values({
          name: tag.name,
          slug: tag.slug
        });
        tagCount++;
      }
        
      console.log(`Successfully inserted ${tagCount} tags`);
    } else {
      console.log(`Found ${existingTags.length} existing tags. Skipping tag insertion.`);
    }
    
    console.log('Blog categories and tags seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding blog categories and tags:', error);
  }
}

// Run the seeding function
seedBlogCategoriesAndTags();