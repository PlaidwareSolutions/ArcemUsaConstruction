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
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
    rl.close();
    return;
  }

  rl.question('Enter the path to the video file: ', async (inputPath) => {
    if (!fs.existsSync(inputPath)) {
      console.error('Error: File does not exist.');
      rl.close();
      return;
    }

    const videoInfo = getVideoInfo(inputPath);
    if (!videoInfo) {
      console.error('Error: Could not get video information.');
      rl.close();
      return;
    }

    console.log('Video information:');
    console.log(`Codec: ${videoInfo.codec_name}`);
    console.log(`Resolution: ${videoInfo.width}x${videoInfo.height}`);
    console.log(`Duration: ${videoInfo.duration} seconds`);

    const parsedPath = path.parse(inputPath);
    const outputDir = path.dirname(inputPath);
    const baseName = parsedPath.name;
    
    // Define output paths
    const outputVideoPath = path.join(outputDir, `${baseName}-optimized.mp4`);
    const posterPath = path.join(outputDir, `${baseName}-poster.jpg`);

    rl.question('Enter target resolution (e.g., 1280x720) or press enter for original: ', (resolution) => {
      let scaleFilter = '';
      if (resolution && resolution.match(/^\d+x\d+$/)) {
        scaleFilter = `-vf scale=${resolution}`;
      }

      rl.question('Enter target bitrate in kbps (e.g., 1500) or press enter for automatic: ', (bitrate) => {
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
        }
        
        rl.close();
      });
    });
  });
}

processVideo();