import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, GripVertical, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProjectGallery } from '@shared/schema';

// Type that matches our pending image structure
type PendingImage = {
  url: string;
  caption: string;
  displayOrder: number;
};

type GalleryImage = ProjectGallery | PendingImage;

// Helper function to check if an item is a ProjectGallery
const isProjectGallery = (item: GalleryImage): item is ProjectGallery => {
  return 'id' in item;
};

// Helper function to get an ID for both ProjectGallery and PendingImage
const getItemId = (item: GalleryImage, index: number): string => {
  return isProjectGallery(item) ? `gallery-${item.id}` : `pending-${index}`;
};

interface SortableItemProps {
  item: GalleryImage;
  index: number;
  isFeatureImage: boolean;
  isPending: boolean;
  onSetAsPreview: (url: string) => void;
  onDelete: () => void;
  onUpdateCaption: (caption: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  index,
  isFeatureImage,
  isPending,
  onSetAsPreview,
  onDelete,
  onUpdateCaption
}) => {
  const [caption, setCaption] = useState(item.caption || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: getItemId(item, index),
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };
  
  const handleSaveCaption = () => {
    onUpdateCaption(caption);
    setIsEditing(false);
  };
  
  const imageUrl = isProjectGallery(item) ? item.imageUrl : item.url;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative bg-white border rounded overflow-hidden group"
    >
      <div className="relative aspect-square">
        {isFeatureImage && (
          <Badge className="absolute top-2 left-2 z-10 bg-yellow-400 text-black font-medium p-1.5">
            <Star className="h-3.5 w-3.5 fill-current" />
          </Badge>
        )}
        
        <img
          src={imageUrl}
          alt={caption || 'Gallery image'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/600x400?text=Image+Not+Found";
          }}
        />
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex justify-between items-center mb-1">
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 px-2 ${isFeatureImage ? 'text-yellow-400 hover:bg-white/20' : 'text-white hover:bg-white/20'}`}
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                onSetAsPreview(imageUrl);
              }}
            >
              <Star 
                className={`h-3.5 w-3.5 mr-1 feature-image-star ${isFeatureImage ? 'fill-yellow-400' : ''}`} 
                data-gallery-id={isPending ? '' : (item as ProjectGallery).id.toString()}
              />
              <span className="text-xs">Feature</span>
            </Button>
            
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.preventDefault(); // Prevent form submission
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.preventDefault(); // Prevent form submission
                  onDelete();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        
        <div
          {...listeners}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 bg-white/80 rounded-full flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-80 transition-opacity duration-200"
        >
          <GripVertical className="h-5 w-5 text-gray-700" />
        </div>
      </div>
      
      {isEditing ? (
        <div className="p-2 bg-muted/40">
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter image caption"
            className="text-sm mb-1"
            size={1}
          />
          <div className="flex justify-end gap-1 mt-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs"
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                handleSaveCaption();
              }}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-2 truncate">
          <p className="text-xs text-gray-600">
            {isPending ? 'Pending upload' : 'Order: ' + item.displayOrder}
          </p>
          <p className="text-sm truncate">{caption || 'No caption'}</p>
        </div>
      )}
    </div>
  );
};

interface SortableGalleryGridProps {
  savedGalleryItems: ProjectGallery[];
  pendingGalleryItems: PendingImage[];
  previewImageUrl?: string;
  onReorderSavedItems: (items: ProjectGallery[]) => void;
  onReorderPendingItems: (items: PendingImage[]) => void;
  onSetAsPreview: (url: string) => void;
  onDeleteSavedItem: (id: number) => void;
  onDeletePendingItem: (index: number) => void;
  onUpdateSavedItemCaption: (id: number, caption: string) => void;
  onUpdatePendingItemCaption: (index: number, caption: string) => void;
}

const SortableGalleryGrid: React.FC<SortableGalleryGridProps> = ({
  savedGalleryItems,
  pendingGalleryItems,
  previewImageUrl,
  onReorderSavedItems,
  onReorderPendingItems,
  onSetAsPreview,
  onDeleteSavedItem,
  onDeletePendingItem,
  onUpdateSavedItemCaption,
  onUpdatePendingItemCaption
}) => {
  // Combine saved and pending items for rendering
  const allItems: GalleryImage[] = [
    ...savedGalleryItems,
    ...pendingGalleryItems
  ];
  
  // Create an array of IDs for the sortable context
  const itemIds = allItems.map((item, index) => 
    getItemId(item, index)
  );
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Find the indices of the items being reordered
      const oldIndex = itemIds.indexOf(active.id as string);
      const newIndex = itemIds.indexOf(over.id as string);
      
      // Get the item that was moved
      const movedItem = allItems[oldIndex];
      
      // Check if it's a saved item or pending item and handle accordingly
      if (isProjectGallery(movedItem)) {
        // Find the indices within the savedGalleryItems array
        const savedOldIndex = savedGalleryItems.findIndex(item => getItemId(item, 0) === active.id);
        const savedNewIndex = savedGalleryItems.findIndex(item => getItemId(item, 0) === over.id);
        
        // If both indices are valid, it's a reorder within the saved items
        if (savedOldIndex !== -1 && savedNewIndex !== -1) {
          const newOrder = arrayMove(savedGalleryItems, savedOldIndex, savedNewIndex);
          
          // Update display orders based on new positions
          const updatedOrder = newOrder.map((item, index) => ({
            ...item,
            displayOrder: index + 1
          }));
          
          onReorderSavedItems(updatedOrder);
        } else {
          // It's a move between saved and pending items (not supported)
          console.warn('Moving between saved and pending items is not supported');
        }
      } else {
        // Find the indices within the pendingGalleryItems array
        const pendingOldIndex = pendingGalleryItems.findIndex((_, i) => 
          getItemId({ url: '', caption: '', displayOrder: 0 }, i + savedGalleryItems.length) === active.id
        );
        
        const pendingNewIndex = pendingGalleryItems.findIndex((_, i) => 
          getItemId({ url: '', caption: '', displayOrder: 0 }, i + savedGalleryItems.length) === over.id
        );
        
        // If both indices are valid, it's a reorder within the pending items
        if (pendingOldIndex !== -1 && pendingNewIndex !== -1) {
          const newOrder = arrayMove(pendingGalleryItems, pendingOldIndex, pendingNewIndex);
          
          // Update display orders based on new positions
          // Filter out null display orders and use a safe default if the array is empty
          const validOrders = savedGalleryItems
            .map(item => item.displayOrder)
            .filter((order): order is number => order !== null);
          
          const startOrder = validOrders.length > 0 
            ? Math.max(...validOrders) + 1 
            : 1;
          
          const updatedOrder = newOrder.map((item, index) => ({
            ...item,
            displayOrder: startOrder + index
          }));
          
          onReorderPendingItems(updatedOrder);
        } else {
          // It's a move between pending and saved items (not supported)
          console.warn('Moving between pending and saved items is not supported');
        }
      }
    }
  };
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={itemIds} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {allItems.map((item, index) => {
            const isPending = !isProjectGallery(item);
            const imageUrl = isProjectGallery(item) ? item.imageUrl : item.url;
            // Check both the isFeature flag (if it exists) and the previewImageUrl
            const isFeatureImage = isProjectGallery(item) ? Boolean(item.isFeature) : previewImageUrl === imageUrl;
            
            return (
              <SortableItem
                key={getItemId(item, index)}
                item={item}
                index={index}
                isFeatureImage={isFeatureImage}
                isPending={isPending}
                onSetAsPreview={onSetAsPreview}
                onDelete={() => {
                  if (isProjectGallery(item)) {
                    onDeleteSavedItem(item.id);
                  } else {
                    // Find the index in the pending items array
                    const pendingIndex = pendingGalleryItems.findIndex(
                      pendingItem => pendingItem.url === item.url
                    );
                    if (pendingIndex !== -1) {
                      onDeletePendingItem(pendingIndex);
                    }
                  }
                }}
                onUpdateCaption={(caption) => {
                  if (isProjectGallery(item)) {
                    onUpdateSavedItemCaption(item.id, caption);
                  } else {
                    // Find the index in the pending items array
                    const pendingIndex = pendingGalleryItems.findIndex(
                      pendingItem => pendingItem.url === item.url
                    );
                    if (pendingIndex !== -1) {
                      onUpdatePendingItemCaption(pendingIndex, caption);
                    }
                  }
                }}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableGalleryGrid;