import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Search, Mail, Download, Filter } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import ExportButton from "@/components/admin/ExportButton";
import { apiRequest } from "@/lib/queryClient";
import { NewsletterSubscriber } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatDate, scrollToTop } from "@/lib/utils";

const NewsletterManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<NewsletterSubscriber | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    scrollToTop();
    document.title = 'Newsletter Management - ARCEM';
  }, []);

  // Fetch subscribers
  const { data: subscribers = [], isLoading } = useQuery<NewsletterSubscriber[]>({
    queryKey: ["/api/admin/newsletter/subscribers"],
  });

  // Delete subscriber mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/newsletter/subscribers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/subscribers"] });
      toast({
        title: "Subscriber deleted",
        description: "The subscriber has been removed from the list.",
        variant: "default",
      });
      setShowDeleteDialog(false);
      setSubscriberToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete subscriber. Please try again.",
        variant: "destructive"
      });
      console.error("Error deleting subscriber:", error);
    }
  });

  // Filter subscribers based on search query and active/inactive filter
  const filteredSubscribers = subscribers.filter(subscriber => {
    const searchMatches = 
      subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subscriber.firstName && subscriber.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subscriber.lastName && subscriber.lastName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeFilter === "active") {
      return searchMatches && subscriber.subscribed;
    } else if (activeFilter === "inactive") {
      return searchMatches && !subscriber.subscribed;
    }
    
    return searchMatches;
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Show delete confirmation
  const handleDeleteClick = (subscriber: NewsletterSubscriber) => {
    setSubscriberToDelete(subscriber);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (subscriberToDelete) {
      deleteMutation.mutate(subscriberToDelete.id);
    }
  };



  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Admin Navigation */}
          <AdminNav activePage="newsletter" />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-montserrat font-bold flex items-center">
                  <Mail className="mr-2 h-6 w-6" />
                  Newsletter Subscribers
                </h1>
                <div className="flex gap-2">
                  <ExportButton
                    data={activeFilter === "all" ? subscribers : filteredSubscribers}
                    fileName={`newsletter-subscribers-${new Date().toISOString().split('T')[0]}`}
                    excludeFields={["id"]}
                    dateFields={["createdAt"]}
                  />
                  <div className="flex items-center gap-1">
                    <Button 
                      variant={activeFilter === "all" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActiveFilter("all")}
                    >
                      All
                    </Button>
                    <Button 
                      variant={activeFilter === "active" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActiveFilter("active")}
                    >
                      Active
                    </Button>
                    <Button 
                      variant={activeFilter === "inactive" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActiveFilter("inactive")}
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Search bar */}
              <div className="mb-6 relative">
                <Input
                  type="text"
                  placeholder="Search subscribers..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              
              {/* Subscribers table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="animate-pulse flex items-center justify-center">
                            <div className="h-4 w-36 bg-gray-200 rounded"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredSubscribers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                          No subscribers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubscribers.map(subscriber => (
                        <TableRow key={subscriber.id}>
                          <TableCell className="font-medium">{subscriber.email}</TableCell>
                          <TableCell>
                            {subscriber.firstName || subscriber.lastName ? 
                              `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim() : 
                              '—'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${
                              subscriber.subscribed 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : 'bg-red-100 text-red-800 hover:bg-red-100'
                            }`}>
                              {subscriber.subscribed ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>{subscriber.createdAt ? formatDate(subscriber.createdAt) : 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(subscriber)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredSubscribers.length} of {subscribers.length} subscribers
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the subscriber with email "{subscriberToDelete?.email}"? This action cannot be undone.
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

export default NewsletterManagement;