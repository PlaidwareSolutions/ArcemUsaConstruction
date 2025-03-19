import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Upload, XCircle, Image, File as FileIcon } from 'lucide-react';

interface FileInputProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: Record<string, string[]>;
  value?: File[];
  allowedTypes?: string;
  className?: string;
}

export function FileInput({
  onFilesSelected,
  maxFiles = 5,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
  },
  allowedTypes = 'PNG, JPG, GIF',
  value = [],
  className,
}: FileInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    handleFilesSelection(files);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    
    handleFilesSelection(files);
  };
  
  const handleFilesSelection = (files: File[]) => {
    // Filter files that match accepted types
    const acceptedExtensions = Object.values(accept).flat();
    const acceptedMimeTypes = Object.keys(accept);
    
    const validFiles = files.filter(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return (
        acceptedExtensions.includes(fileExtension) ||
        acceptedMimeTypes.some(type => {
          if (type.endsWith('*')) {
            const mimePrefix = type.slice(0, -1);
            return file.type.startsWith(mimePrefix);
          }
          return file.type === type;
        })
      );
    });
    
    const allowedFiles = validFiles.slice(0, maxFiles - value.length);
    if (allowedFiles.length > 0) {
      onFilesSelected([...value, ...allowedFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onFilesSelected(newFiles);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragging ? 'border-primary bg-muted/50' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        tabIndex={0}
        role="button"
        aria-label="Upload files"
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              Drag & drop files here or <span className="text-primary underline">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Accepted file types: {allowedTypes}
            </p>
            {maxFiles && (
              <p className="text-xs text-muted-foreground">
                Maximum {maxFiles} file{maxFiles !== 1 ? 's' : ''}
                {value.length > 0 && ` (${maxFiles - value.length} remaining)`}
              </p>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={Object.entries(accept)
            .map(([type, exts]) => [type, ...exts])
            .flat()
            .join(',')}
          multiple={maxFiles > 1}
          className="sr-only"
          onChange={handleFileInputChange}
        />
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Selected files ({value.length})</div>
          <div className="space-y-2">
            {value.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-muted/50 rounded p-2 group"
              >
                <div className="flex items-center space-x-2 truncate mr-2">
                  {file.type.startsWith('image/') ? (
                    <Image className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-60 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}