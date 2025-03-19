import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { JobPosting, InsertJobPosting } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export const useCareers = (jobId?: number) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all job postings (admin)
  const { data: allJobPostings = [], isLoading: isLoadingAll } = useQuery<JobPosting[], Error, JobPosting[]>({
    queryKey: ["/api/admin/careers"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !jobId
  });

  // Get active job postings (public)
  const { data: activeJobPostings = [], isLoading: isLoadingActive } = useQuery<JobPosting[], Error, JobPosting[]>({
    queryKey: ["/api/careers"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !jobId
  });

  // Get featured job postings (public)
  const { data: featuredJobPostings = [], isLoading: isLoadingFeatured } = useQuery<JobPosting[], Error, JobPosting[]>({
    queryKey: ["/api/careers/featured"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !jobId
  });

  // Get a specific job posting
  const { data: jobPosting, isLoading: isLoadingJob } = useQuery<JobPosting | null, Error, JobPosting | null>({
    queryKey: ["/api/careers", jobId],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!jobId,
    initialData: null
  });

  // Admin: Get a specific job posting (even if inactive)
  const { data: adminJobPosting, isLoading: isLoadingAdminJob } = useQuery<JobPosting | null, Error, JobPosting | null>({
    queryKey: ["/api/admin/careers", jobId],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!jobId,
    initialData: null
  });

  // Create a new job posting
  const createJobPostingMutation = useMutation({
    mutationFn: async (data: InsertJobPosting) => {
      return await apiRequest({
        url: `/api/admin/careers`,
        method: "POST",
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers/featured"] });
      toast({
        title: "Success",
        description: "Job posting created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create job posting: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update a job posting
  const updateJobPostingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertJobPosting> }) => {
      return await apiRequest({
        url: `/api/admin/careers/${id}`,
        method: "PUT",
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers/featured"] });
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/careers", jobId] });
      }
      toast({
        title: "Success",
        description: "Job posting updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update job posting: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle active status
  const toggleActiveStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/admin/careers/${id}/toggle-active`,
        method: "PUT"
      });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers/featured"] });
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/careers", id] });
      }
      toast({
        title: "Success",
        description: "Job status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update job status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle featured status
  const toggleFeaturedStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/admin/careers/${id}/toggle-featured`,
        method: "PUT"
      });
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers/featured"] });
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/careers", id] });
      }
      toast({
        title: "Success",
        description: "Featured status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update featured status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a job posting
  const deleteJobPostingMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/admin/careers/${id}`,
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/careers/featured"] });
      toast({
        title: "Success",
        description: "Job posting deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete job posting: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    allJobPostings,
    activeJobPostings,
    featuredJobPostings,
    jobPosting: jobId ? (jobPosting as JobPosting) : null,
    adminJobPosting: jobId ? (adminJobPosting as JobPosting) : null,
    
    // Loading states
    isLoadingAll,
    isLoadingActive,
    isLoadingFeatured,
    isLoadingJob,
    isLoadingAdminJob,
    
    // Mutations
    createJobPosting: (data: InsertJobPosting) => createJobPostingMutation.mutate(data),
    updateJobPosting: (id: number, data: Partial<InsertJobPosting>) => 
      updateJobPostingMutation.mutate({ id, data }),
    toggleActiveStatus: (id: number) => toggleActiveStatusMutation.mutate(id),
    toggleFeaturedStatus: (id: number) => toggleFeaturedStatusMutation.mutate(id),
    deleteJobPosting: (id: number) => deleteJobPostingMutation.mutate(id),
    
    // Mutation states
    isCreating: createJobPostingMutation.isPending,
    isUpdating: updateJobPostingMutation.isPending,
    isTogglingActive: toggleActiveStatusMutation.isPending,
    isTogglingFeatured: toggleFeaturedStatusMutation.isPending,
    isDeleting: deleteJobPostingMutation.isPending,
  };
};