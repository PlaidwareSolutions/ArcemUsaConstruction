import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, FileIcon, FilePenIcon, Image, Trash2 } from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axios from 'axios';

// Interface for files returned from the API
export interface FileListItem {
  key: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

// Response from delete batch endpoint
interface DeleteBatchResponse {
  message: string;
  deletedCount: number;
}

// Response from delete file endpoint
interface DeleteFileResponse {
  message: string;
}

export default function UploadThingFileManager() {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileListItem | null>(null);
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching files
  const { 
    data: filesData = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery<FileListItem[]>({
    queryKey: ['/api/uploadthing/files'],
    queryFn: async () => {
      const response = await axios.get('/api/uploadthing/files');
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Safe access to files data
  const files = Array.isArray(filesData) ? filesData : [];

  // Clean up selected files if they no longer exist
  useEffect(() => {
    if (files.length > 0) {
      const fileKeys = new Set(files.map(file => file.key));
      const selectedFilesArray = Array.from(selectedFiles);
      const newSelectedFiles = new Set(selectedFilesArray.filter(key => fileKeys.has(key)));
      if (newSelectedFiles.size !== selectedFiles.size) {
        setSelectedFiles(newSelectedFiles);
      }
    }
  }, [files, selectedFiles]);

  // Mutation for deleting a file
  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await axios.delete<DeleteFileResponse>(`/api/uploadthing/files/${key}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/uploadthing/files'] });
      toast({
        title: 'File deleted',
        description: 'The file has been successfully deleted.',
      });
      setFileToDelete(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete file',
        description: error?.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Mutation for batch deleting files
  const batchDeleteMutation = useMutation({
    mutationFn: async (keys: string[]) => {
      const response = await axios.post<DeleteBatchResponse>('/api/uploadthing/files/delete-batch', { keys });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/uploadthing/files'] });
      toast({
        title: 'Files deleted',
        description: `${data.deletedCount} files have been successfully deleted.`,
      });
      setSelectedFiles(new Set());
      setIsBatchDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete files',
        description: error?.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Handle selecting/deselecting individual file
  const toggleSelectFile = (key: string) => {
    const newSelectedFiles = new Set(Array.from(selectedFiles));
    if (newSelectedFiles.has(key)) {
      newSelectedFiles.delete(key);
    } else {
      newSelectedFiles.add(key);
    }
    setSelectedFiles(newSelectedFiles);
  };

  // Handle selecting/deselecting all files
  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(file => file.key)));
    }
  };

  // Handle initiating delete for a single file
  const handleDeleteFile = (file: FileListItem) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };

  // Handle initiating batch delete
  const handleBatchDelete = () => {
    if (selectedFiles.size === 0) return;
    setIsBatchDeleteDialogOpen(true);
  };

  // Handle confirming delete for a single file
  const confirmDeleteFile = () => {
    if (fileToDelete) {
      deleteMutation.mutate(fileToDelete.key);
    }
  };

  // Handle confirming batch delete
  const confirmBatchDelete = () => {
    if (selectedFiles.size > 0) {
      batchDeleteMutation.mutate(Array.from(selectedFiles));
    }
  };

  // Determine file icon based on filename
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image className="h-4 w-4" />;
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FilePenIcon className="h-4 w-4" />;
    }
    return <FileIcon className="h-4 w-4" />;
  };

  // Render placeholder loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="border rounded-md">
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading files</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'An unknown error occurred while fetching files.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertTitle>No files found</AlertTitle>
            <AlertDescription>
              There are no files stored in your UploadThing account. Upload a file to get started.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">UploadThing Files</h2>
          <Button 
            variant="destructive" 
            disabled={selectedFiles.size === 0 || batchDeleteMutation.isPending} 
            onClick={handleBatchDelete}
          >
            Delete Selected ({selectedFiles.size})
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedFiles.size === files.length && files.length > 0} 
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all files"
                  />
                </TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="w-14">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.key}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedFiles.has(file.key)} 
                      onCheckedChange={() => toggleSelectFile(file.key)}
                      aria-label={`Select file ${file.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.name)}
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {file.name}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>{file.name.split('.').pop()?.toUpperCase() || 'Unknown'}</TableCell>
                  <TableCell>{formatBytes(file.size)}</TableCell>
                  <TableCell>{formatDate(new Date(file.uploadedAt))}</TableCell>
                  <TableCell>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleDeleteFile(file)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Single File Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete File</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteFile}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Batch Delete Dialog */}
        <Dialog open={isBatchDeleteDialogOpen} onOpenChange={setIsBatchDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Multiple Files</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedFiles.size} selected files? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBatchDeleteDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={confirmBatchDelete}
                disabled={batchDeleteMutation.isPending}
              >
                {batchDeleteMutation.isPending ? 'Deleting...' : 'Delete Files'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}