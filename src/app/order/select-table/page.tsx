"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UtensilsCrossed, ArrowRight, CheckCircle2, Users, Clock, Sparkles } from "lucide-react";
import { getTablesData, getDiningSectionsAction, DiningSection } from "@/app/admin/tables/actions";
import { TableFloorState } from "@/data/mockDashboard";

export default function SelectTablePage() {
  const [tables, setTables] = useState<TableFloorState[]>([]);
  const [sections, setSections] = useState<DiningSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("all");

  useEffect(() => {
    async function load() {
      const [tblData, secData] = await Promise.all([
        getTablesData(),
        getDiningSectionsAction(),
      ]);
      setTables(tblData.tables);
      setSections(secData);
    }
    load();
  }, []);

  const filteredTables = tables.filter(
    (t) => selectedSection === "all" || t.section === selectedSection
  );

  return (
    <div className="min-h-screen bg-bg-main p-6 sm:p-12 space-y-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-pill bg-brand-accent/10 px-3.5 py-1 text-xs font-semibold text-brand-accent">
          <UtensilsCrossed className="h-3.5 w-3.5" />
          Keren Addis Restaurant &amp; Lounge
        </div>
        <h1 className="font-header text-3xl sm:text-4xl font-bold text-brand-heading">
          Select Your Dining Table
        </h1>
        <p className="text-xs sm:text-sm text-brand-secondary">
          Choose your active table from the floor map below to view the digital menu and place instant orders.
        </p>
      </div>

      {/* Section Filter Tabs */}
      <div className="max-w-4xl mx-auto flex items-center justify-center flex-wrap gap-2">
        <button
          onClick={() => setSelectedSection("all")}
          className={`px-4 py-2 rounded-pill text-xs font-bold transition cursor-pointer ${
            selectedSection === "all"
              ? "bg-brand-primary text-white shadow-sm"
              : "bg-white text-brand-secondary border border-divider hover:bg-bg-subtle"
          }`}
        >
          All Sections
        </button>
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setSelectedSection(sec.name)}
            className={`px-4 py-2 rounded-pill text-xs font-bold transition cursor-pointer ${
              selectedSection === sec.name
                ? "bg-brand-primary text-white shadow-sm"
                : "bg-white text-brand-secondary border border-divider hover:bg-bg-subtle"
            }`}
          >
            {sec.name}
          </button>
        ))}
      </div>

      {/* Table Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredTables.map((t) => (
          <Link
            key={t.id}
            href={`/order/${t.unique_code}`}
            className="rounded-card bg-white p-5 border border-divider shadow-card hover:border-brand-accent hover:shadow-elevated transition text-center space-y-3 group block"
          >
            <div className="h-10 w-10 mx-auto rounded-full bg-brand-accent/10 text-brand-accent font-bold text-xs flex items-center justify-center group-hover:bg-brand-accent group-hover:text-white transition">
              {t.unique_code}
            </div>

            <div>
              <h3 className="font-header font-bold text-base text-brand-heading">
                Table {t.table_number}
              </h3>
              <p className="text-[11px] text-brand-secondary font-semibold">{t.section}</p>
            </div>

            <div className="text-[11px] text-brand-secondary flex items-center justify-center gap-1">
              <Users className="h-3 w-3" />
              <span>{t.capacity} Capacity</span>
            </div>

            <div className="pt-2 border-t border-divider flex items-center justify-center gap-1 text-xs font-bold text-brand-accent group-hover:translate-x-0.5 transition">
              <span>Start Order</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
