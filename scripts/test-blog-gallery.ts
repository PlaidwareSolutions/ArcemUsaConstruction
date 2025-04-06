import { db } from '../server/db';
import { blogGallery } from '../shared/schema';

async function testBlogGalleryInsert() {
  console.log('Starting test for blog gallery insertion...');
  
  try {
    // Check if there are any existing blog posts
    const posts = await db.query.blogPosts.findMany({
      limit: 1
    });
    
    if (posts.length === 0) {
      console.error('No blog posts found in the database.');
      return;
    }
    
    const postId = posts[0].id;
    console.log(`Using blog post ID: ${postId}`);
    
    // Insert a test record
    const result = await db.insert(blogGallery).values({
      postId: postId,
      imageUrl: 'https://test-image-url.jpg',
      caption: 'Test caption',
      order: 0
    }).returning();
    
    console.log('Successfully inserted blog gallery image:');
    console.log(result[0]);
    
    // Verify it exists
    const allGalleryImages = await db.select().from(blogGallery);
    console.log(`Total gallery images in database: ${allGalleryImages.length}`);
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testBlogGalleryInsert()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err))
  .finally(() => process.exit());