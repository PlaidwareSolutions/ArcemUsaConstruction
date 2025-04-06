import { useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { initializeRevealEffects } from '@/lib/utils';
import BlogCard from '@/components/common/BlogCard';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@shared/schema';
import { formatDate } from '@/lib/utils';

const BlogSection = () => {
  const { data: blogPosts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  useEffect(() => {
    const cleanup = initializeRevealEffects();
    return cleanup;
  }, []);

  // Limit to 3 most recent posts
  const recentPosts = blogPosts?.slice(0, 3);

  if (error) {
    console.error('Error loading blog posts:', error);
  }

  return (
    <section id="blog" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 reveal">
          <h2 className="text-sm font-montserrat text-[#1E90DB] mb-4">OUR BLOG</h2>
          <h3 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">Latest Construction Insights</h3>
          <p className="text-gray-600 leading-relaxed">
            Stay updated with the latest trends, tips, and news from the construction industry.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading state
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white shadow-lg hover-scale reveal">
                <div className="h-60 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-4 w-32 bg-gray-200 mb-4"></div>
                  <div className="h-6 w-full bg-gray-200 mb-4"></div>
                  <div className="h-24 w-full bg-gray-200 mb-6"></div>
                  <div className="h-4 w-24 bg-gray-200"></div>
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center text-red-500">
              Failed to load blog posts. Please try again later.
            </div>
          ) : (
            // Render actual blog posts
            recentPosts?.map((post) => (
              <BlogCard 
                key={post.id}
                id={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                imageUrl={post.image}
                date={formatDate(post.createdAt)}
                category={post.category}
              />
            ))
          )}
        </div>
        
        <div className="text-center mt-12 reveal">
          <Link href="/blog">
            <Button variant="black">
              VIEW ALL ARTICLES
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
