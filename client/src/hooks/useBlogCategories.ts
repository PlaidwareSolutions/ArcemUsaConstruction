import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BlogCategory, BlogTag, InsertBlogCategory, InsertBlogTag } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { generateSlug } from '@/lib/utils';

export const useBlogCategories = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all categories
  const { 
    data: categories, 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useQuery<BlogCategory[]>({
    queryKey: ['/api/blog/categories'],
  });

  // Fetch all tags
  const { 
    data: tags, 
    isLoading: tagsLoading, 
    error: tagsError 
  } = useQuery<BlogTag[]>({
    queryKey: ['/api/blog/tags'],
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertBlogCategory) => {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = generateSlug(data.name);
      }
      return apiRequest('POST', '/api/blog/categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/categories'] });
      toast({
        title: "Category created",
        description: "The category has been successfully created.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive"
      });
      console.error("Error creating category:", error);
    }
  });

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: async (data: InsertBlogTag) => {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = generateSlug(data.name);
      }
      return apiRequest('POST', '/api/blog/tags', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/tags'] });
      toast({
        title: "Tag created",
        description: "The tag has been successfully created.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create tag. Please try again.",
        variant: "destructive"
      });
      console.error("Error creating tag:", error);
    }
  });

  return {
    categories,
    categoriesLoading,
    categoriesError,
    tags,
    tagsLoading,
    tagsError,
    createCategory: createCategoryMutation.mutateAsync,
    createTag: createTagMutation.mutateAsync,
    isCreatingCategory: createCategoryMutation.isPending,
    isCreatingTag: createTagMutation.isPending
  };
};