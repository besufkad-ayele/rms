import React from "react";
import { cn } from "@/lib/utils";

interface TibebDividerProps {
  className?: string;
  subtle?: boolean;
}

export function TibebDivider({ className, subtle = false }: TibebDividerProps) {
  return (
    <div className={cn("relative flex items-center justify-center my-8 w-full overflow-hidden select-none", className)}>
      <div className="h-[1px] w-full bg-divider" />
      <div
        className={cn(
          "absolute px-4 bg-background flex items-center gap-1 text-brand-muted",
          subtle ? "opacity-60" : "opacity-85"
        )}
      >
        <span className="inline-block h-1.5 w-1.5 rotate-45 border border-brand-accent/40 bg-background-active" />
        <span className="inline-block h-2 w-2 rotate-45 border border-brand-accent/60 bg-brand-accent/20" />
        <span className="inline-block h-1.5 w-1.5 rotate-45 border border-brand-accent/40 bg-background-active" />
      </div>
    </div>
  );
}
