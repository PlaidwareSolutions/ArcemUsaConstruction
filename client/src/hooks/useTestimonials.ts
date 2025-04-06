import { useQuery, useMutation } from "@tanstack/react-query";
import { Testimonial, PublicTestimonial, InsertTestimonial } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export const useTestimonials = () => {
  const { toast } = useToast();

  // Get all approved testimonials
  const {
    data: testimonials = [],
    isLoading: isLoadingTestimonials,
    error: testimonialError,
  } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
    retry: 1,
  });

  // Get all testimonials (including pending ones) - admin only
  const {
    data: allTestimonials = [],
    isLoading: isLoadingAllTestimonials,
    error: allTestimonialsError,
    refetch: refetchAllTestimonials,
  } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials"],
    retry: 1,
    // We don't set enabled: false to ensure data is loaded in admin pages
  });

  // Get pending testimonials - admin only
  const {
    data: pendingTestimonials = [],
    isLoading: isLoadingPendingTestimonials,
    error: pendingTestimonialsError,
    refetch: refetchPendingTestimonials,
  } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials/pending"],
    retry: 1,
    // We don't set enabled: false to ensure data is loaded in admin pages
  });

  // Mutation to submit a new testimonial
  const submitTestimonialMutation = useMutation({
    mutationFn: async (data: PublicTestimonial) => {
      return apiRequest({
        url: "/api/testimonials/submit",
        method: "POST",
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Testimonial submitted",
        description: "Thank you for your feedback! Your testimonial will be reviewed before being published.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit testimonial",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to approve a testimonial - admin only
  const approveTestimonialMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest({
        url: `/api/admin/testimonials/${id}/approve`,
        method: "PUT"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials/pending"] });
      toast({
        title: "Testimonial approved",
        description: "The testimonial has been published to the website.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve testimonial",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation to revoke approval of a testimonial - admin only
  const revokeApprovalMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest({
        url: `/api/admin/testimonials/${id}/revoke`,
        method: "PUT"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials/pending"] });
      toast({
        title: "Approval revoked",
        description: "The testimonial has been unpublished from the website.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to revoke approval",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a testimonial - admin only
  const deleteTestimonialMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest({
        url: `/api/admin/testimonials/${id}`,
        method: "DELETE"
      });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials/pending"] });
      toast({
        title: "Testimonial deleted",
        description: "The testimonial has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete testimonial",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Wrapper functions
  const submitTestimonial = (data: PublicTestimonial) => {
    submitTestimonialMutation.mutate(data);
  };

  const approveTestimonial = (id: number) => {
    approveTestimonialMutation.mutate(id);
  };

  const revokeApproval = (id: number) => {
    revokeApprovalMutation.mutate(id);
  };

  const deleteTestimonial = (id: number) => {
    deleteTestimonialMutation.mutate(id);
  };

  return {
    // Data
    testimonials,
    allTestimonials,
    pendingTestimonials,
    
    // Loading states
    isLoadingTestimonials,
    isLoadingAllTestimonials,
    isLoadingPendingTestimonials,
    
    // Submission states
    isSubmitting: submitTestimonialMutation.isPending,
    isApproving: approveTestimonialMutation.isPending,
    isRevoking: revokeApprovalMutation.isPending,
    isDeleting: deleteTestimonialMutation.isPending,
    
    // Actions
    submitTestimonial,
    approveTestimonial,
    revokeApproval,
    deleteTestimonial,
    
    // Refetch
    refetchPendingTestimonials,
    refetchAllTestimonials,
  };
};