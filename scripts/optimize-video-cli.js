#!/usr/bin/env node

/**
 * Command-line script to optimize videos for web display
 * 
 * Usage: node optimize-video-cli.js inputVideo [outputDir] [resolution] [bitrate]
 * 
 * Examples:
 *   node optimize-video-cli.js video.mp4
 *   node optimize-video-cli.js video.mp4 ./optimized/
 *   node optimize-video-cli.js video.mp4 ./optimized/ 1280x720
 *   node optimize-video-cli.js video.mp4 ./optimized/ 1280x720 1500
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Check arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Error: Missing input video path.');
  console.error('Usage: node optimize-video-cli.js inputVideo [outputDir] [resolution] [bitrate]');
  process.exit(1);
}

const inputPath = args[0];
const outputDir = args[1] ? args[1] : path.dirname(inputPath);
const resolution = args[2] || '';
const bitrate = args[3] || '';

// Check if ffmpeg is installed
function checkFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('Error: ffmpeg is not installed or not in the PATH.');
    console.error('Please install ffmpeg to use this script.');
    return false;
  }
}

// Get video information using ffprobe
function getVideoInfo(videoPath) {
  try {
    const output = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,codec_name -of json "${videoPath}"`).toString();
    return JSON.parse(output).streams[0];
  } catch (error) {
    console.error('Error getting video information:', error);
    return null;
  }
}

async function processVideo() {
  if (!checkFfmpeg()) {
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File does not exist: ${inputPath}`);
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
  }

  const videoInfo = getVideoInfo(inputPath);
  if (!videoInfo) {
    console.error('Error: Could not get video information.');
    process.exit(1);
  }

  console.log('Video information:');
  console.log(`Codec: ${videoInfo.codec_name}`);
  console.log(`Resolution: ${videoInfo.width}x${videoInfo.height}`);
  console.log(`Duration: ${videoInfo.duration} seconds`);

  const parsedPath = path.parse(inputPath);
  const baseName = parsedPath.name;
  
  // Define output paths
  const outputVideoPath = path.join(outputDir, `${baseName}-optimized.mp4`);
  const posterPath = path.join(outputDir, `${baseName}-poster.jpg`);

  let scaleFilter = '';
  if (resolution && resolution.match(/^\d+x\d+$/)) {
    scaleFilter = `-vf scale=${resolution}`;
  }

  let bitrateOption = '';
  if (bitrate && !isNaN(parseInt(bitrate))) {
    bitrateOption = `-b:v ${bitrate}k`;
  }
  
  console.log('Processing video...');
  
  // Optimize the video
  try {
    const command = `ffmpeg -i "${inputPath}" ${scaleFilter} ${bitrateOption} -c:v libx264 -preset slow -profile:v main -level 3.1 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k "${outputVideoPath}"`;
    console.log(`Running command: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
    // Extract poster image from the middle of the video
    const posterCommand = `ffmpeg -i "${outputVideoPath}" -ss ${parseFloat(videoInfo.duration) / 2} -vframes 1 -quality 90 "${posterPath}"`;
    console.log(`Generating poster image: ${posterCommand}`);
    execSync(posterCommand, { stdio: 'inherit' });
    
    console.log('\nVideo processing completed!');
    console.log(`Optimized video: ${outputVideoPath}`);
    console.log(`Poster image: ${posterPath}`);
    
    // Get file sizes for comparison
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputVideoPath).size;
    const compressionRatio = (originalSize / optimizedSize).toFixed(2);
    
    console.log('\nFile size comparison:');
    console.log(`Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Optimized: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Compression ratio: ${compressionRatio}x`);
  } catch (error) {
    console.error('Error processing video:', error);
    process.exit(1);
  }
}

processVideo();