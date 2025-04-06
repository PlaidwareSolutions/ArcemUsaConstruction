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
  quoteDocumentUploader: {
    config: {
      image?: {
        maxFileSize: string;
        maxFileCount: number;
      };
      pdf?: {
        maxFileSize: string;
        maxFileCount: number;
      };
    };
    metadata?: {
      userId?: number;
    };
    output: {
      url: string;
      ufsUrl?: string;
      key: string;
      name: string;
      size: number;
    }[];
  };
};