"use client";

import React from "react";
import { X, Clock, Flame, ShieldAlert, Check, Plus } from "lucide-react";
import { MenuItemData } from "@/data/mockMenu";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatETB } from "@/lib/utils";

interface DishDetailModalProps {
  item: MenuItemData | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: MenuItemData) => void;
  isOrderMode?: boolean;
}

export function DishDetailModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
  isOrderMode = false,
}: DishDetailModalProps) {
  if (!isOpen || !item) return null;

  const isAvailable = item.isAvailable && item.status !== "sold_out";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-card bg-white shadow-drawer border border-divider animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3 right-3 z-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/80 text-brand-primary backdrop-blur-md shadow-card transition hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Hero Image */}
        <div className="relative h-60 w-full bg-background-subtle">
          <img
            src={item.photoUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              {item.amharicName && (
                <span className="text-xs font-medium text-white/80 tracking-wide">
                  {item.amharicName}
                </span>
              )}
              <h3 className="font-header text-xl font-bold text-white leading-tight">
                {item.name}
              </h3>
            </div>
            <span className="font-sans text-xl font-bold text-white bg-brand-accent/90 px-3 py-1 rounded-pill backdrop-blur-sm">
              {formatETB(item.price)}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center gap-2">
            {item.isChefSpecial && <StatusBadge variant="chef_pick" size="md" />}
            {item.isSpicy && <StatusBadge variant="spicy" size="md" />}
            {item.isVegetarian && <StatusBadge variant="vegetarian" size="md" />}
            {item.isGlutenFree && <StatusBadge variant="gluten_free" size="md" />}
            <span className="inline-flex items-center gap-1 text-xs text-brand-secondary bg-background-subtle px-2.5 py-1 rounded-pill border border-divider">
              <Clock className="h-3.5 w-3.5" />
              <span>~{item.preparationMinutes} min prep</span>
            </span>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
              Culinary Description
            </h4>
            <p className="mt-1.5 text-sm text-brand-primary leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Key Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
                Selected Ingredients & Aromatics
              </h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-button bg-background-active px-2.5 py-1 text-xs text-brand-primary border border-divider"
                  >
                    <Check className="h-3 w-3 text-brand-accent" />
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-divider p-4 bg-background-subtle flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-brand-secondary hover:text-brand-primary transition"
          >
            Back to Menu
          </button>

          {isOrderMode && (
            <button
              onClick={() => {
                if (isAvailable) {
                  onAddToCart?.(item);
                  onClose();
                }
              }}
              disabled={!isAvailable}
              className="min-h-[44px] flex-1 max-w-[200px] inline-flex items-center justify-center gap-2 rounded-button bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-accent-hover active:scale-95 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>Add to Order</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
