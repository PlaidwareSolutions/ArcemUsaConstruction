import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface TagCreatorProps {
  onTagCreated?: (tagId: number, tagName: string) => void;
}

const TagCreator: React.FC<TagCreatorProps> = ({ onTagCreated }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [tagName, setTagName] = useState('');
  
  const queryClient = useQueryClient();
  
  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest({
        method: 'POST',
        url: '/api/blog/tags',
        body: { name }
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/tags'] });
      toast({
        title: 'Success',
        description: `Tag "${data.name}" has been created`,
      });
      setTagName('');
      setIsAdding(false);
      if (onTagCreated && data.id) {
        onTagCreated(data.id, data.name);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create tag: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagName.trim()) {
      createTagMutation.mutate(tagName.trim());
    }
  };
  
  if (!isAdding) {
    return (
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={() => setIsAdding(true)}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add New Tag
      </Button>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-center space-x-2">
      <Input
        value={tagName}
        onChange={(e) => setTagName(e.target.value)}
        placeholder="New tag name"
        disabled={createTagMutation.isPending}
        className="flex-1"
      />
      <Button 
        type="submit" 
        size="sm"
        disabled={createTagMutation.isPending || !tagName.trim()}
      >
        {createTagMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Add'
        )}
      </Button>
      <Button 
        type="button" 
        size="sm" 
        variant="outline"
        onClick={() => setIsAdding(false)}
        disabled={createTagMutation.isPending}
      >
        Cancel
      </Button>
    </form>
  );
};

export default TagCreator;