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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Trash2, 
  Search, 
  ClipboardList, 
  Eye, 
  CheckCircle2, 
  Download,
  Filter
} from "lucide-react";
import ExportButton from "@/components/admin/ExportButton";
import AdminNav from "@/components/admin/AdminNav";
import { apiRequest } from "@/lib/queryClient";
import { QuoteRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatDate, scrollToTop } from "@/lib/utils";

const QuoteRequestsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteRequest | null>(null);
  const [quoteToView, setQuoteToView] = useState<QuoteRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    scrollToTop();
    document.title = 'Quote Requests - ARCEM';
  }, []);
  
  // Fetch quote requests
  const { data: quoteRequests = [], isLoading } = useQuery<QuoteRequest[]>({
    queryKey: ["/api/admin/quote/requests"],
  });

  // Delete quote request mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest({
        url: `/api/admin/quote/requests/${id}`,
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quote/requests"] });
      toast({
        title: "Quote request deleted",
        description: "The quote request has been removed.",
        variant: "default",
      });
      setShowDeleteDialog(false);
      setQuoteToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete quote request. Please try again.",
        variant: "destructive"
      });
      console.error("Error deleting quote request:", error);
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest({
        url: `/api/admin/quote/requests/${id}/status`,
        method: 'PUT',
        body: { status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quote/requests"] });
      toast({
        title: "Status updated",
        description: "The quote request status has been updated.",
        variant: "default",
      });
      // Close detail view after status update
      if (quoteToView) {
        setQuoteToView(null);
      }
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Failed to update the status. Please try again.",
        variant: "destructive"
      });
      console.error("Error updating status:", error);
    }
  });

  // Mark as reviewed mutation
  const markAsReviewedMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest({
        url: `/api/admin/quote/requests/${id}/reviewed`,
        method: 'PUT',
        body: {}
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quote/requests"] });
      toast({
        title: "Marked as reviewed",
        description: "The quote request has been marked as reviewed.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "Failed to mark as reviewed. Please try again.",
        variant: "destructive"
      });
      console.error("Error marking as reviewed:", error);
    }
  });

  // Filter quote requests based on search query and status
  const filteredQuoteRequests = quoteRequests.filter((quote: QuoteRequest) => {
    const searchMatches = 
      quote.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quote.company && quote.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      quote.projectType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const statusMatches = statusFilter === "all" || quote.status === statusFilter;
    
    return searchMatches && statusMatches;
  });

  // Get counts for tabs
  const pendingCount = quoteRequests.filter((quote: QuoteRequest) => quote.status === "pending").length;
  const reviewingCount = quoteRequests.filter((quote: QuoteRequest) => quote.status === "reviewing").length;
  const acceptedCount = quoteRequests.filter((quote: QuoteRequest) => quote.status === "accepted").length;
  const rejectedCount = quoteRequests.filter((quote: QuoteRequest) => quote.status === "rejected").length;
  const completedCount = quoteRequests.filter((quote: QuoteRequest) => quote.status === "completed").length;
  const unreadCount = quoteRequests.filter((quote: QuoteRequest) => !quote.reviewed).length;

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Show delete confirmation
  const handleDeleteClick = (quote: QuoteRequest) => {
    setQuoteToDelete(quote);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (quoteToDelete) {
      deleteMutation.mutate(quoteToDelete.id);
    }
  };

  // Handle view quote details
  const viewQuoteDetails = (quote: QuoteRequest) => {
    setQuoteToView(quote);
    // If not reviewed yet, mark as reviewed
    if (!quote.reviewed) {
      markAsReviewedMutation.mutate(quote.id);
    }
  };

  // Handle status change
  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Removed the CSV export function as it's replaced with Excel export

  // Status badge color mapping
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      reviewing: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      accepted: "bg-green-100 text-green-800 hover:bg-green-100",
      rejected: "bg-red-100 text-red-800 hover:bg-red-100",
      completed: "bg-purple-100 text-purple-800 hover:bg-purple-100"
    };
    
    const displayName = status.charAt(0).toUpperCase() + status.slice(1);
    
    return (
      <Badge className={styles[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
        {displayName}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Admin Navigation */}
          <AdminNav activePage="quotes" />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-montserrat font-bold flex items-center">
                  <ClipboardList className="mr-2 h-6 w-6" />
                  Quote Requests
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount} Unread
                    </Badge>
                  )}
                </h1>
                
                <ExportButton
                  data={statusFilter === "all" ? quoteRequests : filteredQuoteRequests}
                  fileName="QuoteRequests_Export"
                  excludeFields={['id']}
                  dateFields={['createdAt', 'updatedAt']}
                  disabled={isLoading || quoteRequests.length === 0}
                />
              </div>
              
              {/* Status filter tabs */}
              <Tabs 
                defaultValue="all" 
                onValueChange={(value) => setStatusFilter(value)}
                className="mb-6"
              >
                <TabsList className="mb-4 flex flex-wrap">
                  <TabsTrigger value="all">All ({quoteRequests.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                  <TabsTrigger value="reviewing">Reviewing ({reviewingCount})</TabsTrigger>
                  <TabsTrigger value="accepted">Accepted ({acceptedCount})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
                </TabsList>
              
                {/* Search bar */}
                <div className="mb-6 relative">
                  <Input
                    type="text"
                    placeholder="Search quote requests..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 border border-gray-300"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
                
                {/* Quote requests table */}
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Contact Info</TableHead>
                          <TableHead>Project Type</TableHead>
                          <TableHead>Budget</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredQuoteRequests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                              No quote requests found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredQuoteRequests.map(quote => (
                            <TableRow 
                              key={quote.id}
                              className={!quote.reviewed ? "bg-muted/30" : ""}
                            >
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span className="font-semibold">{quote.name}</span>
                                  <span className="text-sm text-muted-foreground">{quote.email}</span>
                                  {quote.company && (
                                    <span className="text-xs text-muted-foreground">{quote.company}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{quote.projectType}</TableCell>
                              <TableCell>{quote.budget || "—"}</TableCell>
                              <TableCell>
                                {quote.createdAt ? formatDate(quote.createdAt) : 'N/A'}
                                {!quote.reviewed && (
                                  <Badge variant="secondary" className="ml-2">New</Badge>
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(quote.status || 'pending')}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => viewQuoteDetails(quote)}
                                  className="text-blue-600 hover:text-blue-900 mr-2"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(quote)}
                                  className="text-red-600 hover:text-red-900"
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredQuoteRequests.length} of {quoteRequests.length} quote requests
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quote Details Dialog */}
      <Dialog open={!!quoteToView} onOpenChange={(open) => !open && setQuoteToView(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Quote Request Details</DialogTitle>
            <DialogDescription>
              Submitted on {quoteToView?.createdAt ? formatDate(quoteToView.createdAt) : "N/A"}
            </DialogDescription>
          </DialogHeader>
          
          {quoteToView && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Contact Information</h3>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="font-semibold">{quoteToView.name}</p>
                    <p>{quoteToView.email}</p>
                    <p>{quoteToView.phone || "No phone provided"}</p>
                    {quoteToView.company && <p>Company: {quoteToView.company}</p>}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Project Details</h3>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p><span className="font-semibold">Type:</span> {quoteToView.projectType}</p>
                    {quoteToView.projectSize && (
                      <p><span className="font-semibold">Size:</span> {quoteToView.projectSize}</p>
                    )}
                    {quoteToView.budget && (
                      <p><span className="font-semibold">Budget:</span> {quoteToView.budget}</p>
                    )}
                    {quoteToView.timeframe && (
                      <p><span className="font-semibold">Timeframe:</span> {quoteToView.timeframe}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Project Description</h3>
                <div className="mt-1 p-3 bg-gray-50 rounded-md max-h-[200px] overflow-y-auto">
                  <p>{quoteToView.description || "No description provided"}</p>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Update Status</h3>
                <div className="flex flex-wrap items-center mt-1 gap-4">
                  <Select
                    defaultValue={quoteToView.status || 'pending'}
                    onValueChange={(value) => handleStatusChange(quoteToView.id, value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground flex items-center">
                    Current: {getStatusBadge(quoteToView.status || 'pending')}
                  </span>
                  {!quoteToView.reviewed && (
                    <Badge variant="outline" className="ml-auto">Unreviewed</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            {quoteToView && !quoteToView.reviewed && (
              <Button
                onClick={() => markAsReviewedMutation.mutate(quoteToView.id)}
                disabled={markAsReviewedMutation.isPending}
                variant="default"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {markAsReviewedMutation.isPending ? "Marking..." : "Mark as Reviewed"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quote request from {quoteToDelete?.name}? This action cannot be undone.
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

export default QuoteRequestsManagement;