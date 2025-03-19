import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { scrollToTop, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import BlogForm from '@/components/admin/BlogForm';
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { BlogPost } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

const BlogManagement = () => {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<number | undefined>(undefined);
  const [isAdding, setIsAdding] = useState(false);
  
  // Get URL params and set state based on URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const action = searchParams.get('action');
    const editId = searchParams.get('edit');
    
    console.log("Current blog location:", location);
    console.log("Blog URL params:", { action, editId });
    
    if (action === 'new') {
      setIsAdding(true);
      setIsEditing(false);
      setCurrentEditId(undefined);
    } else if (editId) {
      setIsEditing(true);
      setIsAdding(false);
      setCurrentEditId(Number(editId));
    } else {
      setIsEditing(false);
      setIsAdding(false);
      setCurrentEditId(undefined);
    }
  }, [location]);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  useEffect(() => {
    scrollToTop();
    document.title = 'Blog Management - ARCEM';
  }, []);

  // Fetch blog posts
  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/all'],
  });

  // Delete blog post mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/all'] });
      toast({
        title: "Post deleted",
        description: "The blog post has been successfully deleted.",
        variant: "default"
      });
      setShowDeleteDialog(false);
      setPostToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete blog post. Please try again.",
        variant: "destructive"
      });
      console.error("Error deleting blog post:", error);
    }
  });

  // Toggle published status mutation
  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, published }: { id: number; published: boolean }) => {
      return apiRequest('PUT', `/api/blog/${id}`, { published });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/all'] });
      toast({
        title: "Post updated",
        description: "Published status has been updated.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update blog post. Please try again.",
        variant: "destructive"
      });
      console.error("Error updating blog post:", error);
    }
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter blog posts based on search query
  const filteredPosts = blogPosts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigate to add new blog post form
  const handleAddNew = () => {
    setIsAdding(true);
    setIsEditing(false);
    setCurrentEditId(undefined);
    setLocation('/admin/blog?action=new');
  };

  // Open edit blog post form
  const handleEdit = (id: number) => {
    console.log("Edit clicked for blog post ID:", id);
    setIsEditing(true);
    setIsAdding(false);
    setCurrentEditId(id);
    setLocation(`/admin/blog?edit=${id}`);
  };

  // Show delete confirmation
  const handleDeleteClick = (post: BlogPost) => {
    setPostToDelete(post);
    setShowDeleteDialog(true);
  };

  // Confirm delete blog post
  const confirmDelete = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete.id);
    }
  };

  // Toggle published status
  const togglePublished = (post: BlogPost) => {
    togglePublishedMutation.mutate({
      id: post.id,
      published: !post.published
    });
  };

  // Close form and return to list
  const handleCloseForm = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentEditId(undefined);
    setLocation('/admin/blog');
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Admin Navigation */}
          <AdminNav activePage="blog" />
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Add/Edit Blog Post Form */}
            {isAdding || isEditing ? (
              <BlogForm 
                postId={currentEditId} 
                onClose={handleCloseForm} 
              />
            ) : (
              <>
                {/* Blog Post List */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h1 className="text-2xl font-montserrat font-bold">Blog Management</h1>
                    <Button variant="gold" onClick={handleAddNew}>
                      <Plus className="mr-2 h-4 w-4" /> Add New Post
                    </Button>
                  </div>
                  
                  {/* Search bar */}
                  <div className="mb-6 relative">
                    <Input
                      type="text"
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-10 pr-4 py-2 border border-gray-300"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                  
                  {/* Blog posts table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                            Image
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                            Author
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 text-center">
                              <div className="animate-pulse flex items-center justify-center">
                                <div className="h-4 w-36 bg-gray-200 rounded"></div>
                              </div>
                            </td>
                          </tr>
                        ) : filteredPosts?.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                              No blog posts found
                            </td>
                          </tr>
                        ) : (
                          filteredPosts?.map(post => (
                            <tr key={post.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-16 h-12 bg-gray-100 overflow-hidden">
                                  <img 
                                    src={post.image} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {post.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Slug: {post.slug}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{post.author}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{post.category}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{post.createdAt ? formatDate(post.createdAt) : 'No date'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePublished(post)}
                                  disabled={togglePublishedMutation.isPending}
                                  title={post.published ? "Unpublish post" : "Publish post"}
                                >
                                  {post.published ? (
                                    <Eye className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                  )}
                                </Button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(post.id)}
                                  className="text-blue-600 hover:text-blue-900 mr-2"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(post)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the blog post "{postToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;
