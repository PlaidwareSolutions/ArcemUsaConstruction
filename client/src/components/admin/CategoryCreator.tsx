import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface CategoryCreatorProps {
  onCategoryCreated?: (categoryId: number, categoryName: string) => void;
}

const CategoryCreator: React.FC<CategoryCreatorProps> = ({ onCategoryCreated }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  
  const queryClient = useQueryClient();
  
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest({
        method: 'POST',
        url: '/api/blog/categories',
        body: { name }
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/categories'] });
      toast({
        title: 'Success',
        description: `Category "${data.name}" has been created`,
      });
      setCategoryName('');
      setIsAdding(false);
      if (onCategoryCreated && data.id) {
        onCategoryCreated(data.id, data.name);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create category: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      createCategoryMutation.mutate(categoryName.trim());
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
        Add New Category
      </Button>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-center space-x-2">
      <Input
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="New category name"
        disabled={createCategoryMutation.isPending}
        className="flex-1"
      />
      <Button 
        type="submit" 
        size="sm"
        disabled={createCategoryMutation.isPending || !categoryName.trim()}
      >
        {createCategoryMutation.isPending ? (
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
        disabled={createCategoryMutation.isPending}
      >
        Cancel
      </Button>
    </form>
  );
};

export default CategoryCreator;