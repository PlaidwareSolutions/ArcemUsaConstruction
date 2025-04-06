import { useEffect, useState, useCallback } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { BlogPost as BlogPostType, BlogGallery } from '@shared/schema';
import { initializeRevealEffects, scrollToTop, formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, Tag, User, ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import BlogPostSeo from '@/components/seo/BlogPostSeo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogHeader,
  DialogFooter
} from '@/components/ui/dialog';

// Category interface
interface Category {
  id: number;
  name: string;
  slug: string;
}

// Separate component for categories to avoid React hooks rule violations
interface CategoryListProps {
  postId: number;
}

const CategoryList = ({ postId }: CategoryListProps) => {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: [`/api/blog/${postId}/categories`],
    enabled: !!postId,
  });
  
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories && categories.length > 0 ? (
        categories.map((cat) => (
          <Badge key={cat.id} variant="outline" className="text-xs font-medium px-3 py-1 border-gray-300">
            {cat.name}
          </Badge>
        ))
      ) : (
        <span className="text-xs text-gray-500">Uncategorized</span>
      )}
    </div>
  );
};

// Tag interface
interface Tag {
  id: number;
  name: string;
  slug: string;
}

// Separate component for tags to avoid React hooks rule violations
interface TagListProps {
  postId: number;
}

const TagList = ({ postId }: TagListProps) => {
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: [`/api/blog/${postId}/tags`],
    enabled: !!postId,
  });
  
  return tags && tags.length > 0 ? (
    <div className="mt-8">
      <h4 className="text-sm font-semibold text-gray-600 mb-3 tracking-wide uppercase">TAGS</h4>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag.id} className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
            #{tag.name}
          </span>
        ))}
      </div>
    </div>
  ) : null;
};
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const BlogPost = () => {
  const [, params] = useRoute('/blog/:slug');
  const slug = params?.slug;
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption: string | null } | null>(null);
  
  // Initialize carousel with autoplay plugin
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);
  
  // Carousel navigation controls
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);
  
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    scrollToTop();
    const cleanup = initializeRevealEffects(true);
    return cleanup;
  }, [slug]);

  const { data: post, isLoading, error } = useQuery<BlogPostType>({
    queryKey: [`/api/blog/slug/${slug}`],
    enabled: !!slug,
  });
  
  // Fetch blog post gallery images
  const { data: galleryImages = [], isLoading: isLoadingGallery } = useQuery<BlogGallery[]>({
    queryKey: [`/api/blog/${post?.id}/gallery`],
    enabled: !!post?.id,
  });
  
  // Fetch related blog posts
  const { data: relatedPosts = [], isLoading: isLoadingRelated } = useQuery<BlogPostType[]>({
    queryKey: [`/api/blog/${post?.id}/related`],
    enabled: !!post?.id,
  });

  // SEO metadata is now handled by BlogPostSeo component

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 w-1/2 mb-8"></div>
            <div className="h-96 bg-gray-200 w-full mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 w-full"></div>
              <div className="h-4 bg-gray-200 w-full"></div>
              <div className="h-4 bg-gray-200 w-5/6"></div>
              <div className="h-4 bg-gray-200 w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-white">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h1 className="text-3xl font-montserrat font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">
            The article you're looking for doesn't exist or there was an error loading it.
          </p>
          <Link href="/blog">
            <Button variant="black">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-32 pb-20 bg-white">
        {post && (
          <BlogPostSeo
            title={post.title}
            description={post.excerpt || post.content.substring(0, 160)}
            imageUrl={post.image || '/images/placeholder-blog.jpg'}
            author={post.author}
            publishedDate={post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString()}
            modifiedDate={undefined}
            url={window.location.href}
            slug={slug || ''}
          />
        )}
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog">
              <Button variant="outline" className="mb-8">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
              </Button>
            </Link>

            <article>
              <header className="mb-12 reveal active">
                <h1 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">{post.title}</h1>
                
                <div className="flex flex-wrap gap-4 mb-8 text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(post.createdAt || new Date())}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    {/* Use the CategoryList component */}
                    <CategoryList postId={post.id} />
                  </div>
                </div>

                {/* Carousel component for blog post featured image and gallery */}
                <div className="relative rounded shadow-lg mb-8 overflow-hidden">
                  {/* Only show carousel if gallery images exist */}
                  {galleryImages && galleryImages.length > 0 ? (
                    <>
                      <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex">
                          {/* Add main blog image as first slide */}
                          <div className="flex-grow-0 flex-shrink-0 relative w-full min-w-0">
                            <img 
                              src={post.image || '/images/placeholder-blog.jpg'} 
                              alt={post.title} 
                              className="w-full h-96 object-cover"
                            />
                          </div>
                          
                          {/* Add gallery images as additional slides */}
                          {galleryImages
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((image, index) => (
                              <div 
                                key={image.id} 
                                className="flex-grow-0 flex-shrink-0 relative w-full min-w-0"
                                onClick={() => setSelectedImage({ url: image.imageUrl, caption: image.caption })}
                              >
                                <img 
                                  src={image.imageUrl} 
                                  alt={image.caption || `Image ${index + 1}`} 
                                  className="w-full h-96 object-cover"
                                />
                                {image.caption && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 text-white">
                                    {image.caption}
                                  </div>
                                )}
                              </div>
                            ))
                          }
                        </div>
                      </div>
                      
                      {/* Navigation buttons */}
                      <button 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={scrollPrev}
                        disabled={!prevBtnEnabled}
                        aria-label="Previous image"
                        tabIndex={0}
                      >
                        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                      </button>
                      <button 
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={scrollNext}
                        disabled={!nextBtnEnabled}
                        aria-label="Next image"
                        tabIndex={0}
                      >
                        <ChevronRight className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    // Fallback to static image if no gallery images
                    <img 
                      src={post.image || '/images/placeholder-blog.jpg'} 
                      alt={post.title} 
                      className="w-full h-96 object-cover"
                    />
                  )}
                </div>
              </header>

              <div className="prose max-w-none reveal active">
                {/* Render the content from database */}
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
              
              {/* Tags section */}
              <TagList postId={post.id} />
            </article>

            <div className="border-t border-gray-200 mt-16 pt-12 reveal active">
              <h3 className="text-2xl font-montserrat font-bold mb-8">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Show skeleton loaders while loading related posts */}
                {isLoadingRelated && (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="group block overflow-hidden shadow-lg">
                      <div className="relative h-48 bg-gray-200 animate-pulse"></div>
                      <div className="p-4">
                        <div className="h-5 bg-gray-200 w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Show related posts when loaded */}
                {!isLoadingRelated && relatedPosts && relatedPosts.length > 0 ? (
                  relatedPosts.map((relatedPost) => (
                    <Link 
                      key={relatedPost.id} 
                      href={`/blog/${relatedPost.slug}`} 
                      className="group block overflow-hidden shadow-lg"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={relatedPost.image || '/images/placeholder-blog.jpg'} 
                          alt={relatedPost.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-montserrat font-bold line-clamp-2">{relatedPost.title}</h4>
                        <p className="text-gray-500 text-sm mt-2">
                          {formatDate(relatedPost.createdAt || new Date())}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (!isLoadingRelated && (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-gray-500">No related articles found</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          <div className="bg-white rounded-lg overflow-hidden relative">
            <DialogHeader className="p-4 sm:p-6">
              <DialogTitle className="text-lg">
                {selectedImage?.caption || 'Gallery Image'}
              </DialogTitle>
              <Button 
                onClick={() => setSelectedImage(null)} 
                variant="ghost" 
                size="icon"
                className="absolute top-2 right-2 rounded-full"
                aria-label="Close gallery image"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </DialogHeader>
            {selectedImage && (
              <div className="p-4 sm:p-6 pt-0">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.caption || 'Gallery image'} 
                  className="w-full h-auto object-contain rounded"
                />
                {selectedImage.caption && (
                  <p className="mt-4 text-center text-gray-600">{selectedImage.caption}</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlogPost;