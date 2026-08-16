import React from "react";
import { CheckCircle2, AlertTriangle, Clock, Flame, Sparkles, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusBadgeVariant =
  | "available"
  | "limited"
  | "sold_out"
  | "preparing"
  | "ready"
  | "served"
  | "chef_pick"
  | "spicy"
  | "vegetarian"
  | "gluten_free";

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ variant, label, className, size = "sm" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px] gap-1" : "px-3 py-1 text-xs gap-1.5";

  switch (variant) {
    case "available":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-pill border border-status-available/20 bg-status-available-bg text-status-available",
            sizeClasses,
            className
          )}
        >
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span>{label || "Available"}</span>
        </span>
      );

    case "limited":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-pill border border-status-limited/20 bg-status-limited-bg text-status-limited",
            sizeClasses,
            className
          )}
        >
          <Clock className="h-3 w-3 shrink-0" />
          <span>{label || "Limited Stock"}</span>
        </span>
      );

    case "sold_out":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-pill border border-status-sold-out/20 bg-status-sold-out-bg text-status-sold-out",
            sizeClasses,
            className
          )}
        >
          <XCircle className="h-3 w-3 shrink-0" />
          <span>{label || "Sold Out"}</span>
        </span>
      );

    case "preparing":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-pill border border-status-preparing/20 bg-status-preparing-bg text-status-preparing",
            sizeClasses,
            className
          )}
        >
          <Clock className="h-3 w-3 shrink-0 animate-spin" />
          <span>{label || "In Kitchen"}</span>
        </span>
      );

    case "ready":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-pill border border-status-info/20 bg-status-info-bg text-status-info",
            sizeClasses,
            className
          )}
        >
          <Sparkles className="h-3 w-3 shrink-0" />
          <span>{label || "Ready for Pickup"}</span>
        </span>
      );

    case "served":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-pill border border-status-available/20 bg-status-available-bg text-status-available",
            sizeClasses,
            className
          )}
        >
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span>{label || "Served"}</span>
        </span>
      );

    case "chef_pick":
      return (
        <span
          className={cn(
            "inline-flex items-center font-semibold rounded-pill bg-background-active text-brand-accent border border-brand-accent/20",
            sizeClasses,
            className
          )}
        >
          <Sparkles className="h-3 w-3 shrink-0" />
          <span>{label || "Chef's Selection"}</span>
        </span>
      );

    case "spicy":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-pill bg-status-sold-out-bg text-status-sold-out border border-status-sold-out/15",
            sizeClasses,
            className
          )}
        >
          <Flame className="h-3 w-3 shrink-0" />
          <span>{label || "Spicy"}</span>
        </span>
      );

    case "vegetarian":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-pill bg-status-available-bg text-status-available border border-status-available/15",
            sizeClasses,
            className
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-status-available" />
          <span>{label || "Vegetarian"}</span>
        </span>
      );

    case "gluten_free":
      return (
        <span
          className={cn(
            "inline-flex items-center font-medium rounded-pill bg-background-active text-brand-primary border border-divider",
            sizeClasses,
            className
          )}
        >
          <Info className="h-3 w-3 shrink-0 text-brand-secondary" />
          <span>{label || "Teff / Gluten-Free"}</span>
        </span>
      );

    default:
      return null;
  }
}
