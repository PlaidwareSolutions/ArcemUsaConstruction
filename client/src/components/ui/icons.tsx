import { cn } from "@/lib/utils";
import {
  Loader2,
  Upload,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  spinner: Loader2,
  upload: Upload,
};

export type IconProps = LucideProps & {
  name: keyof typeof Icons;
} & {
  className?: string;
};

export function Icon({ name, className, ...props }: IconProps) {
  const Icon = Icons[name];

  if (!Icon) {
    return null;
  }

  return <Icon className={cn("h-4 w-4", className)} {...props} />;
}