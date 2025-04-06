import { useEffect } from 'react';
import UploadThingFileManager from '@/components/UploadThingFileManager';
import StorageUsage from '@/components/admin/StorageUsage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import { scrollToTop } from '@/lib/utils';

export default function FileUploadTest() {
  useEffect(() => {
    scrollToTop();
    document.title = 'File Management - ARCEM';
  }, []);

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
                <h1 className="text-2xl font-montserrat font-bold">File Management</h1>
                <div className="text-sm text-gray-500">Admin / File Management</div>
              </div>
              
              <Alert className="mb-6">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  This page allows you to manage all uploaded files in your UploadThing account.
                  You can view, delete, and monitor storage usage in a single interface.
                </AlertDescription>
              </Alert>
              
              {/* Storage Usage Card */}
              <div className="bg-white rounded-lg border p-4 mb-6">
                <StorageUsage />
              </div>
            </div>
            
            <Tabs defaultValue="file-manager" className="mb-6">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="file-manager">File Manager</TabsTrigger>
              </TabsList>
              
              <TabsContent value="file-manager">
                <Card>
                  <CardHeader>
                    <CardTitle>File Manager</CardTitle>
                    <CardDescription>
                      Organize, browse, and manage all files in your UploadThing account.
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