"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, QrCode, X, UserCheck } from "lucide-react";
import { MENU_ITEMS, MOCK_TABLES, MenuItemData } from "@/data/mockMenu";
import { getMenuItemsAction } from "@/app/admin/menu/actions";
import { getTablesData } from "@/app/admin/tables/actions";
import { adaptDBMenuItemToData } from "@/lib/menuAdapter";
import { DishCard } from "@/components/menu/DishCard";
import { DishDetailModal } from "@/components/menu/DishDetailModal";
import { useLanguage } from "@/context/LanguageContext";

export function MenuPreview() {
  const [selectedDish, setSelectedDish] = useState<MenuItemData | null>(null);
  const [dishes, setDishes] = useState<MenuItemData[]>(MENU_ITEMS.slice(0, 6));
  const [showTableSelectModal, setShowTableSelectModal] = useState(false);
  const [tablesList, setTablesList] = useState<{ code: string; displayNumber: number; capacity: number; section: string; serverName?: string }[]>(
    Object.values(MOCK_TABLES)
  );
  const { isAmharic } = useLanguage();

  useEffect(() => {
    async function loadLiveData() {
      try {
        const [liveItems, liveTables] = await Promise.all([
          getMenuItemsAction(),
          getTablesData(),
        ]);
        if (liveItems && liveItems.length > 0) {
          const adapted = liveItems.map(adaptDBMenuItemToData);
          setDishes(adapted.slice(0, 6));
        }
        if (liveTables?.tables && liveTables.tables.length > 0) {
          setTablesList(
            liveTables.tables.map((t) => ({
              code: t.unique_code,
              displayNumber: t.table_number,
              capacity: t.capacity,
              section: t.section,
              serverName: t.assigned_staff_name || "Floor Attendant",
            }))
          );
        }
      } catch (e) {
        console.error("Error loading live menu preview or tables:", e);
      }
    }
    loadLiveData();
  }, []);

  const signatureItems = dishes;

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

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowTableSelectModal(true)}
              className="inline-flex items-center gap-2 rounded-button bg-brand-accent/10 border border-brand-accent/30 px-4 py-2 text-xs font-bold font-nyala text-brand-accent hover:bg-brand-accent hover:text-white transition"
            >
              <QrCode className="h-4 w-4" />
              <span>{isAmharic ? "ጠረጴዛ ይምረጡና ይዘዙ" : "Order to Your Table"}</span>
            </button>

            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-semibold font-nyala text-brand-accent hover:text-brand-accent-hover transition group"
            >
              <span>{isAmharic ? "ሁሉንም 20+ ምግቦች ይመልከቱ" : "Explore All 20+ Dishes"}</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
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
        <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
          <Link
            href="/menu"
            className="min-h-[48px] inline-flex items-center justify-center gap-2.5 rounded-button bg-brand-primary px-8 py-3.5 text-sm font-semibold font-nyala text-white shadow-card transition hover:bg-black active:scale-95"
          >
            <span>{isAmharic ? "ሙሉውን ዲጂታል ሜኑ ይመልከቱ" : "View Full Digital Menu"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => setShowTableSelectModal(true)}
            className="min-h-[48px] inline-flex items-center justify-center gap-2.5 rounded-button bg-brand-accent px-8 py-3.5 text-sm font-semibold font-nyala text-white shadow-card transition hover:bg-brand-accent-hover active:scale-95"
          >
            <QrCode className="h-4 w-4" />
            <span>{isAmharic ? "ጠረጴዛ መርጠው ያዝዙ" : "Select Table to Order"}</span>
          </button>
        </div>
      </div>

      {/* Dish Quick Detail Modal */}
      <DishDetailModal
        item={selectedDish}
        isOpen={!!selectedDish}
        onClose={() => setSelectedDish(null)}
        isOrderMode={false}
      />

      {/* Live Table Selector Modal for Guests & Evaluation */}
      {showTableSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-card bg-white p-6 shadow-drawer border border-divider space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-button bg-brand-accent text-white shadow-xs">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-header text-base font-bold text-brand-primary">
                    {isAmharic ? "ጠረጴዛዎን ይምረጡ" : "Select Your Table"}
                  </h3>
                  <p className="text-xs text-brand-secondary">
                    {isAmharic ? "የቀጥታ ስልክ ትዕዛዝ መስመር ያስጀምሩ" : "Direct mobile order to kitchen & assigned waiter"}
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

            <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {tablesList.map((table) => (
                <Link
                  key={table.code}
                  href={`/order/${table.code}`}
                  className="p-3 rounded-button border border-divider hover:border-brand-accent hover:bg-background-active text-left transition space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-header font-bold text-sm text-brand-primary group-hover:text-brand-accent">
                      Table {table.displayNumber.toString().padStart(2, "0")}
                    </span>
                    <span className="text-[10px] text-brand-secondary bg-background-subtle px-1.5 py-0.5 rounded">
                      {table.capacity} seats
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-secondary truncate">
                    {table.section}
                  </p>
                  <div className="text-[10px] text-brand-accent font-medium flex items-center gap-1 truncate">
                    <UserCheck className="h-3 w-3 text-status-available shrink-0" />
                    <span className="truncate">{table.serverName || "Floor Attendant"}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="border-t border-divider pt-3 flex justify-between items-center text-xs text-brand-secondary">
              <span>QR code scan at table opens this instantly</span>
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
    </section>
  );
}
