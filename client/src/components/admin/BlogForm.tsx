import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBlog } from '@/hooks/useBlog';
import { useBlogCategories } from '@/hooks/useBlogCategories';
import { 
  ExtendedInsertBlogPost, 
  extendedInsertBlogPostSchema 
} from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Images, Upload } from 'lucide-react';
import FileUpload from '@/components/common/FileUpload';
import { generateSlug } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogGalleryManager from './BlogGalleryManager';

interface BlogFormProps {
  postId?: number;
  onClose: () => void;
}

const BlogForm = ({ postId, onClose }: BlogFormProps) => {
  const [activeTab, setActiveTab] = useState("content");
  const { post, isLoading, saveBlogPost, isSubmitting, getPostCategoryIds, getPostTagIds } = useBlog(postId);
  const { 
    categories, 
    categoriesLoading, 
    tags, 
    tagsLoading
  } = useBlogCategories();
  
  const form = useForm<ExtendedInsertBlogPost>({
    resolver: zodResolver(extendedInsertBlogPostSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      image: '',
      category: '',
      author: '',
      published: true,
      categoryIds: [],
      tagIds: []
    },
  });

  // Load categories and tags for the post when editing
  useEffect(() => {
    const loadCategoriesAndTags = async () => {
      if (post && postId) {
        try {
          const categoryIds = await getPostCategoryIds(postId);
          const tagIds = await getPostTagIds(postId);
          
          form.reset({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            image: post.image,
            category: post.category,
            author: post.author,
            published: post.published,
            categoryIds,
            tagIds
          });
        } catch (error) {
          console.error("Error loading post relationships:", error);
        }
      }
    };
    
    if (post) {
      loadCategoriesAndTags();
    }
  }, [form, post, postId, getPostCategoryIds, getPostTagIds]);

  // Generate slug from title when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue('title', title);
    
    if (!form.getValues('slug') || form.getValues('slug') === generateSlug(form.getValues('title'))) {
      form.setValue('slug', generateSlug(title));
    }
  };

  const onSubmit = async (data: ExtendedInsertBlogPost) => {
    await saveBlogPost(data);
    if (!isSubmitting) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onClose} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-montserrat font-bold">
            {postId ? 'Edit Blog Post' : 'Add New Blog Post'}
          </h1>
        </div>
        <div className="flex justify-center p-8">
          <div className="animate-pulse space-y-4 w-full max-w-xl">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onClose} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-montserrat font-bold">
          {postId ? 'Edit Blog Post' : 'Add New Blog Post'}
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter post title" 
                        {...field} 
                        onChange={handleTitleChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter post slug" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      URL-friendly version of the title (auto-generated if left empty)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Author name" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legacy Category (Text)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="E.g., Construction, Architecture" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        For backwards compatibility
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured Image</FormLabel>
                      <FormControl>
                        <FileUpload
                          onUploadComplete={(fileUrls, sessionId) => {
                            const urls = Array.isArray(fileUrls) ? fileUrls : [fileUrls];
                            if (urls.length > 0) {
                              field.onChange(urls[0]);
                            }
                          }}
                          multiple={false}
                          accept="image/*"
                          maxSizeMB={5}
                          buttonText="Upload Featured Image"
                          helpText="Select or drag an image file"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="categoryIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <div className="space-y-3">
                      {categoriesLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Loading categories...</span>
                        </div>
                      ) : !categories || categories.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No categories available</div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {categories.map((category) => (
                            <div key={category.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`category-${category.id}`}
                                checked={field.value?.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  const newValues = checked
                                    ? [...currentValues, category.id]
                                    : currentValues.filter((id) => id !== category.id);
                                  field.onChange(newValues);
                                }}
                              />
                              <label
                                htmlFor={`category-${category.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {category.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      <FormDescription>
                        Select one or more categories for this blog post
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tagIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-3">
                      {tagsLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Loading tags...</span>
                        </div>
                      ) : !tags || tags.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No tags available</div>
                      ) : (
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                          {tags.map((tag) => {
                            const isSelected = field.value?.includes(tag.id);
                            return (
                              <Badge
                                key={tag.id}
                                variant={isSelected ? "default" : "outline"}
                                className={`cursor-pointer ${isSelected ? 'bg-primary' : ''}`}
                                onClick={() => {
                                  const currentValues = field.value || [];
                                  const newValues = isSelected
                                    ? currentValues.filter((id) => id !== tag.id)
                                    : [...currentValues, tag.id];
                                  field.onChange(newValues);
                                }}
                              >
                                {tag.name}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                      <FormDescription>
                        Click tags to add or remove them from this blog post
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A brief summary of the post" 
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This will be displayed in blog listings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the full content of your blog post" 
                        rows={10}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Published
                      </FormLabel>
                      <FormDescription>
                        Published posts are visible to site visitors. Unpublished posts are drafts.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    postId ? 'Updating...' : 'Creating...'
                  ) : (
                    postId ? 'Update Post' : 'Create Post'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Gallery Section (Integrated in the content page) */}
        <div className="w-full md:w-1/3 bg-gray-50 rounded-lg p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Images className="h-5 w-5 mr-2" />
              Gallery Images
            </h3>
            <p className="text-sm text-muted-foreground">
              Add additional images for this blog post
            </p>
          </div>

          {postId ? (
            <BlogGalleryManager postId={postId} />
          ) : (
            <div className="text-center py-16 border border-dashed rounded-lg">
              <Images className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Save the blog post first to add gallery images</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogForm;
