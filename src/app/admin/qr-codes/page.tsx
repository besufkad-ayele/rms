"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Printer, ExternalLink, RefreshCw, UtensilsCrossed, Sparkles } from "lucide-react";
import Link from "next/link";
import { getTablesData, getDiningSectionsAction, DiningSection } from "../tables/actions";
import { TableFloorState } from "@/data/mockDashboard";

export default function QRCodesPage() {
  const [tables, setTables] = useState<TableFloorState[]>([]);
  const [sections, setSections] = useState<DiningSection[]>([]);
  const [activeSection, setActiveSection] = useState<string>("all");

  const loadData = async () => {
    const [tblData, secData] = await Promise.all([
      getTablesData(),
      getDiningSectionsAction(),
    ]);
    setTables(tblData.tables);
    setSections(secData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTables = tables.filter(
    (t) => activeSection === "all" || t.section === activeSection
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Printable Header Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-divider pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-accent">
              <QrCode className="h-3.5 w-3.5" />
              Module 03: Physical QR Cards
            </span>
          </div>
          <h1 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
            Printable QR Tent Cards Generator ({tables.length} Tables)
          </h1>
          <p className="font-sans text-xs text-brand-secondary mt-0.5">
            Generate and print high-resolution QR tent cards for physical table placement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-button bg-brand-accent px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-accentHover transition cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print All QR Cards</span>
          </button>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <button
          onClick={() => setActiveSection("all")}
          className={`px-3 py-1.5 rounded-button text-xs font-bold transition cursor-pointer ${
            activeSection === "all"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
          }`}
        >
          All Sections ({tables.length})
        </button>
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.name)}
            className={`px-3 py-1.5 rounded-button text-xs font-bold transition cursor-pointer ${
              activeSection === sec.name
                ? "bg-brand-primary text-white shadow-xs"
                : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
            }`}
          >
            {sec.name}
          </button>
        ))}
      </div>

      {/* Grid of Printable Tent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-2 print:gap-8">
        {filteredTables.map((table) => (
          <div
            key={table.id}
            className="rounded-card border-2 border-dashed border-brand-accent/50 p-6 bg-white shadow-card space-y-4 text-center print:break-inside-avoid print:shadow-none"
          >
            <div className="space-y-1 border-b border-divider pb-3">
              <p className="font-display font-bold text-xs uppercase tracking-widest text-brand-accent">
                Keren Addis Restaurant &amp; Lounge
              </p>
              <h2 className="font-header text-3xl font-bold text-brand-heading">
                Table {table.unique_code}
              </h2>
              <p className="text-xs font-semibold text-brand-secondary">{table.section}</p>
            </div>

            {/* QR Mock graphic */}
            <div className="h-44 w-44 mx-auto rounded-xl bg-white p-3 shadow-md border border-divider flex flex-col items-center justify-center space-y-2">
              <QrCode className="h-32 w-32 text-brand-primary" />
              <span className="font-mono text-[10px] font-bold text-brand-secondary tracking-widest">
                {table.unique_code}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-brand-primary">
                Scan to View Digital Menu &amp; Order
              </p>
              <p className="text-[10px] text-brand-secondary">
                Instant table service • No app download required
              </p>
            </div>

            <div className="pt-2 border-t border-divider print:hidden">
              <Link
                href={`/order/${table.unique_code}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline"
              >
                <span>Test Live Link</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
