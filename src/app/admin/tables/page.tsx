"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  QrCode,
  Users,
  Plus,
  Search,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Clock,
  Edit2,
  X,
  Printer,
  Sparkles,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getTablesData,
  updateTableDetailsAction,
  createNewTableAction,
} from "./actions";
import { TableFloorState } from "@/data/mockDashboard";

export default function FloorTablesPage() {
  const [isPending, startTransition] = useTransition();

  const [tables, setTables] = useState<TableFloorState[]>([]);
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [selectedQRTable, setSelectedQRTable] = useState<TableFloorState | null>(null);
  const [editingTable, setEditingTable] = useState<TableFloorState | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Edit Form State
  const [editCapacity, setEditCapacity] = useState<number>(4);
  const [editSection, setEditSection] = useState<TableFloorState["section"]>("Main Dining Hall");
  const [editAttendant, setEditAttendant] = useState<string>("Michael Tadesse");
  const [editStatus, setEditStatus] = useState<"free" | "occupied" | "reserved">("free");

  // New Table Form State
  const [newTableNum, setNewTableNum] = useState<number>(26);
  const [newCapacity, setNewCapacity] = useState<number>(4);
  const [newSection, setNewSection] = useState<TableFloorState["section"]>("Main Dining Hall");
  const [newAttendant, setNewAttendant] = useState<string>("Michael Tadesse");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    const data = await getTablesData();
    setTables(data.tables);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTables = tables.filter((t) => {
    const matchSection = sectionFilter === "all" || t.section === sectionFilter;
    const matchSearch =
      searchQuery === "" ||
      t.unique_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigned_staff_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.section.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSection && matchSearch;
  });

  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const freeCount = tables.filter((t) => t.status === "free").length;
  const reservedCount = tables.filter((t) => t.status === "reserved").length;

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;

    startTransition(async () => {
      const res = await updateTableDetailsAction(editingTable.id, {
        capacity: editCapacity,
        section: editSection,
        assignedStaffName: editAttendant,
        status: editStatus,
      });

      if (res.success) {
        setTables(res.tables);
        setEditingTable(null);
        showToast(`Table ${editingTable.unique_code} updated!`);
      }
    });
  };

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createNewTableAction({
        tableNumber: newTableNum,
        capacity: newCapacity,
        section: newSection,
        assignedStaffName: newAttendant,
      });

      if (res.success) {
        setShowAddModal(false);
        showToast(`Table T-${newTableNum.toString().padStart(2, "0")} registered!`);
        loadData();
      }
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-card bg-brand-primary px-4 py-3 text-white shadow-elevated transition-all animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-status-free shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-divider pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-accent">
              <UtensilsCrossed className="h-3 w-3" />
              Module 03: Floor &amp; QR
            </span>
            <span className="text-[12px] text-brand-secondary">
              • Friction-free QR Ordering &amp; Attendant Assignments
            </span>
          </div>
          <h1 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
            Floor Map &amp; Table Registry (25 Tables)
          </h1>
          <p className="font-sans text-xs text-brand-secondary mt-0.5">
            Manage table capacities, floor sections, assigned lead waiters, and generate physical QR ordering cards.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setNewTableNum(tables.length + 1);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 rounded-button bg-brand-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-accentHover transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Physical Table</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh Floor"
            className="flex items-center gap-1.5 rounded-button bg-bg-card px-3.5 py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-active transition"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-brand-secondary", isPending && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Floor Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Total Tables
            </p>
            <p className="font-header text-2xl font-bold text-brand-heading mt-1">
              {tables.length} Tables
            </p>
          </div>
          <div className="rounded-xl bg-bg-card p-2.5 text-brand-primary">
            <UtensilsCrossed className="h-5 w-5 text-brand-accent" />
          </div>
        </div>

        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Occupied Tables
            </p>
            <p className="font-header text-2xl font-bold text-status-occupied mt-1">
              {occupiedCount} Occupied
            </p>
          </div>
          <div className="rounded-xl bg-status-occupied-bg p-2.5 text-status-occupied">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Free Tables
            </p>
            <p className="font-header text-2xl font-bold text-status-free mt-1">
              {freeCount} Free
            </p>
          </div>
          <div className="rounded-xl bg-status-free-bg p-2.5 text-status-free">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Reserved Tables
            </p>
            <p className="font-header text-2xl font-bold text-status-reserved mt-1">
              {reservedCount} Reserved
            </p>
          </div>
          <div className="rounded-xl bg-status-reserved-bg p-2.5 text-status-reserved">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Table Grid Container */}
      <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-5">
        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3 border-b border-divider">
          {/* Section Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Sections" },
              { id: "Main Dining Hall", label: "Main Hall" },
              { id: "Terrace Garden", label: "Terrace" },
              { id: "Lounge & Bar", label: "Lounge & Bar" },
              { id: "VIP Alcove", label: "VIP Alcove" },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSectionFilter(sec.id)}
                className={cn(
                  "rounded-pill px-3 py-1 text-xs font-semibold transition",
                  sectionFilter === sec.id
                    ? "bg-brand-primary text-white"
                    : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
                )}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-secondary" />
            <input
              type="text"
              placeholder="Search table #, attendant, section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary placeholder:text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        </div>

        {/* 25 Tables Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const isOccupied = table.status === "occupied";
            const isFree = table.status === "free";
            const isReserved = table.status === "reserved";

            return (
              <div
                key={table.id}
                className={cn(
                  "rounded-card p-4 border transition-all space-y-3 relative group",
                  isOccupied && "bg-status-occupied-bg/30 border-status-occupied/40",
                  isFree && "bg-white border-divider hover:border-brand-accent",
                  isReserved && "bg-status-reserved-bg/30 border-status-reserved/40"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-header text-base font-bold text-brand-heading">
                      {table.unique_code}
                    </h3>
                    <p className="text-[10px] text-brand-secondary">{table.section}</p>
                  </div>

                  <span
                    className={cn(
                      "rounded-pill px-2 py-0.5 text-[10px] font-bold uppercase",
                      isOccupied && "bg-status-occupied text-white",
                      isFree && "bg-status-free-bg text-status-free border border-status-free/20",
                      isReserved && "bg-status-reserved text-white"
                    )}
                  >
                    {table.status}
                  </span>
                </div>

                {/* Capacity & Attendant */}
                <div className="space-y-1 text-xs pt-1 border-t border-divider/60">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-brand-secondary">Capacity:</span>
                    <span className="font-semibold text-brand-primary">{table.capacity} Seats</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-brand-secondary">Attendant:</span>
                    <span className="font-bold text-brand-primary truncate max-w-[90px]">
                      {table.assigned_staff_name?.split(" ")[0]}
                    </span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-2 border-t border-divider flex items-center justify-between gap-1">
                  <button
                    onClick={() => setSelectedQRTable(table)}
                    className="flex items-center gap-1 rounded-button bg-bg-card px-2 py-1 text-[11px] font-bold text-brand-primary border border-divider hover:bg-bg-active transition"
                  >
                    <QrCode className="h-3 w-3 text-brand-accent" />
                    <span>QR</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingTable(table);
                      setEditCapacity(table.capacity);
                      setEditSection(table.section);
                      setEditAttendant(table.assigned_staff_name || "Michael Tadesse");
                      setEditStatus(table.status);
                    }}
                    className="rounded-button p-1 text-brand-secondary hover:text-brand-primary hover:bg-bg-subtle"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <Link
                    href={`/order/${table.unique_code}`}
                    target="_blank"
                    className="rounded-button p-1 text-brand-secondary hover:text-brand-accent hover:bg-bg-subtle"
                    title="Open Live QR Ordering URL"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: QR Code Card Preview */}
      {selectedQRTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-elevated border border-divider space-y-5 text-center">
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedQRTable(null)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Tent Card Mockup */}
            <div className="rounded-card border-2 border-dashed border-brand-accent/40 p-6 bg-bg-subtle space-y-4">
              <div className="space-y-1">
                <p className="font-display font-bold text-xs uppercase tracking-widest text-brand-secondary">
                  Admas Lounge &amp; Dining
                </p>
                <h3 className="font-header text-2xl font-bold text-brand-heading">
                  Table {selectedQRTable.unique_code}
                </h3>
                <p className="text-[11px] text-brand-secondary">
                  {selectedQRTable.section}
                </p>
              </div>

              {/* QR Mock graphic */}
              <div className="h-40 w-40 mx-auto rounded-xl bg-white p-3 shadow-md border border-divider flex flex-col items-center justify-center space-y-2">
                <QrCode className="h-28 w-28 text-brand-primary" />
                <span className="font-mono text-[9px] font-bold text-brand-secondary tracking-widest">
                  {selectedQRTable.unique_code}
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
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Link
                href={`/order/${selectedQRTable.unique_code}`}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-button bg-brand-accent py-2 text-xs font-bold text-white hover:bg-brand-accentHover transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Test Ordering Flow</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Table Details */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-elevated border border-divider space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="font-header text-lg font-bold text-brand-heading">
                Edit Table {editingTable.unique_code}
              </h3>
              <button
                onClick={() => setEditingTable(null)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-brand-primary block mb-1">
                    Seating Capacity:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(parseInt(e.target.value, 10) || 4)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                  />
                </div>
                <div>
                  <label className="font-semibold text-brand-primary block mb-1">
                    Floor Section:
                  </label>
                  <select
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value as any)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-semibold"
                  >
                    <option value="Main Dining Hall">Main Dining Hall</option>
                    <option value="Terrace Garden">Terrace Garden</option>
                    <option value="Lounge & Bar">Lounge &amp; Bar</option>
                    <option value="VIP Alcove">VIP Alcove</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Default Assigned Attendant:
                </label>
                <select
                  value={editAttendant}
                  onChange={(e) => setEditAttendant(e.target.value)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-semibold"
                >
                  <option value="Michael Tadesse">Michael Tadesse (Lead Waiter)</option>
                  <option value="Sara Mengistu">Sara Mengistu (Terrace Waiter)</option>
                  <option value="Eden Haile">Eden Haile (Lounge Waiter)</option>
                  <option value="Dawit Bekele">Dawit Bekele (VIP Host)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Current Occupancy State:
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-semibold"
                >
                  <option value="free">Free</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
                  className="flex-1 rounded-button bg-bg-card py-2 text-xs font-semibold text-brand-primary border border-divider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-button bg-brand-accent py-2 text-xs font-bold text-white hover:bg-brand-accentHover transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Physical Table */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-elevated border border-divider space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="font-header text-lg font-bold text-brand-heading">
                Register New Physical Table
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddTableSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-brand-primary block mb-1">
                    Table Number:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTableNum}
                    onChange={(e) => setNewTableNum(parseInt(e.target.value, 10) || 1)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-brand-primary block mb-1">
                    Seating Capacity:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(parseInt(e.target.value, 10) || 4)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Floor Section:
                </label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value as any)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-semibold"
                >
                  <option value="Main Dining Hall">Main Dining Hall</option>
                  <option value="Terrace Garden">Terrace Garden</option>
                  <option value="Lounge & Bar">Lounge &amp; Bar</option>
                  <option value="VIP Alcove">VIP Alcove</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Default Assigned Attendant:
                </label>
                <select
                  value={newAttendant}
                  onChange={(e) => setNewAttendant(e.target.value)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-semibold"
                >
                  <option value="Michael Tadesse">Michael Tadesse (Lead Waiter)</option>
                  <option value="Sara Mengistu">Sara Mengistu (Terrace Waiter)</option>
                  <option value="Eden Haile">Eden Haile (Lounge Waiter)</option>
                  <option value="Dawit Bekele">Dawit Bekele (VIP Host)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-button bg-bg-card py-2 text-xs font-semibold text-brand-primary border border-divider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-button bg-brand-accent py-2 text-xs font-bold text-white hover:bg-brand-accentHover transition"
                >
                  Register Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
