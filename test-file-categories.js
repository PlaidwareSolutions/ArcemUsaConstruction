// Test script to check the file categories API
import axios from 'axios';

async function testFileCategories() {
  try {
    console.log('Testing file categories API...');
    
    const response = await axios.get('http://localhost:3000/api/uploadthing/file-categories');
    const data = response.data;
    
    console.log('API Response structure:');
    console.log(`- projects: ${Array.isArray(data.projects) ? data.projects.length : 'Not found'}`);
    console.log(`- projectGalleryMap: ${typeof data.projectGalleryMap === 'object' ? Object.keys(data.projectGalleryMap).length : 'Not found'}`);
    console.log(`- serviceGalleryMap: ${typeof data.serviceGalleryMap === 'object' ? Object.keys(data.serviceGalleryMap).length : 'Not found'}`);
    console.log(`- quoteAttachmentsMap: ${typeof data.quoteAttachmentsMap === 'object' ? Object.keys(data.quoteAttachmentsMap).length : 'Not found'}`);
    console.log(`- quoteRequests: ${Array.isArray(data.quoteRequests) ? data.quoteRequests.length : 'Not found'}`);
    
    // Log the first quote attachment entry if available
    if (data.quoteAttachmentsMap && Object.keys(data.quoteAttachmentsMap).length > 0) {
      const firstKey = Object.keys(data.quoteAttachmentsMap)[0];
      console.log('\nFirst quote attachment:', data.quoteAttachmentsMap[firstKey]);
    } else {
      console.log('\nNo quote attachments found in the data');
    }
    
    // Log the first quote request if available
    if (data.quoteRequests && data.quoteRequests.length > 0) {
      console.log('\nFirst quote request:', data.quoteRequests[0]);
    } else {
      console.log('\nNo quote requests found in the data');
    }
    
  } catch (error) {
    console.error('Error testing file categories API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFileCategories();