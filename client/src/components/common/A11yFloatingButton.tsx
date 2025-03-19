import { useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const RequestQuoteButton = () => {
  const [location] = useLocation();
  const isAdminPage = location.startsWith("/admin");

  // Don't show the button on admin pages or on the request quote page
  if (isAdminPage || location === "/request-quote") {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Link href="/request-quote">
        <Button
          size="lg"
          className="bg-[#1E90DB] hover:bg-[#1670B0] text-white shadow-lg flex items-center gap-2 font-bold transition-all duration-300 hover:scale-105"
        >
          <FileText className="h-5 w-5" />
          REQUEST QUOTE
        </Button>
      </Link>
    </div>
  );
};

export default RequestQuoteButton;
