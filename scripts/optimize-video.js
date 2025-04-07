/**
 * Script to optimize videos for web display
 * 
 * This script:
 * 1. Takes a video file as input
 * 2. Creates an optimized MP4 version
 * 3. Generates a poster image for video preview
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const execAsync = promisify(exec);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Check if ffmpeg is installed
function checkFfmpeg() {
  return new Promise((resolve, reject) => {
    exec('ffmpeg -version', (error) => {
      if (error) {
        console.error('Error: ffmpeg is not installed or not in the PATH');
        console.error('Please install ffmpeg to use this script');
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Get video information using ffprobe
function getVideoInfo(videoPath) {
  return new Promise((resolve, reject) => {
    exec(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,bit_rate -of json "${videoPath}"`, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      try {
        const info = JSON.parse(stdout);
        resolve(info.streams[0]);
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function processVideo() {
  try {
    // Validate ffmpeg installation
    await checkFfmpeg();
    
    // Request input video path
    const inputVideo = await question('Enter the path to the input video: ');
    if (!fs.existsSync(inputVideo)) {
      console.error(`Error: File not found at ${inputVideo}`);
      rl.close();
      return;
    }
    
    // Get the base name, extension and directory
    const inputExt = path.extname(inputVideo);
    const inputBase = path.basename(inputVideo, inputExt);
    const inputDir = path.dirname(inputVideo);
    
    // Set default output directory and paths
    let outputDir = await question(`Enter output directory (default: ${inputDir}): `);
    outputDir = outputDir || inputDir;
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Set output paths
    const outputVideo = path.join(outputDir, `${inputBase}-optimized.mp4`);
    const posterImage = path.join(outputDir, `${inputBase}-poster.jpg`);
    
    // Get video details
    console.log('Analyzing video...');
    const videoInfo = await getVideoInfo(inputVideo);
    console.log('Video information:');
    console.log(`  - Resolution: ${videoInfo.width}x${videoInfo.height}`);
    console.log(`  - Duration: ${videoInfo.duration} seconds`);
    console.log(`  - Bitrate: ${videoInfo.bit_rate ? Math.round(videoInfo.bit_rate / 1000) + ' kbps' : 'unknown'}`);
    
    // Ask for target resolution
    let targetRes = await question('Enter target resolution (e.g., 1280x720, default: keep original): ');
    
    // Ask for target bitrate
    let targetBitrate = await question('Enter target bitrate in kbps (e.g., 1500, default: auto): ');
    
    // Prepare ffmpeg command
    let ffmpegCmd = 'ffmpeg -i "' + inputVideo + '" -c:v libx264 -preset slow -pix_fmt yuv420p';
    
    // Add resolution parameters if specified
    if (targetRes) {
      ffmpegCmd += ` -vf scale=${targetRes}`;
    }
    
    // Add bitrate parameters if specified
    if (targetBitrate) {
      ffmpegCmd += ` -b:v ${targetBitrate}k`;
    }
    
    // Add audio parameters
    ffmpegCmd += ' -c:a aac -b:a 128k';
    
    // Add output file
    ffmpegCmd += ` -y "${outputVideo}"`;
    
    console.log('\nOptimizing video...');
    console.log(`Command: ${ffmpegCmd}`);
    
    const startTime = Date.now();
    await execAsync(ffmpegCmd);
    const endTime = Date.now();
    
    // Get file sizes
    const inputStats = fs.statSync(inputVideo);
    const outputStats = fs.statSync(outputVideo);
    const inputSize = inputStats.size / (1024 * 1024);
    const outputSize = outputStats.size / (1024 * 1024);
    const compressionRatio = (1 - (outputSize / inputSize)) * 100;
    
    console.log('\nVideo optimization complete!');
    console.log(`Time taken: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    console.log(`Original size: ${inputSize.toFixed(2)} MB`);
    console.log(`Optimized size: ${outputSize.toFixed(2)} MB`);
    console.log(`Compression ratio: ${compressionRatio.toFixed(2)}%`);
    
    // Generate poster image
    console.log('\nGenerating poster image...');
    const posterCmd = `ffmpeg -i "${outputVideo}" -ss 00:00:01 -vframes 1 -y "${posterImage}"`;
    await execAsync(posterCmd);
    
    console.log(`Poster image saved to: ${posterImage}`);
    console.log(`Optimized video saved to: ${outputVideo}`);
    
    rl.close();
    
  } catch (error) {
    console.error('Error:', error);
    rl.close();
  }
}

processVideo();