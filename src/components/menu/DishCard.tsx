"use client";

import React from "react";
import Image from "next/image";
import { Plus, Minus, Info, Clock, Sparkles } from "lucide-react";
import { MenuItemData } from "@/data/mockMenu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatETB, cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

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
  const { isAmharic } = useLanguage();
  const isAvailable = item.isAvailable && item.status !== "sold_out";

  const primaryName = isAmharic ? item.amharicName || item.name : item.name;
  const secondaryName = isAmharic ? item.name : item.amharicName;

  return (
    <div
      onClick={() => onSelect?.(item)}
      className={cn(
        "group relative flex rounded-card border border-divider/80 bg-white p-4 shadow-card transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-elevated cursor-pointer text-left overflow-hidden",
        layout === "grid" ? "flex-col gap-4" : "flex-row gap-4 sm:gap-5 items-stretch",
        !isAvailable && "opacity-60 grayscale-[40%]"
      )}
    >
      {/* Accent top line on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-accent via-amber-600 to-brand-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Dish Photo */}
      <div
        className={cn(
          "relative overflow-hidden rounded-button bg-background-subtle shrink-0 shadow-xs",
          layout === "grid"
            ? "w-full h-48 sm:h-52"
            : "w-28 h-28 sm:w-32 sm:h-32 self-center"
        )}
      >
        <img
          src={item.photoUrl}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Floating Special Badge */}
        {item.isChefSpecial && (
          <span className="absolute top-2.5 left-2.5 rounded-pill bg-brand-accent/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-sm font-zibriqriq flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>{isAmharic ? "የሼፍ ምርጥ" : "Chef Special"}</span>
          </span>
        )}

        {/* Prep Time pill badge */}
        <span className="absolute bottom-2.5 left-2.5 rounded-pill bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-md flex items-center gap-1 font-nyala">
          <Clock className="h-3 w-3 text-amber-300" />
          <span>~{item.preparationMinutes} {isAmharic ? "ደቂቃ" : "min"}</span>
        </span>
      </div>

      {/* Dish Details */}
      <div className="flex flex-1 flex-col justify-between min-w-0 font-nyala">
        <div>
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {item.isSpicy && <StatusBadge variant="spicy" size="sm" />}
            {item.isVegetarian && <StatusBadge variant="vegetarian" size="sm" />}
            {item.isGlutenFree && <StatusBadge variant="gluten_free" size="sm" />}
            {item.status === "limited" && <StatusBadge variant="limited" size="sm" />}
            {!isAvailable && <StatusBadge variant="sold_out" size="sm" />}
          </div>

          {/* Title & Secondary Subtitle */}
          <div>
            <h3 className="font-abenet text-lg sm:text-xl font-bold text-brand-primary leading-tight group-hover:text-brand-accent transition-colors line-clamp-1">
              {primaryName}
            </h3>
            {secondaryName && (
              <span className="text-xs text-brand-secondary/90 font-medium block mt-0.5 line-clamp-1">
                {secondaryName}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-2 text-xs sm:text-sm text-brand-secondary/90 line-clamp-2 leading-relaxed font-nyala">
            {item.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-divider/70 pt-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-muted">
              {isAmharic ? "ዋጋ" : "Price"}
            </span>
            <span className="font-nyala text-base sm:text-lg font-bold text-brand-accent">
              {formatETB(item.price)}
            </span>
          </div>

          {mode === "order" ? (
            <div
              className="flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {quantity > 0 ? (
                <div className="flex items-center gap-2 rounded-pill bg-background-active px-2 py-1 border border-brand-accent/30">
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
                  className="min-h-[44px] min-w-[84px] inline-flex items-center justify-center gap-1.5 rounded-button bg-brand-accent px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand-accent-hover active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isAmharic ? "ጨምር" : "Add"}</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSelect?.(item)}
              className="min-h-[44px] inline-flex items-center gap-1.5 rounded-pill bg-background-subtle hover:bg-background-active px-3.5 py-1.5 text-xs font-bold text-brand-accent transition border border-divider"
            >
              <Info className="h-3.5 w-3.5 text-brand-accent" />
              <span>{isAmharic ? "ዝርዝር ይመልከቱ" : "View Details"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
