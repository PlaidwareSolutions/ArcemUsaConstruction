import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Subcontractor, 
  InsertSubcontractor,
  Vendor,
  InsertVendor
} from "@shared/schema";

export const useSubcontractors = () => {
  const { toast } = useToast();

  // For admin: Get all subcontractor applications
  const { 
    data: subcontractors = [], 
    isLoading: isLoadingSubcontractors, 
    error: subcontractorsError 
  } = useQuery<Subcontractor[]>({
    queryKey: ["/api/admin/subcontractors"],
    enabled: true, // Load automatically for admin pages
    refetchOnWindowFocus: true,
    staleTime: 30000 // 30 seconds
  });

  // For admin: Get all vendor applications
  const { 
    data: vendors = [], 
    isLoading: isLoadingVendors, 
    error: vendorsError 
  } = useQuery<Vendor[]>({
    queryKey: ["/api/admin/vendors"],
    enabled: true, // Load automatically for admin pages
    refetchOnWindowFocus: true,
    staleTime: 30000 // 30 seconds
  });

  // Enhanced submit subcontractor application with better validation and error handling
  const submitSubcontractorMutation = useMutation({
    mutationFn: async (data: InsertSubcontractor) => {
      // Input validation - improved safety checks
      if (!data) {
        throw new Error("No data provided for subcontractor application");
      }
      
      // Validate required fields
      const requiredFields = ['companyName', 'contactName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
      const missingFields = requiredFields.filter(field => !data[field as keyof InsertSubcontractor]);
      
      if (missingFields.length > 0) {
        console.error("Missing required subcontractor fields:", missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Array validation with proper error messaging
      if (!Array.isArray(data.serviceTypes) || data.serviceTypes.length === 0) {
        console.error("Invalid serviceTypes:", data.serviceTypes);
        throw new Error("Please select at least one service type");
      }
      
      // Clean and prepare data for submission
      const subcontractorData = {
        ...data,
        // Ensure all string fields are properly trimmed and all arrays are valid
        companyName: data.companyName.trim(),
        contactName: data.contactName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip: data.zip.trim(),
        website: data.website ? data.website.trim() : undefined,
        serviceTypes: data.serviceTypes, // Already validated above
        serviceDescription: data.serviceDescription.trim(),
        yearsInBusiness: data.yearsInBusiness,
        insurance: !!data.insurance, // Ensure boolean type
        bondable: !!data.bondable, // Ensure boolean type
        licenses: data.licenses ? data.licenses.trim() : "",
        references: data.references ? data.references.trim() : "",
        howDidYouHear: data.howDidYouHear ? data.howDidYouHear.trim() : "",
      };
      
      // Enhanced logging for easier debugging
      console.log("Submitting subcontractor application:", {
        companyName: subcontractorData.companyName,
        contactName: subcontractorData.contactName,
        email: subcontractorData.email,
        serviceTypes: subcontractorData.serviceTypes,
        // Log length of longer fields rather than entire content
        serviceDescriptionLength: subcontractorData.serviceDescription.length,
        referencesProvided: subcontractorData.references.length > 0,
      });
      
      // Submit application with proper error handling
      try {
        return await apiRequest({
          url: "/api/subcontractors/apply",
          method: "POST",
          body: subcontractorData
        });
      } catch (err) {
        console.error("API request failed:", err);
        if (err instanceof Error) {
          throw err;
        } else {
          throw new Error("Failed to submit application. Please try again.");
        }
      }
    },
    onSuccess: (data) => {
      console.log("Subcontractor application submitted successfully:", data);
      toast({
        title: "Application Submitted Successfully",
        description: "Thank you! Your subcontractor application has been received. We will review it and contact you soon.",
      });
    },
    onError: (error: Error) => {
      console.error("Subcontractor application submission error:", error);
      
      // Provide more specific error messages based on error types
      const errorMessage = error.message.includes("Network")
        ? "Network error: Please check your internet connection and try again."
        : error.message || "Failed to submit subcontractor application. Please try again.";
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Enhanced submit vendor application with better validation and error handling
  const submitVendorMutation = useMutation({
    mutationFn: async (data: InsertVendor) => {
      // Input validation - improved safety checks
      if (!data) {
        throw new Error("No data provided for vendor application");
      }
      
      // Validate required fields
      const requiredFields = ['companyName', 'contactName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
      const missingFields = requiredFields.filter(field => !data[field as keyof InsertVendor]);
      
      if (missingFields.length > 0) {
        console.error("Missing required vendor fields:", missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Array validation with proper error messaging
      if (!Array.isArray(data.supplyTypes) || data.supplyTypes.length === 0) {
        console.error("Invalid supplyTypes:", data.supplyTypes);
        throw new Error("Please select at least one product/supply type");
      }
      
      // Clean and prepare data for submission
      const vendorData = {
        ...data,
        // Ensure all string fields are properly trimmed and all arrays are valid
        companyName: data.companyName.trim(),
        contactName: data.contactName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        zip: data.zip.trim(),
        website: data.website ? data.website.trim() : undefined,
        supplyTypes: data.supplyTypes, // Already validated above
        serviceDescription: data.serviceDescription.trim(),
        yearsInBusiness: data.yearsInBusiness,
        references: data.references ? data.references.trim() : "",
        howDidYouHear: data.howDidYouHear ? data.howDidYouHear.trim() : "",
      };
      
      // Enhanced logging for easier debugging
      console.log("Submitting vendor application:", {
        companyName: vendorData.companyName,
        contactName: vendorData.contactName,
        email: vendorData.email,
        supplyTypes: vendorData.supplyTypes,
        // Log length of longer fields rather than entire content
        serviceDescriptionLength: vendorData.serviceDescription.length,
        referencesProvided: vendorData.references.length > 0,
      });
      
      // Submit application with proper error handling
      try {
        return await apiRequest({
          url: "/api/vendors/apply",
          method: "POST",
          body: vendorData
        });
      } catch (err) {
        console.error("API request failed:", err);
        if (err instanceof Error) {
          throw err;
        } else {
          throw new Error("Failed to submit application. Please try again.");
        }
      }
    },
    onSuccess: (data) => {
      console.log("Vendor application submitted successfully:", data);
      toast({
        title: "Application Submitted Successfully",
        description: "Thank you! Your vendor application has been received. We will review it and contact you soon.",
      });
    },
    onError: (error: Error) => {
      console.error("Vendor application submission error:", error);
      
      // Provide more specific error messages based on error types
      const errorMessage = error.message.includes("Network")
        ? "Network error: Please check your internet connection and try again."
        : error.message || "Failed to submit vendor application. Please try again.";
      
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Admin: Update subcontractor status
  const updateSubcontractorStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest({
        url: `/api/admin/subcontractors/${id}/status`,
        method: "PUT",
        body: { status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subcontractors"] });
      toast({
        title: "Status Updated",
        description: "Subcontractor application status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Admin: Update subcontractor notes
  const updateSubcontractorNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      return await apiRequest({
        url: `/api/admin/subcontractors/${id}/notes`,
        method: "PUT",
        body: { notes }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subcontractors"] });
      toast({
        title: "Notes Updated",
        description: "Subcontractor application notes have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update notes. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Admin: Delete subcontractor application
  const deleteSubcontractorMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/admin/subcontractors/${id}`,
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subcontractors"] });
      toast({
        title: "Application Deleted",
        description: "Subcontractor application has been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Admin: Update vendor status
  const updateVendorStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest({
        url: `/api/admin/vendors/${id}/status`,
        method: "PUT",
        body: { status }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
      toast({
        title: "Status Updated",
        description: "Vendor application status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Admin: Update vendor notes
  const updateVendorNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      return await apiRequest({
        url: `/api/admin/vendors/${id}/notes`,
        method: "PUT",
        body: { notes }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
      toast({
        title: "Notes Updated",
        description: "Vendor application notes have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update notes. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Admin: Delete vendor application
  const deleteVendorMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/admin/vendors/${id}`,
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
      toast({
        title: "Application Deleted",
        description: "Vendor application has been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete application. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    subcontractors,
    vendors,
    isLoadingSubcontractors,
    isLoadingVendors,
    subcontractorsError,
    vendorsError,

    // Public actions
    submitSubcontractorApplication: (data: InsertSubcontractor) => 
      submitSubcontractorMutation.mutate(data),
    submitVendorApplication: (data: InsertVendor) => 
      submitVendorMutation.mutate(data),
    
    // Admin actions
    updateSubcontractorStatus: (id: number, status: string) => 
      updateSubcontractorStatusMutation.mutate({ id, status }),
    updateSubcontractorNotes: (id: number, notes: string) => 
      updateSubcontractorNotesMutation.mutate({ id, notes }),
    deleteSubcontractor: (id: number) => 
      deleteSubcontractorMutation.mutate(id),
    updateVendorStatus: (id: number, status: string) => 
      updateVendorStatusMutation.mutate({ id, status }),
    updateVendorNotes: (id: number, notes: string) => 
      updateVendorNotesMutation.mutate({ id, notes }),
    deleteVendor: (id: number) => 
      deleteVendorMutation.mutate(id),
  };
};