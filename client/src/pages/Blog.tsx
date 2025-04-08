import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { initializeRevealEffects, scrollToTop } from '@/lib/utils';
import BlogCard from '@/components/common/BlogCard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

// Extend BlogPost type to include both createdAt and created_at since API might return either
import { BlogPost as BaseBlogPost } from '@shared/schema';

interface BlogPost extends BaseBlogPost {
  created_at?: string | Date | null;
}

// Separated Tag List component to avoid hooks inside render
interface TagListProps {
  postId: number;
  createdAt?: string | Date | null;
  created_at?: string | Date | null;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

// Make the component exportable to fix the reference issue
export const TagList = ({ postId, createdAt, created_at }: TagListProps) => {
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: [`/api/blog/${postId}/tags`],
    enabled: !!postId,
  });
  
  // Handle both createdAt and created_at fields for compatibility
  const dateValue = createdAt || created_at;
  
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags && tags.length > 0 ? (
        tags.map((tag) => (
          <span key={tag.id} className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
            #{tag.name}
          </span>
        ))
      ) : (
        <span className="text-xs text-gray-500">
          {dateValue ? new Date(dateValue).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : ''}
        </span>
      )}
    </div>
  );
};

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

  useEffect(() => {
    scrollToTop();
    document.title = 'Blog - ARCEM';
    const cleanup = initializeRevealEffects(true);
    return cleanup;
  }, []);

  // Define category interface
  interface Category {
    id: number;
    name: string;
    slug: string;
  }

  // Fetch blog posts
  const { data: blogPosts = [], isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  // Fetch all categories
  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ['/api/blog/categories'],
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Get all post categories
  const { data: allPostCategories = {}, isLoading: isLoadingPostCategories } = useQuery<Record<number, Category[]>>({
    queryKey: ['/api/blog/all-categories'],
    queryFn: async () => {
      // Only fetch if we have posts
      if (!blogPosts?.length) return {};
      
      // Create a map to store categories for each post
      const categoriesMap: Record<number, Category[]> = {};
      
      // Fetch categories for each post in parallel
      await Promise.all(
        blogPosts.map(async (post) => {
          try {
            const response = await fetch(`/api/blog/${post.id}/categories`);
            if (response.ok) {
              const categories = await response.json();
              categoriesMap[post.id] = categories;
            } else {
              categoriesMap[post.id] = [];
            }
          } catch (error) {
            console.error(`Error fetching categories for post ${post.id}:`, error);
            categoriesMap[post.id] = [];
          }
        })
      );
      
      return categoriesMap;
    },
    enabled: !!blogPosts?.length,
  });
  
  // Filter blog posts based on search query
  const searchFilteredPosts = blogPosts?.filter(post => {
    return searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Filter posts by selected category
  const filteredPosts = searchFilteredPosts?.filter(post => {
    if (selectedCategory === 'all') return true;
    
    const postCategories = allPostCategories[post.id] || [];
    return postCategories.some(cat => cat.id === selectedCategory);
  });

  return (
    <>
      {/* Page Banner */}
      <div 
        className="relative h-[350px] flex items-center justify-center" 
        style={{
          backgroundImage: "url('/uploads/images/blog/blueprint-desk.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <motion.div 
          className="container relative z-10 px-4 md:px-8 text-white py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">Construction Insights</h1>
          <p className="text-lg max-w-3xl">
            Stay updated with the latest trends, tips, and news from the construction industry.
          </p>
        </motion.div>
      </div>

      {/* Blog Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          {/* Filter and Search */}
          <div className="mb-12 reveal active">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              {/* Category filter */}
              <div className="space-y-3 w-full">
                <h3 className="text-sm font-semibold text-gray-600 tracking-wide uppercase">FILTER BY CATEGORY</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm font-medium transition-all ${
                      selectedCategory === 'all' 
                        ? 'bg-[#1E90DB] hover:bg-[#1670B0] text-white' 
                        : 'border-gray-300 text-gray-700'
                    }`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    ALL CATEGORIES
                  </Badge>
                  
                  {allCategories.map(category => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm font-medium transition-all ${
                        selectedCategory === category.id 
                          ? 'bg-[#1E90DB] hover:bg-[#1670B0] text-white' 
                          : 'border-gray-300 text-gray-700'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Search */}
              <div className="relative w-full md:w-64">
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-300 focus:border-[#1E90DB] outline-none w-full"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>
          
          {isLoading || isLoadingPostCategories ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white shadow-lg reveal active">
                  <div className="h-60 bg-gray-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-4 w-32 bg-gray-200 mb-4"></div>
                    <div className="h-6 w-full bg-gray-200 mb-4"></div>
                    <div className="h-24 w-full bg-gray-200 mb-6"></div>
                    <div className="h-4 w-24 bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              Failed to load blog posts. Please try again later.
            </div>
          ) : filteredPosts?.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-2xl font-montserrat font-bold mb-4">No articles found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts?.map((post, index) => (
                <div key={`${post.id}-${index}-${post.slug}`} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 reveal active">
                  <Link href={`/blog/${post.slug}`} className="block overflow-hidden relative h-56">
                    <img 
                      src={post.image || '/images/placeholder-blog.jpg'} 
                      alt={post.title} 
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </Link>
                  <div className="p-6">
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {allPostCategories[post.id]?.map(cat => (
                        <Badge key={cat.id} variant="outline" className="font-medium text-xs px-3 py-1 border-gray-300">
                          {cat.name}
                        </Badge>
                      ))}
                      {(!allPostCategories[post.id] || allPostCategories[post.id]?.length === 0) && post.category && (
                        <Badge variant="outline" className="font-medium text-xs px-3 py-1 border-gray-300">
                          {post.category}
                        </Badge>
                      )}
                    </div>
                    
                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-xl font-montserrat font-bold mb-2 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt || ''}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        {/* Tags and date section */}
                        <TagList postId={post.id} created_at={post.created_at} createdAt={post.createdAt} />
                      </div>
                      <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline text-sm">
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <div className="max-w-2xl mx-auto reveal active">
            <h2 className="text-3xl font-montserrat font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-8">
              Stay updated with our latest projects, industry insights, and company news.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                className="flex-grow py-3 px-4 border border-gray-300 focus:border-[#1E90DB] outline-none"
              />
              <Button variant="default">
                SUBSCRIBE
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
