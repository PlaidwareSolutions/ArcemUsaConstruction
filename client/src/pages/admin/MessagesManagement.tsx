import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Message } from '@shared/schema';
import AdminNav from '@/components/admin/AdminNav';
import ExportButton from '@/components/admin/ExportButton';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const MessagesManagement = () => {
  const { toast } = useToast();
  
  const { data: messages, isLoading, error } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/messages');
      return await res.json();
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('PUT', `/api/messages/${id}/read`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({
        title: 'Success',
        description: 'Message marked as read',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update message status',
        variant: 'destructive'
      });
    }
  });
  
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/messages/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({
        title: 'Success',
        description: 'Message deleted successfully',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    }
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };
  
  const handleDeleteMessage = (id: number) => {
    if (window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      deleteMessageMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            <AdminNav activePage="messages" />
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#1E90DB]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            <AdminNav activePage="messages" />
            <div className="flex-1">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>Error loading messages. Please try again later.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          <AdminNav activePage="messages" />
          
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-montserrat font-bold">Message Management</h1>
                  <p className="text-gray-600 mt-1">
                    View and manage incoming messages from website visitors.
                  </p>
                </div>
                
                {messages && messages.length > 0 && (
                  <ExportButton
                    data={messages}
                    fileName="Messages_Export"
                    excludeFields={['id']}
                    dateFields={['createdAt', 'updatedAt']}
                    disabled={isLoading || !messages || messages.length === 0}
                  />
                )}
              </div>
            
              {messages && messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No messages received yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {messages?.map((message) => (
                        <tr key={message.id} className={message.read ? '' : 'bg-[#FAF6EE]'}>
                          <td className="px-4 py-4 whitespace-nowrap font-medium">{message.name}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{message.email}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{formatDate(message.createdAt?.toString() || new Date())}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge variant={message.read ? "outline" : "default"}>
                              {message.read ? 'Read' : 'Unread'}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(message.id)}
                              disabled={message.read || markAsReadMutation.isPending}
                              className="mr-2"
                            >
                              Mark as Read
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteMessage(message.id)}
                              disabled={deleteMessageMutation.isPending}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {messages && messages.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Message Details</h2>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold">{message.name}</h3>
                          <p className="text-sm text-gray-500">{message.email}</p>
                          <p className="text-sm text-gray-500">{formatDate(message.createdAt?.toString() || new Date())}</p>
                        </div>
                        <Badge variant={message.read ? "outline" : "default"}>
                          {message.read ? 'Read' : 'Unread'}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <p className="text-gray-700">{message.message}</p>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        {!message.read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(message.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            Mark as Read
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMessage(message.id)}
                          disabled={deleteMessageMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesManagement;