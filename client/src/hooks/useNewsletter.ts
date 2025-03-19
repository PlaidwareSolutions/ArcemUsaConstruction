import { useMutation } from "@tanstack/react-query";
import { InsertNewsletterSubscriber } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export const useNewsletter = () => {
  const { toast } = useToast();

  // Mutation for subscribing to the newsletter
  const subscriptionMutation = useMutation({
    mutationFn: async (data: InsertNewsletterSubscriber) => {
      const res = await apiRequest("POST", "/api/newsletter/subscribe", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscription successful",
        description: data.message || "Thank you for subscribing to our newsletter!",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message || "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for unsubscribing from the newsletter
  const unsubscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/newsletter/unsubscribe", { email });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Unsubscribed",
        description: data.message || "You have been unsubscribed from our newsletter.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Unsubscribe failed",
        description: error.message || "There was an error processing your unsubscribe request. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    subscriptionMutation,
    unsubscribeMutation,
    subscribe: (data: InsertNewsletterSubscriber) => subscriptionMutation.mutate(data),
    unsubscribe: (email: string) => unsubscribeMutation.mutate(email),
  };
};