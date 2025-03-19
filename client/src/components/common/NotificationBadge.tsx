import React from "react";
import { Bell } from "lucide-react";
import { Link } from "wouter";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationIndicator from "@/components/common/NotificationIndicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NotificationBadge: React.FC = () => {
  const { counts, isLoading } = useNotifications();

  if (isLoading) return null;
  
  if (counts.total === 0) {
    return (
      <div className="relative mr-1">
        <Bell className="w-6 h-6 text-white" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative mr-1 focus:outline-none">
          <Bell className="w-6 h-6 text-white" />
          <NotificationIndicator
            count={counts.total}
            size="sm"
            className="absolute -top-1 -right-1"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-bold bg-[#1E90DB] text-white">
          Notifications
        </DropdownMenuLabel>
        
        {counts.unreadMessages > 0 && (
          <DropdownMenuItem asChild>
            <Link href="/admin/messages" className="cursor-pointer">
              <div className="flex items-center justify-between w-full">
                <span>Unread Messages</span>
                <NotificationIndicator count={counts.unreadMessages} size="sm" />
              </div>
            </Link>
          </DropdownMenuItem>
        )}
        
        {counts.pendingTestimonials > 0 && (
          <DropdownMenuItem asChild>
            <Link href="/admin/testimonials" className="cursor-pointer">
              <div className="flex items-center justify-between w-full">
                <span>Pending Testimonials</span>
                <NotificationIndicator count={counts.pendingTestimonials} size="sm" />
              </div>
            </Link>
          </DropdownMenuItem>
        )}
        
        {counts.pendingQuoteRequests > 0 && (
          <DropdownMenuItem asChild>
            <Link href="/admin/quotes" className="cursor-pointer">
              <div className="flex items-center justify-between w-full">
                <span>Pending Quote Requests</span>
                <NotificationIndicator count={counts.pendingQuoteRequests} size="sm" />
              </div>
            </Link>
          </DropdownMenuItem>
        )}
        
        {counts.total === 0 && (
          <DropdownMenuItem className="text-center text-gray-500">
            No new notifications
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin" className="text-center text-sm font-medium text-[#1E90DB] cursor-pointer w-full">
            View Admin Dashboard
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBadge;