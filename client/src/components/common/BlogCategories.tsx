import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface BlogCategoriesProps {
  postId: number;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
}

export const BlogCategories = ({ postId, className = "", variant = "outline" }: BlogCategoriesProps) => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: [`/api/blog/${postId}/categories`],
    enabled: !!postId,
  });

  if (isLoading || !categories || categories.length === 0) {
    return null;
  }

  // Debug: Log categories to find duplicates
  console.log(`Categories for post ${postId}:`, categories);
  
  // Create a Map to deduplicate categories
  const uniqueCategories = new Map<number, Category>();
  categories.forEach(cat => {
    if (!uniqueCategories.has(cat.id)) {
      uniqueCategories.set(cat.id, cat);
    } else {
      console.warn(`Duplicate category ID ${cat.id} found for post ${postId}`);
    }
  });

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {Array.from(uniqueCategories.values()).map((cat: Category, index) => (
        <Badge
          key={`${postId}-${cat.id}-${index}`}
          variant={variant}
          className="text-xs font-medium px-3 py-1 border-gray-300"
        >
          {cat.name}
        </Badge>
      ))}
    </div>
  );
};

export default BlogCategories;