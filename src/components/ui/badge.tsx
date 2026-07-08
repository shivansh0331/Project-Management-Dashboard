import React from "react";
import { cn } from "@/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "info" | "danger" | "secondary";
}

export function Badge({ className, variant = "secondary", children, ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border leading-none shrink-0 uppercase select-none";

  const variants = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    info: "bg-primary/10 text-primary border-primary/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    secondary: "bg-secondary text-secondary-foreground border-border",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
