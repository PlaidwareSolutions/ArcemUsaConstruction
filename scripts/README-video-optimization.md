# Video Optimization Tool

This utility script optimizes videos for web display by generating smaller, more efficient versions suitable for embedding in websites.

## Features

- Creates an optimized MP4 video with configurable quality
- Generates a poster image for video preview
- Supports multiple quality and speed presets
- Outputs HTML video element code for easy implementation

## Requirements

- Node.js
- ffmpeg (must be installed on the system)

## Installation

The script requires ffmpeg to be installed on your system.

```bash
# Install ffmpeg on Ubuntu/Debian
sudo apt install ffmpeg

# Install ffmpeg on MacOS (using Homebrew)
brew install ffmpeg

# Install ffmpeg on Windows (using Chocolatey)
choco install ffmpeg
```

## Usage

```bash
node optimize-video.js <input-video> [output-directory] [options]
```

### Arguments

- `input-video` - Path to the input video file
- `output-directory` - Directory to save optimized videos (default: ./public/videos)

### Options

- `--poster=true|false` - Generate a poster image (default: true)
- `--quality=1-31` - Quality level, lower is better but slower (default: 28)
- `--fast=true|false` - Use fast preset instead of medium (default: false)

### Examples

```bash
# Basic usage (saves to ./public/videos/)
node optimize-video.js ./videos/my-video.mp4

# Specify output directory
node optimize-video.js ./videos/my-video.mp4 ./public/assets

# Higher quality (lower number = higher quality)
node optimize-video.js ./videos/my-video.mp4 --quality=23

# Fast encoding (lower quality but faster)
node optimize-video.js ./videos/my-video.mp4 --fast=true
```

## Output Files

The script generates the following files in the output directory:

- `[filename]-optimized.mp4` - Optimized MP4 video
- `[filename]-poster.jpg` - Poster image (first frame of the video)

## HTML Implementation

After processing, the script will output an example HTML snippet that you can use to embed the video on your website.

```html
<video poster="video-poster.jpg" controls width="848" height="480">
  <source src="video-optimized.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
```

## Tips for Web Video

1. **Autoplay Considerations**: Add `autoplay muted` attributes if you want the video to play automatically (browsers require muted for autoplay)
2. **Responsive Videos**: Wrap the video in a container with CSS for responsive sizing
3. **Preload Options**: Add the `preload="none"` attribute to prevent videos from loading before user interaction

## Common Issues

- If the script fails with "ffmpeg not found", ensure ffmpeg is installed and in your PATH
- For very large videos, consider adjusting the quality settings (higher number = smaller file)
- If processing is too slow, use the `--fast=true` option