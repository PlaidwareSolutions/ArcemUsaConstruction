import { useMutation } from "@tanstack/react-query";
import { InsertQuoteRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export const useQuoteRequest = () => {
  const { toast } = useToast();

  // Mutation for submitting a quote request
  const quoteRequestMutation = useMutation({
    mutationFn: async (data: InsertQuoteRequest) => {
      const res = await apiRequest("POST", "/api/quote/request", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Request submitted",
        description: data.message || "Your quote request has been submitted successfully! We'll contact you soon.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message || "There was an error submitting your quote request. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    quoteRequestMutation,
    submitQuoteRequest: (data: InsertQuoteRequest) => quoteRequestMutation.mutate(data),
  };
};