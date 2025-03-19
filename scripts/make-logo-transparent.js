const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function makeLogoTransparent() {
  try {
    const inputPath = path.join(__dirname, '../public/uploads/images/arcem-logo-new.png');
    const outputPath = path.join(__dirname, '../public/uploads/images/arcem-logo-transparent.png');
    
    console.log('Processing image:', inputPath);
    
    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Using ImageMagick to make the black background transparent
    // This works well for logos where the background is a solid color
    return new Promise((resolve, reject) => {
      const command = `convert "${inputPath}" -transparent black "${outputPath}"`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${error.message}`);
          return reject(error);
        }
        if (stderr) {
          console.error(`Command stderr: ${stderr}`);
        }
        console.log('Logo with transparent background created at:', outputPath);
        resolve(outputPath);
      });
    });
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

makeLogoTransparent();