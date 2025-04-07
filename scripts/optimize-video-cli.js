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

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

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
    // Check command line arguments
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.error('Error: Missing input video file');
      console.log('Usage: node optimize-video-cli.js inputVideo [outputDir] [resolution] [bitrate]');
      return;
    }
    
    // Validate ffmpeg installation
    await checkFfmpeg();
    
    const inputVideo = args[0];
    
    // Check if input file exists
    if (!fs.existsSync(inputVideo)) {
      console.error(`Error: File not found at ${inputVideo}`);
      return;
    }
    
    // Get the base name, extension and directory
    const inputExt = path.extname(inputVideo);
    const inputBase = path.basename(inputVideo, inputExt);
    const inputDir = path.dirname(inputVideo);
    
    // Get optional parameters
    const outputDir = args[1] || inputDir;
    const targetRes = args[2] || ''; // e.g., 1280x720
    const targetBitrate = args[3] || ''; // e.g., 1500 (kbps)
    
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
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

processVideo();