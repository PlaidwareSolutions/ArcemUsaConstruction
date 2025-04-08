import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface BlogCardProps {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  date: string;
  category?: string;
}

const BlogCard = ({ id, slug, title, excerpt, imageUrl, date, category }: BlogCardProps) => {
  const { data: categories } = useQuery<Category[]>({
    queryKey: [`/api/blog/${id}/categories`],
    enabled: !!id,
  });
  
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: [`/api/blog/${id}/tags`],
    enabled: !!id,
  });

  return (
    <div className="bg-white shadow-lg hover-scale reveal active rounded-lg overflow-hidden blog-card">
      <div className="overflow-hidden">
        <img 
          src={imageUrl || '/images/placeholder-blog.jpg'} 
          alt={title} 
          className="w-full h-60 object-cover transition-transform duration-500 hover:scale-110"
        />
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
          <span>{date}</span>
          {(categories && categories.length > 0) && (
            <>
              <span className="mx-2">•</span>
              <div className="flex flex-wrap gap-1">
                {categories.map((cat, index) => (
                  <Badge key={`${cat.id}-${index}`} variant="outline" className="text-xs">{cat.name}</Badge>
                ))}
              </div>
            </>
          )}
          {(!categories || categories.length === 0) && category && (
            <>
              <span className="mx-2">•</span>
              <span>{category}</span>
            </>
          )}
        </div>
        <h4 className="text-xl font-montserrat font-bold mb-4">{title}</h4>
        <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
          {excerpt}
        </p>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((tag, index) => (
              <span key={`${tag.id}-${index}`} className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                #{tag.name}
              </span>
            ))}
          </div>
        )}
        
        <Link href={`/blog/${slug}`} className="text-[#1E90DB] hover:text-[#1670B0] font-montserrat text-sm font-medium inline-flex items-center">
          READ MORE
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;
