import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { scrollToTop } from '@/lib/utils';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  FileText, 
  MessageSquare, 
  Plus,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import { Project, BlogPost, Message } from '@shared/schema';

const Dashboard = () => {
  useEffect(() => {
    scrollToTop();
    document.title = 'Admin Dashboard - ARCEM';
  }, []);

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Fetch blog posts
  const { data: blogPosts, isLoading: isLoadingBlogPosts } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/all'],
  });

  // Fetch messages
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
  });

  // Count unread messages
  const unreadMessagesCount = messages?.filter(message => !message.read).length || 0;

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Admin Navigation */}
          <AdminNav activePage="dashboard" />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h1 className="text-2xl font-montserrat font-bold mb-2">Welcome to Admin Dashboard</h1>
              <p className="text-gray-600">
                Manage your projects, blog posts, and messages.
              </p>
            </div>
            
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                <div className="bg-blue-100 p-4 rounded-full mr-4">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-montserrat font-bold">
                    {isLoadingProjects ? (
                      <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <>{projects?.length || 0} Projects</>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">Total projects</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                <div className="bg-green-100 p-4 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-montserrat font-bold">
                    {isLoadingBlogPosts ? (
                      <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <>{blogPosts?.length || 0} Articles</>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">Published blog posts</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
                <div className="bg-red-100 p-4 rounded-full mr-4">
                  <MessageSquare className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-montserrat font-bold">
                    {isLoadingMessages ? (
                      <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                    ) : (
                      <>{unreadMessagesCount} Unread</>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">New messages</p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-montserrat font-bold mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Link href="/admin/projects">
                  <Button variant="outline" className="flex items-center">
                    <Building className="mr-2 h-4 w-4" /> 
                    Manage Projects
                  </Button>
                </Link>
                <Link href="/admin/projects?action=new">
                  <Button variant="gold" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add New Project
                  </Button>
                </Link>
                <Link href="/admin/blog">
                  <Button variant="outline" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" /> 
                    Manage Blog
                  </Button>
                </Link>
                <Link href="/admin/blog?action=new">
                  <Button variant="gold" className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" /> 
                    Add New Article
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-montserrat font-bold mb-4">Recent Activity</h2>
              {isLoadingMessages ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border-b border-gray-100 pb-4 animate-pulse">
                      <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : messages?.length === 0 ? (
                <p className="text-gray-500">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {messages?.slice(0, 5).map(message => (
                    <div key={message.id} className="border-b border-gray-100 pb-4 flex justify-between items-start">
                      <div>
                        <h3 className="font-montserrat font-medium">New message from {message.name}</h3>
                        <p className="text-sm text-gray-500">
                          Regarding: {message.service || 'General Inquiry'}
                        </p>
                      </div>
                      <div className="flex items-center text-sm">
                        {message.read ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" /> Read
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-600">
                            <Clock className="h-4 w-4 mr-1" /> Unread
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Recent Projects */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-montserrat font-bold">Recent Projects</h2>
                <Link href="/admin/projects">
                  <Button variant="link" className="text-[#1E90DB]">
                    View All
                  </Button>
                </Link>
              </div>
              
              {isLoadingProjects ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border-b border-gray-100 pb-4 animate-pulse">
                      <div className="h-5 w-64 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : projects?.length === 0 ? (
                <p className="text-gray-500">No projects added yet</p>
              ) : (
                <div className="space-y-4">
                  {projects?.slice(0, 5).map(project => (
                    <div key={project.id} className="border-b border-gray-100 pb-4 flex justify-between items-start">
                      <div>
                        <h3 className="font-montserrat font-medium">{project.title}</h3>
                        <p className="text-sm text-gray-500">{project.category}</p>
                      </div>
                      <Link href={`/admin/projects?edit=${project.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
