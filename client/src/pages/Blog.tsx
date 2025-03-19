import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { initializeRevealEffects, scrollToTop } from '@/lib/utils';
import BlogCard from '@/components/common/BlogCard';
import { BlogPost } from '@shared/schema';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    scrollToTop();
    document.title = 'Blog - ARCEM';
    const cleanup = initializeRevealEffects();
    return cleanup;
  }, []);

  const { data: blogPosts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Get unique categories from blog posts
  const categories = blogPosts 
    ? ['all', ...Array.from(new Set(blogPosts.map(post => post.category)))] 
    : ['all'];

  // Filter blog posts based on search query and selected category
  const filteredPosts = blogPosts?.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
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
          <div className="mb-12 reveal">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              {/* Category filter */}
              <div className="flex flex-wrap gap-3">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 font-montserrat text-sm transition-colors ${
                      selectedCategory === category 
                        ? 'bg-[#1E90DB] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.toUpperCase()}
                  </button>
                ))}
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
          
          {isLoading ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white shadow-lg reveal">
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
              {filteredPosts?.map(post => (
                <BlogCard 
                  key={post.id}
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  imageUrl={post.image}
                  date={post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                  category={post.category}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <div className="max-w-2xl mx-auto reveal">
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
