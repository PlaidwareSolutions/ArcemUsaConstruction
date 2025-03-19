import React from "react";
import { cn } from "@/lib/utils";

interface NotificationIndicatorProps {
  count: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({
  count,
  size = "md",
  className,
}) => {
  if (count <= 0) return null;
  
  const sizeClasses = {
    sm: "w-4 h-4 text-[0.65rem]",
    md: "w-5 h-5 text-xs",
    lg: "w-6 h-6 text-sm"
  };
  
  return (
    <div
      className={cn(
        "rounded-full bg-red-500 text-white font-medium flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </div>
  );
};

export default NotificationIndicator;