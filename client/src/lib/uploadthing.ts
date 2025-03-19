import { generateReactHelpers } from "@uploadthing/react";
import type { FileRouter } from "uploadthing/server";
 
// Define the file router type to match the server definition
export type OurFileRouter = FileRouter & {
  imageUploader: {
    config: {
      maxFileSize: string;
      maxFileCount: number;
    };
    metadata?: {
      userId?: number;
    };
    output: {
      url: string;
      ufsUrl?: string; // New URL format from UploadThing
      key: string;
      name: string;
      size: number;
    }[];
  };
};

// Create the React hooks with explicit endpoint config
export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>({
  // Specify the URL for the UploadThing API endpoint
  url: "/api/uploadthing",
});