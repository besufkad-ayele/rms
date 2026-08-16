"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface CategoryTabsProps {
  categories: readonly Category[] | Category[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function CategoryTabs({ categories, activeId, onChange, className }: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (id: string, e: React.MouseEvent<HTMLButtonElement>) => {
    onChange(id);
    // Smooth scroll active button into view within its container
    e.currentTarget.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto py-2 px-1 no-scrollbar scroll-smooth"
      >
        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={(e) => handleSelect(cat.id, e)}
              className={cn(
                "min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center gap-2 rounded-pill px-5 text-sm font-medium transition-all duration-150 ease-out select-none",
                isActive
                  ? "bg-brand-accent text-white shadow-sm ring-2 ring-brand-accent/20"
                  : "bg-background-card/50 text-brand-primary hover:bg-background-active hover:text-brand-primary"
              )}
            >
              {cat.icon && <span className="shrink-0">{cat.icon}</span>}
              <span className="whitespace-nowrap">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
