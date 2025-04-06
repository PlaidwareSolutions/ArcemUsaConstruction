import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBytes } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import axios from 'axios';

interface StorageUsageProps {
  className?: string;
  showCard?: boolean;
}

const StorageUsage = ({ className = '', showCard = false }: StorageUsageProps) => {
  // Query for fetching files
  const { 
    data: filesData = [], 
    isLoading, 
    isError,
    error
  } = useQuery({
    queryKey: ['/api/uploadthing/files'],
    queryFn: async () => {
      const response = await axios.get('/api/uploadthing/files');
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });

  // Calculate total size of all files
  const calculateTotalUsedStorage = (): number => {
    if (!filesData || !Array.isArray(filesData)) return 0;
    return filesData.reduce((total, file: any) => total + (file.size || 0), 0);
  };
  
  // Calculate storage usage percentage
  const calculateStoragePercentage = (): number => {
    const totalSize = calculateTotalUsedStorage();
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB in bytes
    return Math.min(Math.round((totalSize / maxSize) * 100), 100);
  };

  // Get progress color based on usage percentage
  const getProgressColor = (): string => {
    const percentage = calculateStoragePercentage();
    if (percentage < 50) return '';  // Default color
    if (percentage < 80) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const content = (
    <div className={`${className}`}>
      {isLoading ? (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-end mt-1">
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ) : isError ? (
        <div className="mb-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading storage data</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load storage information.'}
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Storage Usage</span>
            <span className="text-sm text-gray-500">
              {formatBytes(calculateTotalUsedStorage())} of 2GB
            </span>
          </div>
          <Progress 
            value={calculateStoragePercentage()} 
            className={`h-2 ${getProgressColor()}`}
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
              {calculateStoragePercentage()}% used
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return showCard ? (
    <Card>
      <CardContent className="pt-6">
        {content}
      </CardContent>
    </Card>
  ) : content;
};

export default StorageUsage;