import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTestimonials } from "@/hooks/useTestimonials";
import AdminNav from "@/components/admin/AdminNav";
import ExportButton from "@/components/admin/ExportButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, CheckCircle, Trash2, Star, Search, ShieldX, Eye } from "lucide-react";
import { Testimonial } from "@shared/schema";
import { scrollToTop } from '@/lib/utils';
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

const TestimonialsManagement = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const {
    allTestimonials,
    pendingTestimonials,
    isLoadingAllTestimonials,
    isLoadingPendingTestimonials,
    approveTestimonial,
    revokeApproval,
    deleteTestimonial,
    isApproving,
    isRevoking,
    isDeleting,
    refetchPendingTestimonials,
    refetchAllTestimonials
  } = useTestimonials();
  
  // Use effect to load testimonials data on component mount
  // and handle URL params for tab state
  useEffect(() => {
    scrollToTop();
    document.title = 'Testimonials Management - ARCEM';
    
    // Parse URL parameters to set the active tab
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const tab = searchParams.get('tab');
    
    if (tab === 'all') {
      setActiveTab('all');
    } else if (tab === 'pending') {
      setActiveTab('pending');
    } else {
      // Default to pending tab if no valid parameter
      setActiveTab('pending');
    }
    
    // Force fetch all testimonial data
    const fetchData = async () => {
      try {
        await Promise.all([
          refetchAllTestimonials(),
          refetchPendingTestimonials()
        ]);
      } catch (error) {
        console.error("Failed to fetch testimonials data:", error);
      }
    };
    
    fetchData();
  }, [location, refetchAllTestimonials, refetchPendingTestimonials]);

  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  // Filter testimonials based on search query
  const filteredAllTestimonials = allTestimonials?.filter(testimonial => 
    testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    testimonial.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    testimonial.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPendingTestimonials = pendingTestimonials?.filter(testimonial => 
    testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    testimonial.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    testimonial.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleDeleteClick = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (testimonialToDelete) {
      deleteTestimonial(testimonialToDelete.id);
      setShowDeleteDialog(false);
    }
  };

  const handleApprove = (id: number) => {
    approveTestimonial(id);
    toast({
      title: "Processing approval",
      description: "The testimonial is being approved...",
    });
  };
  
  const handleRevokeApproval = (id: number) => {
    revokeApproval(id);
    toast({
      title: "Revoking approval",
      description: "The testimonial approval is being revoked...",
    });
  };

  const handleViewClick = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowDetailDialog(true);
  };
  
  const handleDetailApprove = () => {
    if (selectedTestimonial) {
      approveTestimonial(selectedTestimonial.id);
      toast({
        title: "Processing approval",
        description: "The testimonial is being approved...",
      });
    }
  };
  
  const handleDetailRevokeApproval = () => {
    if (selectedTestimonial) {
      revokeApproval(selectedTestimonial.id);
      toast({
        title: "Revoking approval",
        description: "The testimonial approval is being revoked...",
      });
    }
  };
  
  const handleDetailDelete = () => {
    if (selectedTestimonial) {
      setTestimonialToDelete(selectedTestimonial);
      setShowDetailDialog(false);
      setShowDeleteDialog(true);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Admin Navigation */}
          <AdminNav activePage="testimonials" />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-montserrat font-bold">Testimonials Management</h1>
                
                <div className="flex items-center space-x-2">
                  {activeTab === 'all' && allTestimonials && allTestimonials.length > 0 && (
                    <ExportButton
                      data={allTestimonials}
                      fileName="Testimonials_Export"
                      excludeFields={['id']}
                      dateFields={['createdAt', 'updatedAt']}
                      disabled={isLoadingAllTestimonials || !allTestimonials || allTestimonials.length === 0}
                    />
                  )}
                  {activeTab === 'pending' && pendingTestimonials && pendingTestimonials.length > 0 && (
                    <ExportButton
                      data={pendingTestimonials}
                      fileName="PendingTestimonials_Export"
                      excludeFields={['id']}
                      dateFields={['createdAt', 'updatedAt']}
                      disabled={isLoadingPendingTestimonials || !pendingTestimonials || pendingTestimonials.length === 0}
                    />
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant={activeTab === 'all' ? 'default' : 'outline'} 
                      onClick={() => {
                        setActiveTab('all');
                        setLocation('/admin/testimonials?tab=all');
                      }}
                      className="relative"
                    >
                      All Testimonials 
                    </Button>
                    <Button 
                      variant={activeTab === 'pending' ? 'default' : 'outline'} 
                      onClick={() => {
                        setActiveTab('pending');
                        setLocation('/admin/testimonials?tab=pending');
                      }}
                      className="relative"
                    >
                      Pending Approval
                      {pendingTestimonials?.length > 0 && (
                        <Badge className="ml-2 bg-primary text-white" variant="default">
                          {pendingTestimonials.length}
                        </Badge>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Search bar */}
              <div className="mb-6 relative">
                <Input
                  type="text"
                  placeholder="Search testimonials..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 border border-gray-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              
              {/* Testimonials table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-montserrat font-medium text-gray-500 uppercase tracking-wider">
                        Testimonial
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
                    {(activeTab === 'all' && isLoadingAllTestimonials) || 
                     (activeTab === 'pending' && isLoadingPendingTestimonials) ? (
                      <>
                        {[...Array(3)].map((_, index) => (
                          <tr key={`skeleton-${index}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="animate-pulse w-10 h-10 mr-3 rounded-full bg-gray-200"></div>
                                <div>
                                  <div className="animate-pulse h-4 w-20 bg-gray-200 rounded mb-2"></div>
                                  <div className="animate-pulse h-3 w-24 bg-gray-100 rounded"></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="animate-pulse flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <div key={i} className="h-4 w-4 bg-gray-200 rounded"></div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="animate-pulse h-4 w-36 bg-gray-200 rounded mb-2"></div>
                              <div className="animate-pulse h-4 w-24 bg-gray-100 rounded"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="animate-pulse h-5 w-16 bg-gray-200 rounded"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="animate-pulse h-6 w-12 bg-gray-200 rounded ml-auto"></div>
                            </td>
                          </tr>
                        ))}
                      </>
                    ) : activeTab === 'all' && filteredAllTestimonials?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          No testimonials found
                        </td>
                      </tr>
                    ) : activeTab === 'pending' && filteredPendingTestimonials?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          No pending testimonials
                        </td>
                      </tr>
                    ) : (
                      (activeTab === 'all' ? filteredAllTestimonials : filteredPendingTestimonials)?.map(testimonial => (
                        <tr key={testimonial.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage 
                                  src={testimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`} 
                                  alt={testimonial.name} 
                                />
                                <AvatarFallback>
                                  {testimonial.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                                <div className="text-sm text-gray-500">
                                  {testimonial.position}{testimonial.company ? `, ${testimonial.company}` : ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-500 line-clamp-2 max-w-xs cursor-pointer hover:text-blue-600 hover:underline" 
                               onClick={() => handleViewClick(testimonial)}>
                              "{testimonial.content}"
                            </p>
                            <div className="text-xs text-gray-400 mt-1">
                              {testimonial.createdAt ? formatDate(testimonial.createdAt) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {testimonial.approved ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Approved
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                Pending
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewClick(testimonial)}
                              className="text-blue-600 hover:text-blue-900 mr-2"
                              title="View testimonial details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!testimonial.approved ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(testimonial.id)}
                                disabled={isApproving}
                                className="text-green-600 hover:text-green-900 mr-2"
                                title="Approve testimonial"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeApproval(testimonial.id)}
                                disabled={isRevoking}
                                className="text-amber-600 hover:text-amber-900 mr-2"
                                title="Revoke approval"
                              >
                                <ShieldX className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(testimonial)}
                              disabled={isDeleting}
                              className="text-red-600 hover:text-red-900"
                              title="Delete testimonial"
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
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the testimonial from "{testimonialToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testimonial Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Testimonial Details</DialogTitle>
          </DialogHeader>
          
          {selectedTestimonial && (
            <div className="overflow-y-auto max-h-[70vh]">
              <div className="flex items-center mb-6">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage 
                    src={selectedTestimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTestimonial.name)}&background=random`} 
                    alt={selectedTestimonial.name} 
                  />
                  <AvatarFallback className="text-lg">
                    {selectedTestimonial.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedTestimonial.name}</h3>
                  <p className="text-gray-600">
                    {selectedTestimonial.position}{selectedTestimonial.company ? ` at ${selectedTestimonial.company}` : ''}
                  </p>
                  {selectedTestimonial.email && (
                    <p className="text-sm text-gray-500">{selectedTestimonial.email}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700 mr-2">Rating:</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < selectedTestimonial.rating 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Status:</h4>
                  {selectedTestimonial.approved ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      Approved
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                      Pending Approval
                    </Badge>
                  )}
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted on:</h4>
                  <p className="text-gray-600">
                    {selectedTestimonial.createdAt 
                      ? formatDate(selectedTestimonial.createdAt) 
                      : 'Date not available'}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Testimonial:</h4>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                    <p className="text-gray-800 whitespace-pre-wrap">"{selectedTestimonial.content}"</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <div>
              {selectedTestimonial && !selectedTestimonial.approved ? (
                <Button
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  onClick={handleDetailApprove}
                  disabled={isApproving}
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Testimonial
                    </>
                  )}
                </Button>
              ) : selectedTestimonial && selectedTestimonial.approved ? (
                <Button
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  onClick={handleDetailRevokeApproval}
                  disabled={isRevoking}
                >
                  {isRevoking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <ShieldX className="mr-2 h-4 w-4" />
                      Revoke Approval
                    </>
                  )}
                </Button>
              ) : null}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDetailDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialsManagement;