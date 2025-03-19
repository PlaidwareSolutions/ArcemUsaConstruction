import { useState, useEffect } from 'react';
import { useSubcontractors } from '@/hooks/useSubcontractors';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import AdminNav from '@/components/admin/AdminNav';
import ExportButton from '@/components/admin/ExportButton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Eye, Trash2, Mail, Phone, ExternalLink, Building, MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Subcontractor, Vendor } from '@shared/schema';

export default function SubcontractorManagement() {
  const [location, setLocation] = useLocation();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('subcontractors');
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<Subcontractor | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');

  const {
    subcontractors,
    vendors,
    isLoadingSubcontractors,
    isLoadingVendors,
    updateSubcontractorStatus,
    updateSubcontractorNotes,
    deleteSubcontractor,
    updateVendorStatus,
    updateVendorNotes,
    deleteVendor,
  } = useSubcontractors();

  // Initial data loading
  useEffect(() => {
    // This will check if user is logged in and has admin role
    if (!isLoadingAuth && (!user || user.role !== 'admin')) {
      toast({
        title: 'Access Denied',
        description: 'You must be an admin to view this page.',
        variant: 'destructive',
      });
      setLocation('/');
    }
  }, [user, isLoadingAuth, toast, setLocation]);

  // Set page title
  useEffect(() => {
    document.title = 'Subcontractor & Vendor Management - ARCEM Admin';
  }, []);

  // Open subcontractor details dialog
  const viewSubcontractorDetails = (subcontractor: Subcontractor) => {
    setSelectedSubcontractor(subcontractor);
    setSelectedVendor(null);
    setNotes(subcontractor.notes || '');
    setStatus(subcontractor.status || 'pending');
    setIsDetailsOpen(true);
  };

  // Open vendor details dialog
  const viewVendorDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setSelectedSubcontractor(null);
    setNotes(vendor.notes || '');
    setStatus(vendor.status || 'pending');
    setIsDetailsOpen(true);
  };

  // Save subcontractor changes
  const saveSubcontractorChanges = async () => {
    if (!selectedSubcontractor) return;
    
    try {
      if (status !== selectedSubcontractor.status) {
        await updateSubcontractorStatus(selectedSubcontractor.id, status);
      }
      
      if (notes !== selectedSubcontractor.notes) {
        await updateSubcontractorNotes(selectedSubcontractor.id, notes);
      }
      
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error updating subcontractor:', error);
    }
  };

  // Save vendor changes
  const saveVendorChanges = async () => {
    if (!selectedVendor) return;
    
    try {
      if (status !== selectedVendor.status) {
        await updateVendorStatus(selectedVendor.id, status);
      }
      
      if (notes !== selectedVendor.notes) {
        await updateVendorNotes(selectedVendor.id, notes);
      }
      
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
  };

  // Handle delete subcontractor
  const handleDeleteSubcontractor = async (id: number) => {
    if (confirm('Are you sure you want to delete this subcontractor application? This action cannot be undone.')) {
      try {
        await deleteSubcontractor(id);
        toast({
          title: 'Application Deleted',
          description: 'The subcontractor application has been deleted.',
        });
      } catch (error) {
        console.error('Error deleting subcontractor:', error);
      }
    }
  };

  // Handle delete vendor
  const handleDeleteVendor = async (id: number) => {
    if (confirm('Are you sure you want to delete this vendor application? This action cannot be undone.')) {
      try {
        await deleteVendor(id);
        toast({
          title: 'Application Deleted',
          description: 'The vendor application has been deleted.',
        });
      } catch (error) {
        console.error('Error deleting vendor:', error);
      }
    }
  };

  // Filter subcontractors based on status
  const filteredSubcontractors = subcontractors.filter(s => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  // Filter vendors based on status
  const filteredVendors = vendors.filter(v => {
    if (statusFilter === 'all') return true;
    return v.status === statusFilter;
  });

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-600">Pending</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  if (isLoadingAuth || (!user && isLoadingAuth)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Admin Navigation */}
          <AdminNav activePage="subcontractors" />
          
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-montserrat font-bold mb-2">Subcontractor & Vendor Management</h1>
              <p className="text-gray-600">
                Manage subcontractor and vendor applications, track status, and add notes.
              </p>
            </div>

            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Subcontractors</p>
                      <h3 className="text-2xl font-bold">{subcontractors.length}</h3>
                    </div>
                    <div className="rounded-full p-2 bg-blue-100">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Approved Subcontractors</p>
                      <h3 className="text-2xl font-bold">{subcontractors.filter(s => s.status === 'approved').length}</h3>
                    </div>
                    <div className="rounded-full p-2 bg-green-100">
                      <Building className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                      <h3 className="text-2xl font-bold">{vendors.length}</h3>
                    </div>
                    <div className="rounded-full p-2 bg-amber-100">
                      <Building className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Approved Vendors</p>
                      <h3 className="text-2xl font-bold">{vendors.filter(v => v.status === 'approved').length}</h3>
                    </div>
                    <div className="rounded-full p-2 bg-purple-100">
                      <Building className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
              <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="subcontractors">Subcontractors</TabsTrigger>
                  <TabsTrigger value="vendors">Vendors</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Label htmlFor="status-filter" className="text-sm">Filter:</Label>
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger id="status-filter" className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subcontractors Tab Content */}
            {activeTab === 'subcontractors' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Subcontractor Applications</CardTitle>
                  <ExportButton
                    data={filteredSubcontractors || []}
                    fileName="Subcontractors_Export"
                    excludeFields={['id']}
                    dateFields={['createdAt', 'updatedAt']}
                    disabled={isLoadingSubcontractors || !filteredSubcontractors || filteredSubcontractors.length === 0}
                  />
                </CardHeader>
                <CardContent>
                  {isLoadingSubcontractors ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredSubcontractors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No subcontractor applications found
                    </div>
                  ) : (
                    <Table>
                      <TableCaption>A list of all subcontractor applications</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Services</TableHead>
                          <TableHead>Years in Business</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date Applied</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubcontractors.map((subcontractor) => (
                          <TableRow key={subcontractor.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewSubcontractorDetails(subcontractor)}>
                            <TableCell className="font-medium">{subcontractor.companyName}</TableCell>
                            <TableCell>
                              <div>{subcontractor.contactName}</div>
                              <div className="text-xs text-muted-foreground">{subcontractor.email}</div>
                            </TableCell>
                            <TableCell>
                              {subcontractor.serviceTypes && (
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {subcontractor.serviceTypes.slice(0, 2).map((service, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{service}</Badge>
                                  ))}
                                  {subcontractor.serviceTypes.length > 2 && (
                                    <Badge variant="outline" className="text-xs">+{subcontractor.serviceTypes.length - 2} more</Badge>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{subcontractor.yearsInBusiness || 'N/A'}</TableCell>
                            <TableCell>{getStatusBadge(subcontractor.status || 'pending')}</TableCell>
                            <TableCell>{subcontractor.createdAt ? formatDate(subcontractor.createdAt) : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                title="View Details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewSubcontractorDetails(subcontractor);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-1"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSubcontractor(subcontractor.id);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Vendors Tab Content */}
            {activeTab === 'vendors' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Vendor Applications</CardTitle>
                  <ExportButton
                    data={filteredVendors || []}
                    fileName="Vendors_Export"
                    excludeFields={['id']}
                    dateFields={['createdAt', 'updatedAt']}
                    disabled={isLoadingVendors || !filteredVendors || filteredVendors.length === 0}
                  />
                </CardHeader>
                <CardContent>
                  {isLoadingVendors ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredVendors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No vendor applications found
                    </div>
                  ) : (
                    <Table>
                      <TableCaption>A list of all vendor applications</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Supply Types</TableHead>
                          <TableHead>Years in Business</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date Applied</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVendors.map((vendor) => (
                          <TableRow key={vendor.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewVendorDetails(vendor)}>
                            <TableCell className="font-medium">{vendor.companyName}</TableCell>
                            <TableCell>
                              <div>{vendor.contactName}</div>
                              <div className="text-xs text-muted-foreground">{vendor.email}</div>
                            </TableCell>
                            <TableCell>
                              {vendor.supplyTypes && (
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {vendor.supplyTypes.slice(0, 2).map((supply, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{supply}</Badge>
                                  ))}
                                  {vendor.supplyTypes.length > 2 && (
                                    <Badge variant="outline" className="text-xs">+{vendor.supplyTypes.length - 2} more</Badge>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{vendor.yearsInBusiness || 'N/A'}</TableCell>
                            <TableCell>{getStatusBadge(vendor.status || 'pending')}</TableCell>
                            <TableCell>{vendor.createdAt ? formatDate(vendor.createdAt) : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                title="View Details"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewVendorDetails(vendor);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-1"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteVendor(vendor.id);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedSubcontractor 
                      ? `Subcontractor: ${selectedSubcontractor.companyName}`
                      : selectedVendor 
                        ? `Vendor: ${selectedVendor.companyName}`
                        : 'Application Details'
                    }
                  </DialogTitle>
                  <DialogDescription>
                    View and update application details
                  </DialogDescription>
                </DialogHeader>
                
                {selectedSubcontractor && (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Contact Information</h3>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{selectedSubcontractor.companyName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${selectedSubcontractor.email}`} className="text-blue-600 hover:underline">
                              {selectedSubcontractor.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${selectedSubcontractor.phone}`} className="text-blue-600 hover:underline">
                              {selectedSubcontractor.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {selectedSubcontractor.address}, {selectedSubcontractor.city}, {selectedSubcontractor.state} {selectedSubcontractor.zip}
                            </span>
                          </div>
                          {selectedSubcontractor.website && (
                            <div className="flex items-center gap-2">
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              <a 
                                href={selectedSubcontractor.website} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Website
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Location</h3>
                        <div className="mt-2">
                          <p>{selectedSubcontractor.address}</p>
                          <p>{selectedSubcontractor.city}, {selectedSubcontractor.state} {selectedSubcontractor.zip}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Business Information</h3>
                        <div className="mt-2">
                          <p>Years in business: <span className="font-medium">{selectedSubcontractor.yearsInBusiness || 'N/A'}</span></p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Service Types</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedSubcontractor.serviceTypes && selectedSubcontractor.serviceTypes.map((service, index) => (
                            <Badge key={index} variant="secondary">{service}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Status</h3>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Notes</h3>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this subcontractor..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                )}
                
                {selectedVendor && (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Contact Information</h3>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{selectedVendor.companyName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <a href={`mailto:${selectedVendor.email}`} className="text-blue-600 hover:underline">
                              {selectedVendor.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${selectedVendor.phone}`} className="text-blue-600 hover:underline">
                              {selectedVendor.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {selectedVendor.address}, {selectedVendor.city}, {selectedVendor.state} {selectedVendor.zip}
                            </span>
                          </div>
                          {selectedVendor.website && (
                            <div className="flex items-center gap-2">
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              <a 
                                href={selectedVendor.website} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Website
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Location</h3>
                        <div className="mt-2">
                          <p>{selectedVendor.address}</p>
                          <p>{selectedVendor.city}, {selectedVendor.state} {selectedVendor.zip}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">Business Information</h3>
                        <div className="mt-2">
                          <p>Years in business: <span className="font-medium">{selectedVendor.yearsInBusiness || 'N/A'}</span></p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Supply Types</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedVendor.supplyTypes && selectedVendor.supplyTypes.map((supply, index) => (
                            <Badge key={index} variant="secondary">{supply}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Status</h3>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Notes</h3>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes about this vendor..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                )}
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={selectedSubcontractor ? saveSubcontractorChanges : saveVendorChanges}
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}