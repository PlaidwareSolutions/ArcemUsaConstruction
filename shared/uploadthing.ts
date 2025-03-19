import type { FileRouter } from "uploadthing/server";

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