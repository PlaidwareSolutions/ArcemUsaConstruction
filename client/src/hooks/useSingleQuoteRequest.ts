import { useQuery } from "@tanstack/react-query";
import { QuoteRequest, QuoteRequestAttachment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export interface QuoteRequestWithAttachments extends QuoteRequest {
  attachments?: QuoteRequestAttachment[];
}

export const useSingleQuoteRequest = (id: number | undefined) => {
  const { data, isLoading, isError, error } = useQuery<QuoteRequestWithAttachments>({
    queryKey: ["/api/admin/quote/requests", id],
    queryFn: async ({ queryKey }) => {
      const [, quoteId] = queryKey;
      if (!quoteId) throw new Error("Quote request ID is required");
      
      const response = await apiRequest({
        method: 'GET',
        url: `/api/admin/quote/requests/${quoteId}`
      });
      
      // Ensure we never return null
      if (!response) {
        throw new Error("Failed to fetch quote request");
      }
      
      return response as QuoteRequestWithAttachments;
    },
    enabled: !!id,
  });

  return {
    quoteRequest: data,
    isLoading,
    isError,
    error
  };
};