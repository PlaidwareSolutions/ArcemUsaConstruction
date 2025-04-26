import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export interface SiteSetting {
  id: number;
  key: string;
  value: string;
  category: string;
  label: string;
  description: string | null;
  type: string;
  updatedAt: Date;
}

export function useSiteSettings() {
  const queryClient = useQueryClient();

  const {
    data: settings = [],
    isLoading,
    error,
  } = useQuery<SiteSetting[]>({
    queryKey: ["/api/site-settings"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: socialMediaSettings = [], isLoading: isLoadingSocialMedia } =
    useQuery<SiteSetting[]>({
      queryKey: ["/api/site-settings/category/social_media"],
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return apiRequest({
        url: `/api/admin/site-settings/key/${key}`,
        method: "PUT",
        body: { value },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/site-settings/category/social_media"],
      });
      toast({
        title: "Setting updated",
        description: "The setting has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error updating setting:", error);
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getSetting = (key: string): SiteSetting | undefined => {
    return settings.find((setting: SiteSetting) => setting.key === key);
  };

  const getSettingValue = (key: string): string => {
    const setting = getSetting(key);
    return setting?.value || "";
  };

  const updateSetting = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  return {
    settings,
    socialMediaSettings,
    isLoading,
    isLoadingSocialMedia,
    error,
    getSetting,
    getSettingValue,
    updateSetting,
    isPending: updateSettingMutation.isPending,
  };
}
