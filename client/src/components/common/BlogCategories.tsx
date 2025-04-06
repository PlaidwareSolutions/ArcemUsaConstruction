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

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {categories.map((cat: Category) => (
        <Badge
          key={cat.id}
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