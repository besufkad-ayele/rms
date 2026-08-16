"use client";

import React from "react";
import Image from "next/image";
import { Plus, Minus, Info } from "lucide-react";
import { MenuItemData } from "@/data/mockMenu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatETB, cn } from "@/lib/utils";

interface DishCardProps {
  item: MenuItemData;
  quantity?: number;
  onAdd?: (item: MenuItemData) => void;
  onRemove?: (item: MenuItemData) => void;
  onSelect?: (item: MenuItemData) => void;
  mode?: "order" | "view";
  layout?: "row" | "grid";
}

export function DishCard({
  item,
  quantity = 0,
  onAdd,
  onRemove,
  onSelect,
  mode = "order",
  layout = "row",
}: DishCardProps) {
  const isAvailable = item.isAvailable && item.status !== "sold_out";

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={cn(
        "group relative flex rounded-card border border-divider bg-white p-3.5 sm:p-4 shadow-card transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-elevated text-left",
        layout === "grid" ? "flex-col gap-3.5" : "flex-row gap-3.5 sm:gap-4 items-stretch",
        !isAvailable && "opacity-60 grayscale-[40%]"
      )}
    >
      {/* Dish Photo */}
      <div
        className={cn(
          "relative overflow-hidden rounded-button bg-background-subtle shrink-0",
          layout === "grid"
            ? "w-full h-44 sm:h-48"
            : "w-24 h-24 sm:w-28 sm:h-28 self-center"
        )}
      >
        <img
          src={item.photoUrl}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {item.isChefSpecial && (
          <span className="absolute top-2 left-2 rounded-pill bg-brand-primary/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            Chef Special
          </span>
        )}
      </div>

      {/* Dish Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {item.isSpicy && <StatusBadge variant="spicy" size="sm" />}
            {item.isVegetarian && <StatusBadge variant="vegetarian" size="sm" />}
            {item.isGlutenFree && <StatusBadge variant="gluten_free" size="sm" />}
            {item.status === "limited" && <StatusBadge variant="limited" size="sm" />}
            {!isAvailable && <StatusBadge variant="sold_out" size="sm" />}
          </div>

          {/* Name & Amharic */}
          <div className="flex items-baseline gap-2">
            <h3 className="font-header text-base font-semibold text-brand-primary leading-snug line-clamp-1">
              {item.name}
            </h3>
            {item.amharicName && (
              <span className="text-xs text-brand-secondary/80 font-normal hidden sm:inline">
                {item.amharicName}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-1 text-xs sm:text-sm text-brand-secondary line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-divider/60 pt-2.5">
          <div className="flex flex-col">
            <span className="text-[11px] text-brand-secondary">Price</span>
            <span className="font-sans text-base font-bold text-brand-accent">
              {formatETB(item.price)}
            </span>
          </div>

          {mode === "order" ? (
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {quantity > 0 ? (
                <div className="flex items-center gap-2 rounded-pill bg-background-active px-1.5 py-1 border border-brand-accent/30">
                  <button
                    type="button"
                    onClick={() => onRemove?.(item)}
                    aria-label={`Decrease ${item.name}`}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-white text-brand-primary hover:bg-brand-accent hover:text-white shadow-xs transition"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-brand-primary">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAdd?.(item)}
                    disabled={!isAvailable}
                    aria-label={`Increase ${item.name}`}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-brand-accent text-white hover:bg-brand-accent-hover shadow-xs transition disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onAdd?.(item)}
                  disabled={!isAvailable}
                  className="min-h-[44px] min-w-[80px] inline-flex items-center justify-center gap-1.5 rounded-button bg-brand-accent px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-accent-hover active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSelect?.(item)}
              className="min-h-[44px] inline-flex items-center gap-1 text-xs font-semibold text-brand-accent hover:text-brand-accent-hover underline-offset-4 hover:underline"
            >
              <Info className="h-3.5 w-3.5" />
              <span>Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
