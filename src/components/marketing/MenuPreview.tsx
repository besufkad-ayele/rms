"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MENU_ITEMS, MenuItemData } from "@/data/mockMenu";
import { DishCard } from "@/components/menu/DishCard";
import { DishDetailModal } from "@/components/menu/DishDetailModal";
import { useLanguage } from "@/context/LanguageContext";

export function MenuPreview() {
  const [selectedDish, setSelectedDish] = useState<MenuItemData | null>(null);
  const { isAmharic } = useLanguage();

  // Select premier signature items
  const signatureItems = MENU_ITEMS.slice(0, 6);

  return (
    <section id="menu-preview" className="bg-background-subtle py-16 lg:py-24 border-y border-divider">
      <div className="mx-auto max-w-7xl px-6 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-pill bg-background-active px-3.5 py-1.5 text-xs font-semibold font-zibriqriq text-brand-accent shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isAmharic ? "የከረን አዲስ መላክተ ምግቦች" : "Signature Selections"}</span>
            </div>
            <h2 className="font-abenet text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-primary leading-tight">
              {isAmharic ? "በእሳት እና በጥንታዊ ጥበብ የበሰሉ ምግቦች" : "Crafted with Heritage & Fire"}
            </h2>
            <p className="text-sm sm:text-base font-nyala text-brand-secondary leading-relaxed">
              {isAmharic
                ? "እያንዳንዱ አዘገጃጀት ለዘመናት በቆየው የሃገራችን ቅመማ ቅመም፣ በነጠረ ጥሬ ቂቤ እና በንጹህ የሀገር ጤፍ የተዘጋጀ ነው::"
                : "Every recipe is grounded in centuries-old highland seasoning techniques, artisanal cold-pressed spiced butter, and pure organic teff grain."}
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-sm font-semibold font-nyala text-brand-accent hover:text-brand-accent-hover transition group"
          >
            <span>{isAmharic ? "ሁሉንም 20+ ምግቦች ይመልከቱ" : "Explore All 20+ Dishes"}</span>
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Photography-led Dish Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
        <div className="text-center pt-6">
          <Link
            href="/menu"
            className="min-h-[48px] inline-flex items-center justify-center gap-2.5 rounded-button bg-brand-primary px-8 py-3.5 text-sm font-semibold font-nyala text-white shadow-card transition hover:bg-black active:scale-95"
          >
            <span>{isAmharic ? "ሙሉውን ዲጂታል ሜኑ ይመልከቱ" : "View Full Digital Menu"}</span>
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
