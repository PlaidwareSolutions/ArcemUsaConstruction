import React from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, X, ImageIcon, MoveUp, MoveDown } from 'lucide-react';
import * as fileUtils from '@/lib/fileUtils';

// Interface for gallery image items
export interface GalleryImage {
  id: string;
  imageUrl?: string;
  file?: File;
  caption: string;
  displayOrder: number;
  isFeature: boolean;
  uploadProgress?: number;
  uploaded: boolean;
}

interface SortableGalleryProps {
  images: GalleryImage[];
  onImagesChange: (images: GalleryImage[]) => void;
  onRemoveImage: (id: string) => void;
  onSetFeatureImage: (id: string) => void;
  onUpdateCaption: (id: string, caption: string) => void;
  onMoveImageUp: (id: string) => void;
  onMoveImageDown: (id: string) => void;
}

// Sortable item component
function SortableItem({ image, onRemove, onSetFeature, onCaptionChange }: { 
  image: GalleryImage, 
  onRemove: () => void,
  onSetFeature: () => void,
  onCaptionChange: (caption: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none',
  };

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden group relative">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <div className="absolute top-2 right-2 z-10 flex space-x-1">
          <Button
            type="button"
            variant={image.isFeature ? "default" : "outline"}
            size="icon"
            className="w-7 h-7 bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={onSetFeature}
            title={image.isFeature ? "Featured Image" : "Set as Featured Image"}
          >
            <Star 
              className="h-4 w-4" 
              fill={image.isFeature ? "currentColor" : "none"} 
            />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="w-7 h-7 bg-white/80 backdrop-blur-sm hover:bg-red-50"
            onClick={onRemove}
            title="Remove Image"
          >
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
        
        {/* Image Preview */}
        <div className="aspect-video relative">
          {image.imageUrl ? (
            <img 
              src={image.imageUrl} 
              alt={image.caption} 
              className="w-full h-full object-cover"
            />
          ) : image.file ? (
            <img 
              src={URL.createObjectURL(image.file)} 
              alt={image.caption} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          {/* Upload progress overlay */}
          {!image.uploaded && image.uploadProgress !== undefined && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-4 w-4/5">
                <div className="text-center text-sm mb-2">
                  Uploading... {Math.round(image.uploadProgress)}%
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full" 
                    style={{ width: `${image.uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Featured badge */}
          {image.isFeature && (
            <div className="absolute top-2 left-2 bg-amber-400 text-white text-xs px-2 py-1 rounded-md font-medium">
              Featured
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-3">
        <Input
          placeholder="Image caption"
          value={image.caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          className="text-sm"
        />
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-between">
        <div className="text-xs text-gray-500">
          Order: {image.displayOrder}
        </div>
        {image.file && (
          <div className="text-xs text-gray-500">
            {fileUtils.formatFileSize(image.file.size)}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default function SortableGallery({ 
  images, 
  onImagesChange, 
  onRemoveImage, 
  onSetFeatureImage,
  onUpdateCaption,
  onMoveImageUp,
  onMoveImageDown
}: SortableGalleryProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handler for when drag ends
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(img => img.id === active.id);
      const newIndex = images.findIndex(img => img.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder the images
        const newImages = arrayMove([...images], oldIndex, newIndex);
        
        // Update display order
        const updatedImages = newImages.map((img, idx) => ({
          ...img,
          displayOrder: idx + 1
        }));
        
        // Notify parent
        onImagesChange(updatedImages);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={images.map(img => img.id)} 
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {images.map((image) => (
            <SortableItem 
              key={image.id} 
              image={image}
              onRemove={() => onRemoveImage(image.id)}
              onSetFeature={() => onSetFeatureImage(image.id)}
              onCaptionChange={(caption) => onUpdateCaption(image.id, caption)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}