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
  Trash2,
  FolderPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getTablesData,
  updateTableDetailsAction,
  createNewTableAction,
  deleteTableAction,
  getDiningSectionsAction,
  createDiningSectionAction,
  updateDiningSectionAction,
  deleteDiningSectionAction,
  getAvailableWaitersAction,
  DiningSection,
  AvailableStaff,
} from "./actions";
import { TableFloorState } from "@/data/mockDashboard";

export default function FloorTablesPage() {
  const [isPending, startTransition] = useTransition();

  const [tables, setTables] = useState<TableFloorState[]>([]);
  const [diningSections, setDiningSections] = useState<DiningSection[]>([]);
  const [availableWaiters, setAvailableWaiters] = useState<AvailableStaff[]>([]);
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [selectedQRTable, setSelectedQRTable] = useState<TableFloorState | null>(null);
  const [editingTable, setEditingTable] = useState<TableFloorState | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSectionsModal, setShowSectionsModal] = useState<boolean>(false);

  // Section Management State
  const [newSecName, setNewSecName] = useState<string>("");
  const [newSecDesc, setNewSecDesc] = useState<string>("");
  const [editingSection, setEditingSection] = useState<DiningSection | null>(null);
  const [editSecName, setEditSecName] = useState<string>("");
  const [editSecDesc, setEditSecDesc] = useState<string>("");

  // Table Edit Form State
  const [editCapacity, setEditCapacity] = useState<number>(4);
  const [editSection, setEditSection] = useState<string>("Main Dining Hall");
  const [editAttendantId, setEditAttendantId] = useState<string>("");
  const [editStatus, setEditStatus] = useState<"free" | "occupied" | "reserved">("free");

  // New Table Form State
  const [newTableNum, setNewTableNum] = useState<number>(17);
  const [newCapacity, setNewCapacity] = useState<number>(4);
  const [newSection, setNewSection] = useState<string>("Main Dining Hall");
  const [newAttendantId, setNewAttendantId] = useState<string>("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    const [tablesRes, sectionsRes, staffRes] = await Promise.all([
      getTablesData(),
      getDiningSectionsAction(),
      getAvailableWaitersAction(),
    ]);
    setTables(tablesRes.tables);
    setDiningSections(sectionsRes);
    setAvailableWaiters(staffRes);
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

  // Table Handlers
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;

    startTransition(async () => {
      const res = await updateTableDetailsAction(editingTable.id, {
        capacity: editCapacity,
        section: editSection,
        assignedStaffId: editAttendantId || null,
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
        assignedStaffId: newAttendantId || null,
      });

      if (res.success) {
        setTables(res.tables);
        setShowAddModal(false);
        setNewTableNum((prev) => prev + 1);
        showToast("New dining table registered with assigned attendant!");
      }
    });
  };

  const handleDeleteTable = (table: TableFloorState) => {
    if (!confirm(`Are you sure you want to delete Table ${table.unique_code}?`)) return;
    startTransition(async () => {
      const res = await deleteTableAction(table.id);
      if (res.success) {
        setTables(res.tables);
        showToast(`Table ${table.unique_code} deleted successfully.`);
      }
    });
  };

  // Section CRUD Handlers
  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecName.trim()) return;

    startTransition(async () => {
      const res = await createDiningSectionAction(newSecName, newSecDesc);
      if (res.success) {
        setNewSecName("");
        setNewSecDesc("");
        showToast(`Section "${newSecName}" created successfully!`);
        const updatedSecs = await getDiningSectionsAction();
        setDiningSections(updatedSecs);
      } else {
        showToast(res.message || "Failed to create section.");
      }
    });
  };

  const handleUpdateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editSecName.trim()) return;

    startTransition(async () => {
      const res = await updateDiningSectionAction(editingSection.id, editSecName, editSecDesc);
      if (res.success) {
        setEditingSection(null);
        showToast(`Section renamed to "${editSecName}"!`);
        const updatedSecs = await getDiningSectionsAction();
        setDiningSections(updatedSecs);
      } else {
        showToast(res.message || "Failed to update section.");
      }
    });
  };

  const handleDeleteSection = (sec: DiningSection) => {
    if (!confirm(`Are you sure you want to delete section "${sec.name}"?`)) return;

    startTransition(async () => {
      const res = await deleteDiningSectionAction(sec.id);
      if (res.success) {
        showToast(`Section "${sec.name}" deleted.`);
        const updatedSecs = await getDiningSectionsAction();
        setDiningSections(updatedSecs);
      } else {
        showToast(res.message || "Failed to delete section.");
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
              • Dynamic Database Sections &amp; Attendant Assignments
            </span>
          </div>
          <h1 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
            Floor Map &amp; Table Registry ({tables.length} Tables)
          </h1>
          <p className="font-sans text-xs text-brand-secondary mt-0.5">
            Manage floor sections in database, table capacities, assigned lead waiters, and physical QR codes.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSectionsModal(true)}
            className="flex items-center gap-2 rounded-button bg-bg-card px-3.5 py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-active transition shadow-xs"
          >
            <Layers className="h-4 w-4 text-brand-accent" />
            <span>Manage Sections ({diningSections.length})</span>
          </button>

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
            className="flex items-center gap-1.5 rounded-button bg-bg-card px-3 py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-active transition"
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
          {/* Dynamic Section Pills from Database */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSectionFilter("all")}
              className={cn(
                "rounded-pill px-3 py-1 text-xs font-semibold transition",
                sectionFilter === "all"
                  ? "bg-brand-primary text-white"
                  : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
              )}
            >
              All Sections
            </button>
            {diningSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSectionFilter(sec.name)}
                className={cn(
                  "rounded-pill px-3 py-1 text-xs font-semibold transition",
                  sectionFilter === sec.name
                    ? "bg-brand-primary text-white"
                    : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
                )}
              >
                {sec.name}
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

        {/* Tables Card Grid */}
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
                    <p className="text-[10px] font-semibold text-brand-accent">{table.section}</p>
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
                    <span className="font-bold text-brand-primary truncate max-w-[120px]" title={table.assigned_staff_name || "Unassigned"}>
                      {table.assigned_staff_name || "Unassigned"}
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
                      setEditAttendantId(table.assigned_staff_id || "");
                      setEditStatus(table.status);
                    }}
                    className="rounded-button p-1 text-brand-secondary hover:text-brand-primary hover:bg-bg-subtle"
                    title="Edit Table Details"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteTable(table)}
                    className="rounded-button p-1 text-brand-secondary hover:text-status-danger hover:bg-status-danger-bg"
                    title="Delete Table"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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

      {/* MODAL 0: Manage Dining Sections (CRUD) */}
      {showSectionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-elevated border border-divider space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <div>
                <h3 className="font-header text-lg font-bold text-brand-heading flex items-center gap-2">
                  <Layers className="h-5 w-5 text-brand-accent" />
                  Manage Dining Sections
                </h3>
                <p className="text-xs text-brand-secondary">
                  Create, rename, or remove dynamic floor zones stored in Supabase.
                </p>
              </div>
              <button
                onClick={() => setShowSectionsModal(false)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Add New Section Form */}
            <form onSubmit={handleCreateSection} className="rounded-card border border-divider bg-bg-subtle p-3.5 space-y-2 text-xs">
              <p className="font-bold text-brand-primary flex items-center gap-1.5">
                <FolderPlus className="h-4 w-4 text-brand-accent" />
                Add New Floor Section
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Section Name (e.g. Terrace)"
                  value={newSecName}
                  onChange={(e) => setNewSecName(e.target.value)}
                  className="rounded-button border border-divider bg-white p-2 text-xs text-brand-primary"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newSecDesc}
                  onChange={(e) => setNewSecDesc(e.target.value)}
                  className="rounded-button border border-divider bg-white p-2 text-xs text-brand-primary"
                />
              </div>
              <button
                type="submit"
                disabled={isPending || !newSecName.trim()}
                className="w-full py-1.5 rounded-button bg-brand-accent text-white font-bold text-xs hover:bg-brand-accentHover transition"
              >
                Save New Section
              </button>
            </form>

            {/* Existing Sections List */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-brand-primary">Existing Sections ({diningSections.length})</p>
              <div className="divide-y divide-divider border border-divider rounded-card overflow-hidden">
                {diningSections.map((sec) => (
                  <div key={sec.id} className="p-3 flex items-center justify-between hover:bg-bg-subtle/50 transition">
                    {editingSection?.id === sec.id ? (
                      <form onSubmit={handleUpdateSection} className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editSecName}
                          onChange={(e) => setEditSecName(e.target.value)}
                          className="px-2 py-1 border border-divider rounded-button text-xs font-bold"
                          required
                        />
                        <button type="submit" className="px-2 py-1 bg-brand-accent text-white rounded-button font-bold text-[11px]">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSection(null)}
                          className="px-2 py-1 border border-divider rounded-button text-[11px]"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <div>
                          <p className="font-bold text-brand-primary text-xs">{sec.name}</p>
                          {sec.description && (
                            <p className="text-[11px] text-brand-secondary">{sec.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingSection(sec);
                              setEditSecName(sec.name);
                              setEditSecDesc(sec.description || "");
                            }}
                            className="p-1 rounded-button text-brand-secondary hover:text-brand-primary hover:bg-bg-subtle"
                            title="Rename Section"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(sec)}
                            className="p-1 rounded-button text-brand-secondary hover:text-status-danger hover:bg-status-danger-bg"
                            title="Delete Section"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
                  Keren Addis Restaurant &amp; Lounge
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
                    onChange={(e) => setEditSection(e.target.value)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-semibold"
                  >
                    {diningSections.map((sec) => (
                      <option key={sec.id} value={sec.name}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Default Assigned Attendant:
                </label>
                <select
                  value={editAttendantId}
                  onChange={(e) => setEditAttendantId(e.target.value)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-semibold"
                >
                  <option value="">-- Unassigned (Open Station) --</option>
                  {availableWaiters.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.fullName} ({staff.role.toUpperCase()})
                    </option>
                  ))}
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
                  onChange={(e) => setNewSection(e.target.value)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-semibold"
                >
                  {diningSections.map((sec) => (
                    <option key={sec.id} value={sec.name}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Default Assigned Attendant:
                </label>
                <select
                  value={newAttendantId}
                  onChange={(e) => setNewAttendantId(e.target.value)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-semibold"
                >
                  <option value="">-- Unassigned (Open Station) --</option>
                  {availableWaiters.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.fullName} ({staff.role.toUpperCase()})
                    </option>
                  ))}
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
