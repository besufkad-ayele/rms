"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  QrCode,
  Sparkles,
  Flame,
  Check,
  ArrowRight,
  UtensilsCrossed,
  Info,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { MENU_ITEMS, MENU_CATEGORIES, MOCK_TABLES, MenuItemData, RESTAURANT_INFO } from "@/data/mockMenu";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { DishCard } from "@/components/menu/DishCard";
import { DishDetailModal } from "@/components/menu/DishDetailModal";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { cn } from "@/lib/utils";

export default function BrowsableMenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDish, setSelectedDish] = useState<MenuItemData | null>(null);
  const [showTableSelectModal, setShowTableSelectModal] = useState(false);

  // Dietary filters
  const [filterSpicy, setFilterSpicy] = useState(false);
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterGlutenFree, setFilterGlutenFree] = useState(false);
  const [filterChefSpecial, setFilterChefSpecial] = useState(false);

  const filteredDishes = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // Category match
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAmharic = item.amharicName?.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesIng = item.ingredients.some((ing) => ing.toLowerCase().includes(q));
        if (!matchesName && !matchesAmharic && !matchesDesc && !matchesIng) {
          return false;
        }
      }
      // Dietary filter matches
      if (filterSpicy && !item.isSpicy) return false;
      if (filterVeg && !item.isVegetarian) return false;
      if (filterGlutenFree && !item.isGlutenFree) return false;
      if (filterChefSpecial && !item.isChefSpecial) return false;

      return true;
    });
  }, [selectedCategory, searchQuery, filterSpicy, filterVeg, filterGlutenFree, filterChefSpecial]);

  return (
    <div className="min-h-screen bg-background text-brand-primary">
      <MarketingNav />

      {/* Menu Header Banner */}
      <div className="bg-background-subtle border-b border-divider py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-brand-accent tracking-widest uppercase block">
                {RESTAURANT_INFO.name} Gastronomy
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-brand-primary">
                Artisan Culinary Menu
              </h1>
              <p className="text-xs sm:text-sm text-brand-secondary max-w-xl">
                Browse our complete selection of slow-simmered wots, wood-fired hearth tibs, fasting platters, and highland honey tej.
              </p>
            </div>

            {/* "Scan to Order" Prompt Card */}
            <div className="rounded-card border border-brand-accent/20 bg-background-active p-4 sm:p-5 shadow-xs max-w-md flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-brand-accent text-white shadow-xs">
                <QrCode className="h-6 w-6" />
              </div>
              <div className="space-y-2 flex-1">
                <div>
                  <h3 className="font-header text-sm font-bold text-brand-primary">
                    Seated at a Table?
                  </h3>
                  <p className="text-xs text-brand-secondary leading-snug">
                    Scan the QR code on your table to order directly from your phone.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTableSelectModal(true)}
                  className="min-h-[38px] inline-flex items-center gap-1 text-xs font-bold text-brand-accent hover:text-brand-accent-hover underline-offset-4 hover:underline"
                >
                  <span>Select Table for Digital Ordering Demo</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes by name, spice, or ingredients (e.g. Awaze, Kitfo, Shiro)..."
                className="w-full min-h-[44px] rounded-button border border-divider bg-white pl-10 pr-4 text-sm text-brand-primary placeholder:text-brand-secondary/70 focus:outline-none focus:ring-1 focus:ring-brand-accent shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-primary p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Dietary Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterSpicy(!filterSpicy)}
                className={cn(
                  "min-h-[44px] px-3.5 py-1.5 rounded-pill text-xs font-semibold inline-flex items-center gap-1 border transition select-none",
                  filterSpicy
                    ? "bg-status-sold-out text-white border-status-sold-out"
                    : "bg-white text-brand-secondary border-divider hover:bg-background-subtle"
                )}
              >
                <Flame className="h-3 w-3" />
                <span>Spicy</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterVeg(!filterVeg)}
                className={cn(
                  "min-h-[44px] px-3.5 py-1.5 rounded-pill text-xs font-semibold inline-flex items-center gap-1 border transition select-none",
                  filterVeg
                    ? "bg-status-available text-white border-status-available"
                    : "bg-white text-brand-secondary border-divider hover:bg-background-subtle"
                )}
              >
                <Check className="h-3 w-3" />
                <span>Vegetarian / Fasting</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterGlutenFree(!filterGlutenFree)}
                className={cn(
                  "min-h-[44px] px-3.5 py-1.5 rounded-pill text-xs font-semibold inline-flex items-center gap-1 border transition select-none",
                  filterGlutenFree
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-brand-secondary border-divider hover:bg-background-subtle"
                )}
              >
                <Sparkles className="h-3 w-3" />
                <span>Teff / Gluten-Free</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Category Horizontal Scrolling Navigation */}
        <div className="sticky top-[73px] z-30 bg-white/95 backdrop-blur-md py-2 border-b border-divider/60">
          <CategoryTabs
            categories={MENU_CATEGORIES}
            activeId={selectedCategory}
            onChange={(id) => setSelectedCategory(id)}
          />
        </div>

        {/* Dish Catalog Grid */}
        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                item={dish}
                mode="view"
                layout="grid"
                onSelect={(selected) => setSelectedDish(selected)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-divider bg-background-subtle p-12 text-center space-y-3">
            <UtensilsCrossed className="mx-auto h-8 w-8 text-brand-muted" />
            <h3 className="font-header text-lg font-bold text-brand-primary">
              No matching culinary dishes found
            </h3>
            <p className="text-xs text-brand-secondary max-w-md mx-auto">
              Try adjusting your search keywords or resetting dietary filters to view our full menu.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setFilterSpicy(false);
                setFilterVeg(false);
                setFilterGlutenFree(false);
                setFilterChefSpecial(false);
              }}
              className="mt-2 text-xs font-semibold text-brand-accent hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </main>

      {/* Dish Detail Modal */}
      <DishDetailModal
        item={selectedDish}
        isOpen={!!selectedDish}
        onClose={() => setSelectedDish(null)}
        isOrderMode={false}
      />

      {/* Table Selector Modal for Demo / Guests */}
      {showTableSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-card bg-white p-6 shadow-drawer border border-divider space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-button bg-brand-accent text-white">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-header text-base font-bold text-brand-primary">
                    Select Your Table
                  </h3>
                  <p className="text-xs text-brand-secondary">
                    Launch the instant mobile ordering session
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTableSelectModal(false)}
                className="p-1 rounded-md text-brand-secondary hover:text-brand-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {Object.values(MOCK_TABLES).map((table) => (
                <Link
                  key={table.code}
                  href={`/order/${table.code}`}
                  className="p-3 rounded-button border border-divider hover:border-brand-accent hover:bg-background-active text-left transition space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-header font-bold text-sm text-brand-primary group-hover:text-brand-accent">
                      Table {table.displayNumber.toString().padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-brand-secondary">
                      {table.capacity} seats
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-secondary truncate">
                    {table.section}
                  </p>
                </Link>
              ))}
            </div>

            <div className="border-t border-divider pt-3 flex justify-between items-center text-xs text-brand-secondary">
              <span>Scanning physical QR skips this step</span>
              <button
                onClick={() => setShowTableSelectModal(false)}
                className="font-medium text-brand-primary hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <MarketingFooter />
    </div>
  );
}
