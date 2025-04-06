import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniquePrefix + ext);
  }
});

// Configure file filter to accept only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Create upload middleware
export const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 16 * 1024 * 1024 // 15MB limit
  }
});

// Helper function to get public URL for an uploaded file
export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}