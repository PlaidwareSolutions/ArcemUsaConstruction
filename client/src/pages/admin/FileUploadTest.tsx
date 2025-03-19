import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import FileManager from '@/components/FileManager';
import UploadThingFileManager from '@/components/UploadThingFileManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import * as fileUtils from '@/lib/fileUtils';
import { useToast } from '@/hooks/use-toast';
import AdminNav from '@/components/admin/AdminNav';
import { scrollToTop } from '@/lib/utils';

export default function FileUploadTest() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [fileMetadata, setFileMetadata] = useState<Map<string, string>>(new Map());
  const [managedFiles, setManagedFiles] = useState<string[]>([]);
  const [sessionId] = useState<string>(fileUtils.generateSessionId());
  const { toast } = useToast();
  
  useEffect(() => {
    scrollToTop();
    document.title = 'File Upload Test - ARCEM';
  }, []);

  // Handle upload complete
  const handleUploadComplete = (fileUrls: string | string[], sessionId?: string, fileNames?: string[]) => {
    const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
    setUploadedFiles(prev => [...prev, ...urls]);
    
    // Store file metadata if available
    if (fileNames && fileNames.length === urls.length) {
      const newMetadata = new Map(fileMetadata);
      urls.forEach((url, index) => {
        newMetadata.set(url, fileNames[index]);
      });
      setFileMetadata(newMetadata);
    }
    
    toast({
      title: 'Upload Complete',
      description: `Successfully uploaded ${urls.length} files.`,
    });
  };

  // Handle file removed
  const handleFileRemoved = (fileUrl: string) => {
    setUploadedFiles(prev => prev.filter(url => url !== fileUrl));
    toast({
      title: 'File Removed',
      description: 'File was removed successfully.',
    });
  };

  // Handle upload error
  const handleUploadError = (error: Error) => {
    toast({
      title: 'Upload Error',
      description: error.message || 'An error occurred during file upload.',
      variant: 'destructive',
    });
  };

  // Clear all files
  const handleClearAll = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: 'No Files',
        description: 'There are no files to clear.',
      });
      return;
    }

    try {
      await fileUtils.cleanupFiles(sessionId);
      setUploadedFiles([]);
      toast({
        title: 'Files Cleared',
        description: 'All files have been cleaned up.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clean up files.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Admin Navigation */}
          <AdminNav activePage="file-upload-test" />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-montserrat font-bold">File Upload Test</h1>
                <div className="text-sm text-gray-500">Admin / File Upload</div>
              </div>
              
              <Alert className="mb-6">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  This page demonstrates the integrated file management system using UploadThing.
                  You can test both the direct file upload component and the managed file interface.
                </AlertDescription>
              </Alert>
            </div>
            
            <Tabs defaultValue="fileupload" className="mb-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="fileupload">File Upload Component</TabsTrigger>
                <TabsTrigger value="filemanager">File Manager Component</TabsTrigger>
                <TabsTrigger value="uploadthing">UploadThing Manager</TabsTrigger>
              </TabsList>
              
              <TabsContent value="fileupload">
                <Card>
                  <CardHeader>
                    <CardTitle>Direct File Upload</CardTitle>
                    <CardDescription>
                      Upload files directly with drag and drop support, progress tracking, and preview.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <FileUpload
                        onUploadComplete={handleUploadComplete}
                        onError={handleUploadError}
                        onFileRemoved={handleFileRemoved}
                        initialFiles={uploadedFiles}
                        sessionId={sessionId}
                        multiple={true}
                        imagesOnly={true}
                        autoUpload={true}
                        maxFiles={10}
                        uploadLabel="Upload Files"
                        emptyMessage="Drag and drop files here or click to browse"
                      />
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <strong>{uploadedFiles.length}</strong> files uploaded
                      </div>
                      <Button variant="outline" onClick={handleClearAll}>
                        Clear All Files
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="filemanager">
                <Card>
                  <CardHeader>
                    <CardTitle>File Manager Interface</CardTitle>
                    <CardDescription>
                      A simplified interface for managing files with thumbnails and modals.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileManager
                      value={managedFiles}
                      onChange={setManagedFiles}
                      maxFiles={10}
                      title="Manage Project Files"
                      description="Upload and manage files for your project."
                      showThumbnails={true}
                    />
                    
                    <Separator className="my-4" />
                    
                    <div>
                      <h3 className="font-medium mb-2">Current Files:</h3>
                      <ul className="list-disc ml-5">
                        {managedFiles.length === 0 ? (
                          <li className="text-gray-500">No files added yet</li>
                        ) : (
                          managedFiles.map((file, index) => (
                            <li key={index} className="text-sm">
                              <a 
                                href={file} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {fileMetadata.get(file) || file.split('/').pop() || 'file'}
                              </a>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="uploadthing">
                <Card>
                  <CardHeader>
                    <CardTitle>UploadThing File Manager</CardTitle>
                    <CardDescription>
                      Directly manage all files in your UploadThing account, including deletion capabilities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UploadThingFileManager />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}