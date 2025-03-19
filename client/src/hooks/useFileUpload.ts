import { useUploadThing } from "@/lib/uploadthing";

export const useFileUpload = () => {
  const { startUpload: startImageUpload, isUploading: isUploadingImage } = useUploadThing("imageUploader");
  const { startUpload: startDocUpload, isUploading: isUploadingDoc } = useUploadThing("documentUploader");

  const uploadImage = async (file: File): Promise<string | undefined> => {
    try {
      const response = await startImageUpload([file]);
      if (response && response[0]) {
        return response[0].ufsUrl || response[0].url; // Prefer ufsUrl, fallback to url
      }
      return undefined;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const uploadDocument = async (file: File): Promise<string | undefined> => {
    try {
      const response = await startDocUpload([file]);
      if (response && response[0]) {
        return response[0].ufsUrl || response[0].url; // Prefer ufsUrl, fallback to url
      }
      return undefined;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  return {
    uploadImage,
    uploadDocument,
    isUploadingImage,
    isUploadingDoc
  };
};