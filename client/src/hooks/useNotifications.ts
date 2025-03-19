import { useQuery } from "@tanstack/react-query";
import { Message, QuoteRequest, Testimonial } from "@shared/schema";
import { useMemo } from "react";

// Type for notification counts
export interface NotificationCounts {
  unreadMessages: number;
  pendingTestimonials: number;
  pendingQuoteRequests: number;
  total: number;
}

export const useNotifications = () => {
  // Get all messages
  const { 
    data: messages = [],
    isLoading: isLoadingMessages,
  } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    retry: 1,
  });

  // Get pending testimonials
  const { 
    data: pendingTestimonials = [],
    isLoading: isLoadingPendingTestimonials,
  } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials/pending"],
    retry: 1,
  });

  // Get all quote requests
  const { 
    data: quoteRequests = [],
    isLoading: isLoadingQuoteRequests,
  } = useQuery<QuoteRequest[]>({
    queryKey: ["/api/admin/quote/requests"],
    retry: 1,
  });

  // Calculate counts using useMemo instead of useEffect to avoid state updates
  const counts = useMemo(() => {
    // Calculate notification counts
    const unreadMessages = Array.isArray(messages) ? messages.filter(msg => !msg.read).length : 0;
    const pendingTestimonialsCount = Array.isArray(pendingTestimonials) ? pendingTestimonials.length : 0;
    const pendingQuoteRequestsCount = Array.isArray(quoteRequests) 
      ? quoteRequests.filter(quote => quote.status === "pending" && !quote.reviewed).length 
      : 0;
    
    const totalCount = unreadMessages + pendingTestimonialsCount + pendingQuoteRequestsCount;
    
    return {
      unreadMessages,
      pendingTestimonials: pendingTestimonialsCount,
      pendingQuoteRequests: pendingQuoteRequestsCount,
      total: totalCount
    };
  }, [messages, pendingTestimonials, quoteRequests]);

  return {
    counts,
    isLoading: isLoadingMessages || isLoadingPendingTestimonials || isLoadingQuoteRequests
  };
};