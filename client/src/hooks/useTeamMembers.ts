import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamMember, InsertTeamMember } from '@shared/schema';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useTeamMembers(teamMemberId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get active team members (public)
  const { data: activeTeamMembers = [], isLoading: isLoadingActive } = useQuery<TeamMember[], Error, TeamMember[]>({
    queryKey: ['/api/team-members'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !teamMemberId
  });
  
  // Get all team members (admin)
  const { data: allTeamMembers = [], isLoading: isLoadingAll } = useQuery<TeamMember[], Error, TeamMember[]>({
    queryKey: ['/api/admin/team-members'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !teamMemberId
  });
  
  // Get specific team member
  const { data: teamMember, isLoading: isLoadingTeamMember } = useQuery<TeamMember | null, Error, TeamMember | null>({
    queryKey: ['/api/admin/team-members', teamMemberId],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!teamMemberId,
    initialData: null
  });

  // Create a team member
  const createTeamMemberMutation = useMutation({
    mutationFn: async (data: InsertTeamMember) => {
      return await apiRequest({
        url: '/api/admin/team-members',
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/team-members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      toast({
        title: "Success",
        description: "Team member created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create team member. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update a team member
  const updateTeamMemberMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertTeamMember> }) => {
      return await apiRequest({
        url: `/api/admin/team-members/${id}`,
        method: 'PUT',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/team-members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      toast({
        title: "Success",
        description: "Team member updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update team member. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle active status
  const toggleActiveStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/admin/team-members/${id}/toggle-active`,
        method: 'PUT'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/team-members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      toast({
        title: "Success",
        description: "Team member status updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update order
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, order }: { id: number; order: number }) => {
      return await apiRequest({
        url: `/api/admin/team-members/${id}/order`,
        method: 'PUT',
        body: { order }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/team-members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      toast({
        title: "Success",
        description: "Display order updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update display order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete team member
  const deleteTeamMemberMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/admin/team-members/${id}`,
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/team-members'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team-members'] });
      toast({
        title: "Success",
        description: "Team member deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete team member. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    activeTeamMembers,
    allTeamMembers,
    teamMember: teamMemberId ? (teamMember as TeamMember) : null,
    
    // Loading states
    isLoadingActive,
    isLoadingAll,
    isLoadingTeamMember,
    
    // Mutations
    createTeamMember: (data: InsertTeamMember) => createTeamMemberMutation.mutate(data),
    updateTeamMember: (id: number, data: Partial<InsertTeamMember>) => 
      updateTeamMemberMutation.mutate({ id, data }),
    toggleActiveStatus: (id: number) => toggleActiveStatusMutation.mutate(id),
    updateOrder: (id: number, order: number) => updateOrderMutation.mutate({ id, order }),
    deleteTeamMember: (id: number) => deleteTeamMemberMutation.mutate(id),
    
    // Mutation states
    isCreating: createTeamMemberMutation.isPending,
    isUpdating: updateTeamMemberMutation.isPending,
    isTogglingActive: toggleActiveStatusMutation.isPending,
    isUpdatingOrder: updateOrderMutation.isPending,
    isDeleting: deleteTeamMemberMutation.isPending,
  };
}