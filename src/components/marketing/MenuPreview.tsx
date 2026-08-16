"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MENU_ITEMS, MenuItemData } from "@/data/mockMenu";
import { DishCard } from "@/components/menu/DishCard";
import { DishDetailModal } from "@/components/menu/DishDetailModal";

export function MenuPreview() {
  const [selectedDish, setSelectedDish] = useState<MenuItemData | null>(null);

  // Select 6 premier signature items
  const signatureItems = MENU_ITEMS.slice(0, 6);

  return (
    <section id="menu-preview" className="bg-background-subtle py-16 lg:py-24 border-y border-divider">
      <div className="mx-auto max-w-7xl px-6 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-pill bg-background-active px-3 py-1 text-xs font-semibold text-brand-accent">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Signature Selections</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-primary">
              Crafted with Heritage & Fire
            </h2>
            <p className="text-sm text-brand-secondary leading-relaxed">
              Every recipe is grounded in centuries-old highland seasoning techniques, artisanal cold-pressed spiced butter, and pure organic teff grain.
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition group"
          >
            <span>Explore All 20+ Dishes</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Photography-led Dish Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signatureItems.map((item) => (
            <DishCard
              key={item.id}
              item={item}
              mode="view"
              layout="grid"
              onSelect={(selected) => setSelectedDish(selected)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <Link
            href="/menu"
            className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-button bg-brand-primary px-8 py-3.5 text-sm font-semibold text-white shadow-card transition hover:bg-black active:scale-95"
          >
            <span>View Full Digital Menu</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Dish Quick Detail Modal */}
      <DishDetailModal
        item={selectedDish}
        isOpen={!!selectedDish}
        onClose={() => setSelectedDish(null)}
        isOrderMode={false}
      />
    </section>
  );
}
