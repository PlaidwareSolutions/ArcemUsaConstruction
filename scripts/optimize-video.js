#!/usr/bin/env node

/**
 * Script to optimize videos for web display
 * 
 * This script:
 * 1. Takes a video file as input
 * 2. Creates an optimized MP4 version
 * 3. Generates a poster image for video preview
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Check if ffmpeg is installed
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ ffmpeg is not installed. Please install it first.');
  process.exit(1);
}

// Process command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log(`
Usage: node optimize-video.js <input-video> [output-directory] [options]

Arguments:
  input-video       Path to the input video file
  output-directory  Directory to save optimized videos (default: ./public/videos)

Options:
  --poster          Generate a poster image (default: true)
  --quality         Quality level 1-31, lower is better (default: 28)
  --fast            Use fast preset instead of medium (default: false)

Examples:
  node optimize-video.js ./videos/my-video.mp4
  node optimize-video.js ./videos/my-video.mp4 ./public/assets
  node optimize-video.js ./videos/my-video.mp4 --quality=28 --fast=true
  `);
  process.exit(0);
}

// Parse arguments
const inputVideo = args[0];
let outputDir = './public/videos';
let generatePoster = true;
let quality = 28; // Higher value = lower quality but faster encoding
let fastPreset = false;

// Check if second argument is a directory path or options
if (args.length > 1 && !args[1].startsWith('--')) {
  outputDir = args[1];
}

// Parse options
args.forEach(arg => {
  if (arg.startsWith('--poster=')) {
    generatePoster = arg.split('=')[1].toLowerCase() === 'true';
  } else if (arg.startsWith('--quality=')) {
    quality = Number(arg.split('=')[1]);
  } else if (arg.startsWith('--fast=')) {
    fastPreset = arg.split('=')[1].toLowerCase() === 'true';
  }
});

// Validate input file
if (!fs.existsSync(inputVideo)) {
  console.error(`❌ Input file not found: ${inputVideo}`);
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get video information
function getVideoInfo(videoPath) {
  try {
    const output = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration -of json "${videoPath}"`).toString();
    const info = JSON.parse(output);
    return {
      width: parseInt(info.streams[0].width),
      height: parseInt(info.streams[0].height),
      duration: parseFloat(info.streams[0].duration || '0')
    };
  } catch (error) {
    console.error('Error getting video info:', error.message);
    return { width: 0, height: 0, duration: 0 };
  }
}

// Main function to process the video
async function processVideo() {
  console.log(`🎬 Processing video: ${inputVideo}`);
  
  try {
    // Get video info
    const info = getVideoInfo(inputVideo);
    console.log(`📊 Original video: ${info.width}x${info.height}, ${info.duration.toFixed(2)}s`);
    
    // Get the filename without extension
    const fileName = path.basename(inputVideo, path.extname(inputVideo));
    
    // Generate poster image
    if (generatePoster) {
      console.log('🖼️  Generating poster image...');
      const posterPath = path.join(outputDir, `${fileName}-poster.jpg`);
      execSync(`ffmpeg -i "${inputVideo}" -ss 00:00:01 -frames:v 1 -q:v 2 "${posterPath}"`, { stdio: 'inherit' });
      console.log(`✅ Poster image created: ${posterPath}`);
    }
    
    // Create optimized MP4
    console.log(`🔄 Creating optimized MP4...`);
    const mp4Path = path.join(outputDir, `${fileName}-optimized.mp4`);
    const preset = fastPreset ? 'veryfast' : 'medium';
    
    execSync(`ffmpeg -i "${inputVideo}" -c:v libx264 -crf ${quality} -preset ${preset} -c:a aac -b:a 128k -movflags faststart "${mp4Path}"`, { stdio: 'inherit' });
    
    const mp4Size = (fs.statSync(mp4Path).size / (1024 * 1024)).toFixed(2);
    console.log(`✅ MP4 created: ${mp4Path} (${mp4Size} MB)`);
    
    console.log('🎉 Video processing completed successfully!');
    
    // Output HTML video element example
    console.log('\n📝 HTML Video Element Example:');
    console.log(`<video poster="${fileName}-poster.jpg" controls width="${info.width}" height="${info.height}">
  <source src="${fileName}-optimized.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>`);
    
  } catch (error) {
    console.error('❌ Error processing video:', error.message);
    process.exit(1);
  }
}

// Run the main function
processVideo();