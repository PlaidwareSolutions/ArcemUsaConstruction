import React, { useState } from 'react';
import { Image as ImageIcon, Upload, X, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import UploadThingFileUpload from '@/components/common/UploadThingFileUpload';

interface BlogFeaturedImageUploadProps {
  currentImageUrl: string | null | undefined;
  onImageUpload: (imageUrl: string) => void;
}

const BlogFeaturedImageUpload: React.FC<BlogFeaturedImageUploadProps> = ({
  currentImageUrl,
  onImageUpload
}) => {
  const [showUploader, setShowUploader] = useState(false);
  const { toast } = useToast();

  const handleUploadComplete = (files: {
    fileName: string;
    fileUrl: string;
    fileKey: string;
    fileSize: number;
    fileType: string;
  }[]) => {
    if (files.length > 0) {
      const uploadedImage = files[0];
      onImageUpload(uploadedImage.fileUrl);
      setShowUploader(false);
      
      toast({
        title: "Featured image uploaded",
        description: "The image has been set as the featured image for this blog post.",
      });
    }
  };

  const handleRemoveImage = () => {
    if (window.confirm('Are you sure you want to remove the featured image?')) {
      onImageUpload('');
      toast({
        title: "Featured image removed",
        description: "The featured image has been removed from this blog post.",
      });
    }
  };

  if (showUploader) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upload Featured Image</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploader(false)}
          >
            Cancel
          </Button>
        </div>
        
        <UploadThingFileUpload
          onUploadComplete={handleUploadComplete}
          uploadType="imageUploader"
          maxFiles={1}
          maxFileSize={16}
          allowedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Featured Image</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploader(true)}
          >
            {currentImageUrl ? 'Change Image' : 'Add Image'}
          </Button>
          
          {currentImageUrl && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
      
      {currentImageUrl ? (
        <div className="relative border rounded-md overflow-hidden">
          <img 
            src={currentImageUrl} 
            alt="Featured image" 
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
            Featured Image
          </div>
        </div>
      ) : (
        <div className="border border-dashed rounded-md flex flex-col items-center justify-center p-12 text-center bg-gray-50">
          <FileImage className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">No featured image selected</p>
          <p className="text-xs text-gray-500 mt-1">Upload an image to enhance your blog post</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setShowUploader(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogFeaturedImageUpload;