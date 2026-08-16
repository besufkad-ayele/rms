"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  DollarSign,
  TrendingUp,
  UtensilsCrossed,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  ArrowUpRight,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Search,
  Filter,
  Plus,
  X,
  CreditCard,
  Building2,
  ShieldCheck,
  Star,
  ExternalLink,
  ChevronRight,
  Flame,
  Coffee,
  Beer,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDashboardData,
  updateTableStatusAction,
  updateTicketStatusAction,
  confirmSettlementAction,
  quickRestockIngredientAction,
} from "./actions";
import {
  DashboardKPIs,
  TableFloorState,
  LiveKitchenTicket,
  LowStockAlertItem,
  PendingSettlementItem,
  RecentReviewItem,
} from "@/data/mockDashboard";

export default function AdminDashboardPage() {
  const [isPending, startTransition] = useTransition();

  // State
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [tables, setTables] = useState<TableFloorState[]>([]);
  const [tickets, setTickets] = useState<LiveKitchenTicket[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlertItem[]>([]);
  const [settlements, setSettlements] = useState<PendingSettlementItem[]>([]);
  const [reviews, setReviews] = useState<RecentReviewItem[]>([]);

  // Filter States
  const [floorSection, setFloorSection] = useState<string>("all");
  const [floorStatusFilter, setFloorStatusFilter] = useState<string>("all");
  const [kitchenTab, setKitchenTab] = useState<string>("all");

  // Selected Table Modal State
  const [selectedTable, setSelectedTable] = useState<TableFloorState | null>(null);
  const [walkinGuestCount, setWalkinGuestCount] = useState<number>(2);
  const [walkinStaffName, setWalkinStaffName] = useState<string>("Michael Tadesse");

  // Restock Modal State
  const [restockItem, setRestockItem] = useState<LowStockAlertItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(5);

  // Walk-in Quick Seating Modal
  const [showWalkinModal, setShowWalkinModal] = useState<boolean>(false);
  const [selectedFreeTableId, setSelectedFreeTableId] = useState<string>("");

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Load
  const loadData = async () => {
    const data = await getDashboardData();
    setKpis(data.kpis);
    setTables(data.tables);
    setTickets(data.tickets);
    setAlerts(data.alerts);
    setSettlements(data.settlements);
    setReviews(data.reviews);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // 15s auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleTableStatusChange = (
    tableId: string,
    newStatus: "free" | "occupied" | "reserved",
    guests?: number,
    staff?: string
  ) => {
    startTransition(async () => {
      const res = await updateTableStatusAction(tableId, newStatus, guests, staff);
      if (res.success) {
        setTables(res.tables);
        setSelectedTable(null);
        setShowWalkinModal(false);
        showToast(
          `Table status updated to ${newStatus.toUpperCase()}`,
          "success"
        );
        loadData();
      }
    });
  };

  const handleTicketStatusChange = (
    ticketId: string,
    newStatus: "placed" | "preparing" | "ready" | "served" | "disputed"
  ) => {
    startTransition(async () => {
      const res = await updateTicketStatusAction(ticketId, newStatus);
      if (res.success) {
        setTickets(res.tickets);
        showToast(`Ticket status advanced to ${newStatus.toUpperCase()}`);
        loadData();
      }
    });
  };

  const handleConfirmSettlement = (settlementId: string, tableCode: string, amount: number) => {
    startTransition(async () => {
      const res = await confirmSettlementAction(settlementId);
      if (res.success) {
        setSettlements(res.settlements);
        showToast(`Payment of ETB ${amount.toLocaleString()} confirmed for Table ${tableCode}. Table freed!`);
        loadData();
      }
    });
  };

  const handleRestock = () => {
    if (!restockItem) return;
    startTransition(async () => {
      const res = await quickRestockIngredientAction(restockItem.id, restockAmount);
      if (res.success) {
        setAlerts(res.alerts);
        setRestockItem(null);
        showToast(`Restocked ${restockAmount} ${restockItem.unit} of ${restockItem.name}`);
        loadData();
      }
    });
  };

  // Filter Tables
  const filteredTables = tables.filter((t) => {
    const matchSection = floorSection === "all" || t.section === floorSection;
    const matchStatus = floorStatusFilter === "all" || t.status === floorStatusFilter;
    return matchSection && matchStatus;
  });

  // Filter Tickets
  const filteredTickets = tickets.filter((t) => {
    if (kitchenTab === "all") return true;
    return t.status === kitchenTab;
  });

  const freeTablesList = tables.filter((t) => t.status === "free");

  if (!kpis) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-accent" />
          <p className="font-sans text-xs font-semibold text-brand-secondary">
            Connecting to Live Floor & Financial Engine...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-card bg-brand-primary px-4 py-3 text-white shadow-elevated transition-all animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-status-free shrink-0" />
          <p className="text-xs font-medium">{toastMessage.text}</p>
        </div>
      )}

      {/* Top Banner / Breadcrumb & Action Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-divider pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse" />
              Live Operations Hub
            </span>
            <span className="text-[12px] text-brand-secondary">
              • Floor Plan (25 Tables) & P&L Engine
            </span>
          </div>
          <h1 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
            Executive Operations Dashboard
          </h1>
          <p className="font-sans text-xs text-brand-secondary mt-0.5">
            Real-time floor occupancy, kitchen ticket stream, recipe-deducted COGS, and pending payments.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              if (freeTablesList.length > 0) {
                setSelectedFreeTableId(freeTablesList[0].id);
                setShowWalkinModal(true);
              } else {
                showToast("No free tables available right now!", "info");
              }
            }}
            className="flex items-center gap-2 rounded-button bg-brand-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-accentHover transition"
          >
            <Plus className="h-4 w-4" />
            <span>Seat Walk-in Party</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh Data"
            className="flex items-center gap-1.5 rounded-button bg-bg-card px-3.5 py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-active transition"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-brand-secondary", isPending && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 1. Executive Top KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Today's Revenue */}
        <div className="rounded-card bg-white p-5 border border-divider shadow-card relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-secondary">
                Today&apos;s Gross Sales
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-header text-2xl font-bold text-brand-heading">
                  ETB {kpis.todayRevenue.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-status-free-bg p-2.5 text-status-free border border-status-free/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-divider flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 text-status-free font-bold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+{kpis.revenueGrowthPercent}% vs yesterday</span>
            </div>
            <span className="text-brand-secondary font-medium">
              Dine-In: 74%
            </span>
          </div>
        </div>

        {/* KPI 2: Realized COGS & Margin */}
        <div className="rounded-card bg-white p-5 border border-divider shadow-card relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-secondary">
                Recipe COGS & Profit
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-header text-2xl font-bold text-brand-heading">
                  ETB {kpis.grossProfit.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-brand-accent/10 p-2.5 text-brand-accent border border-brand-accent/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-divider flex items-center justify-between text-[11px]">
            <span className="text-brand-secondary font-medium">
              COGS: <strong className="text-brand-primary font-bold">ETB {kpis.realizedCogs.toLocaleString()}</strong>
            </span>
            <span className="rounded-pill bg-status-free-bg px-2 py-0.5 font-bold text-status-free">
              {kpis.foodCostPercentage}% Food Cost
            </span>
          </div>
        </div>

        {/* KPI 3: Live Floor Capacity */}
        <div className="rounded-card bg-white p-5 border border-divider shadow-card relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-secondary">
                Live Floor Occupancy
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-header text-2xl font-bold text-brand-heading">
                  {kpis.occupiedTables} / {kpis.totalTables} Tables
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-status-occupied-bg p-2.5 text-status-occupied border border-status-occupied/20">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-divider flex items-center justify-between text-[11px]">
            <span className="font-bold text-brand-primary">
              {Math.round((kpis.occupiedTables / kpis.totalTables) * 100)}% Occupancy Rate
            </span>
            <span className="text-status-free font-bold">
              {kpis.freeTables} Free Tables
            </span>
          </div>
        </div>

        {/* KPI 4: Kitchen Flow & Staff Rating */}
        <div className="rounded-card bg-white p-5 border border-divider shadow-card relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-secondary">
                Kitchen Pace & Rating
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-header text-2xl font-bold text-brand-heading">
                  {kpis.avgPreparationMinutes} min avg
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-bg-card p-2.5 text-brand-primary border border-divider">
              <ChefHat className="h-5 w-5 text-brand-accent" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-divider flex items-center justify-between text-[11px]">
            <span className="text-brand-secondary font-medium">
              Active Tickets: <strong className="text-brand-primary font-bold">{kpis.activeOrderCount}</strong>
            </span>
            <span className="flex items-center gap-1 font-bold text-status-occupied">
              <Star className="h-3 w-3 fill-status-occupied" />
              {kpis.avgStaffRating} Avg Rating
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Floor Plan Section (25 Tables Grid) */}
      <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-header text-lg font-bold text-brand-heading">
                Live Table Floor Matrix (25 Tables)
              </h2>
              <span className="rounded-pill bg-bg-card px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-divider">
                {tables.length} Total Registered
              </span>
            </div>
            <p className="font-sans text-xs text-brand-secondary mt-0.5">
              Click any table card to inspect active orders, clear billing, seat walk-in guests, or reassign attendants.
            </p>
          </div>

          {/* Section Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Sections (25)" },
              { id: "Main Dining Hall", label: "Main Hall (12)" },
              { id: "Terrace Garden", label: "Terrace (6)" },
              { id: "Lounge & Bar", label: "Lounge & Bar (5)" },
              { id: "VIP Alcove", label: "VIP Alcove (2)" },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setFloorSection(sec.id)}
                className={cn(
                  "rounded-pill px-3 py-1 text-xs font-semibold transition",
                  floorSection === sec.id
                    ? "bg-brand-primary text-white"
                    : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
                )}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Legend & Quick Status Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-1 border-b border-divider text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFloorStatusFilter("all")}
              className={cn(
                "font-semibold pb-1.5 border-b-2 transition",
                floorStatusFilter === "all"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-brand-secondary hover:text-brand-primary"
              )}
            >
              All States ({tables.length})
            </button>
            <button
              onClick={() => setFloorStatusFilter("occupied")}
              className={cn(
                "flex items-center gap-1.5 font-semibold pb-1.5 border-b-2 transition",
                floorStatusFilter === "occupied"
                  ? "border-status-occupied text-status-occupied"
                  : "border-transparent text-brand-secondary hover:text-brand-primary"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-status-occupied" />
              Occupied ({kpis.occupiedTables})
            </button>
            <button
              onClick={() => setFloorStatusFilter("free")}
              className={cn(
                "flex items-center gap-1.5 font-semibold pb-1.5 border-b-2 transition",
                floorStatusFilter === "free"
                  ? "border-status-free text-status-free"
                  : "border-transparent text-brand-secondary hover:text-brand-primary"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-status-free" />
              Free ({kpis.freeTables})
            </button>
            <button
              onClick={() => setFloorStatusFilter("reserved")}
              className={cn(
                "flex items-center gap-1.5 font-semibold pb-1.5 border-b-2 transition",
                floorStatusFilter === "reserved"
                  ? "border-status-reserved text-status-reserved"
                  : "border-transparent text-brand-secondary hover:text-brand-primary"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-status-reserved" />
              Reserved ({kpis.reservedTables})
            </button>
          </div>

          <span className="text-[11px] text-brand-secondary hidden sm:inline">
            Auto-syncs via Supabase Realtime
          </span>
        </div>

        {/* 25 Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pt-2">
          {filteredTables.map((table) => {
            const isOccupied = table.status === "occupied";
            const isFree = table.status === "free";
            const isReserved = table.status === "reserved";

            return (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={cn(
                  "group relative cursor-pointer rounded-card p-3.5 border transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md",
                  isOccupied && "bg-status-occupied-bg/40 border-status-occupied/30 hover:border-status-occupied",
                  isFree && "bg-white border-divider hover:border-status-free hover:bg-status-free-bg/10",
                  isReserved && "bg-status-reserved-bg/30 border-status-reserved/30 hover:border-status-reserved"
                )}
              >
                {/* Top Row: Table Code + Status Chip */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-header text-sm font-bold text-brand-heading">
                    {table.unique_code}
                  </span>
                  <span
                    className={cn(
                      "rounded-pill px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      isOccupied && "bg-status-occupied text-white",
                      isFree && "bg-status-free-bg text-status-free border border-status-free/20",
                      isReserved && "bg-status-reserved text-white"
                    )}
                  >
                    {table.status}
                  </span>
                </div>

                {/* Section & Capacity */}
                <div className="space-y-1 text-[11px] text-brand-secondary">
                  <p className="truncate font-medium">{table.section}</p>
                  <p className="text-[10px]">Capacity: {table.capacity} Seats</p>
                </div>

                {/* Occupied State Specific Info */}
                {isOccupied && (
                  <div className="mt-3 pt-2.5 border-t border-divider/60 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-brand-primary">
                      <span>ETB {(table.current_order_total || 0).toLocaleString()}</span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-status-occupied">
                        <Clock className="h-3 w-3" />
                        {table.occupied_since_minutes}m
                      </span>
                    </div>
                    <p className="text-[10px] text-brand-secondary truncate">
                      Attendant: {table.assigned_staff_name?.split(" ")[0]}
                    </p>
                  </div>
                )}

                {/* Free State Specific Info */}
                {isFree && (
                  <div className="mt-3 pt-2.5 border-t border-divider/40 flex items-center justify-between text-[10px] text-brand-secondary">
                    <span>Attendant: {table.assigned_staff_name?.split(" ")[0]}</span>
                    <span className="font-semibold text-status-free group-hover:underline">
                      Seat +
                    </span>
                  </div>
                )}

                {/* Reserved State */}
                {isReserved && (
                  <div className="mt-3 pt-2.5 border-t border-divider/40 text-[10px] text-status-reserved font-semibold">
                    Pre-booked for Evening
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Split Row: Kitchen Ticket Stream (KDS) + Low Stock & Pending Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Kitchen Order Pipeline (7 Cols) */}
        <div className="lg:col-span-7 rounded-card bg-white p-6 border border-divider shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-brand-accent" />
                <h3 className="font-header text-base font-bold text-brand-heading">
                  Real-time Kitchen Display Stream (KDS)
                </h3>
              </div>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                Orders deduct recipe Bill-of-Materials in real-time. Advance tickets as dishes are prepared.
              </p>
            </div>

            {/* Ticket Filter Tabs */}
            <div className="flex items-center gap-1 rounded-button bg-bg-subtle p-1 border border-divider text-xs">
              {[
                { id: "all", label: "All" },
                { id: "placed", label: "Placed" },
                { id: "preparing", label: "Prep" },
                { id: "ready", label: "Ready" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setKitchenTab(tab.id)}
                  className={cn(
                    "rounded-button px-2.5 py-1 text-xs font-semibold transition",
                    kitchenTab === tab.id
                      ? "bg-white text-brand-primary shadow-xs"
                      : "text-brand-secondary hover:text-brand-primary"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Stream List */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredTickets.length === 0 ? (
              <div className="rounded-card border border-dashed border-divider p-8 text-center">
                <UtensilsCrossed className="h-8 w-8 text-brand-secondary/40 mx-auto mb-2" />
                <p className="text-xs font-semibold text-brand-secondary">
                  No active tickets in this stage right now.
                </p>
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isLate = ticket.elapsedMinutes >= 18;
                return (
                  <div
                    key={ticket.id}
                    className={cn(
                      "rounded-card p-4 border transition-all space-y-3",
                      ticket.status === "placed" && "bg-status-occupied-bg/20 border-status-occupied/30",
                      ticket.status === "preparing" && "bg-status-kitchen-bg/30 border-status-kitchen/30",
                      ticket.status === "ready" && "bg-status-free-bg/30 border-status-free/40",
                      ticket.status === "served" && "bg-white border-divider opacity-70"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-header text-sm font-bold text-brand-heading">
                            {ticket.tableCode}
                          </span>
                          <span className="rounded-pill bg-bg-card px-2 py-0.5 text-[10px] font-bold text-brand-primary border border-divider">
                            {ticket.orderNumber}
                          </span>
                          <span className="text-[11px] text-brand-secondary">
                            via {ticket.waiterName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[10px] font-bold",
                            isLate
                              ? "bg-status-danger text-white animate-pulse"
                              : "bg-bg-card text-brand-primary"
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {ticket.elapsedMinutes}m elapsed
                        </span>
                        <span
                          className={cn(
                            "rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase",
                            ticket.status === "placed" && "bg-status-occupied text-white",
                            ticket.status === "preparing" && "bg-status-kitchen text-white",
                            ticket.status === "ready" && "bg-status-free text-white",
                            ticket.status === "served" && "bg-brand-secondary text-white"
                          )}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="rounded-button bg-white/80 p-3 border border-divider/60 space-y-1.5">
                      {ticket.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-pill bg-brand-accent/10 text-brand-accent font-bold text-[11px] flex items-center justify-center">
                              {item.quantity}×
                            </span>
                            <span className="font-semibold text-brand-primary">{item.name}</span>
                          </div>
                          {item.notes && (
                            <span className="text-[11px] text-status-occupied italic">
                              &ldquo;{item.notes}&rdquo;
                            </span>
                          )}
                        </div>
                      ))}

                      {ticket.customerNotes && (
                        <p className="mt-2 pt-1.5 border-t border-divider text-[11px] text-brand-secondary italic">
                          Special Note: {ticket.customerNotes}
                        </p>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-sans text-xs font-bold text-brand-primary">
                        Total: ETB {ticket.totalAmount.toLocaleString()}
                      </span>

                      <div className="flex items-center gap-2">
                        {ticket.status === "placed" && (
                          <button
                            onClick={() => handleTicketStatusChange(ticket.id, "preparing")}
                            className="rounded-button bg-status-kitchen px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition"
                          >
                            Start Cooking
                          </button>
                        )}
                        {ticket.status === "preparing" && (
                          <button
                            onClick={() => handleTicketStatusChange(ticket.id, "ready")}
                            className="rounded-button bg-status-free px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition"
                          >
                            Mark Ready
                          </button>
                        )}
                        {ticket.status === "ready" && (
                          <button
                            onClick={() => handleTicketStatusChange(ticket.id, "served")}
                            className="rounded-button bg-brand-primary px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition"
                          >
                            Confirm Served
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Low Stock Alerts & Pending Settlements (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card A: Low-Stock Threshold Alerts */}
          <div className="rounded-card bg-white p-5 border border-divider shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-status-danger" />
                <h3 className="font-header text-sm font-bold text-brand-heading">
                  Critical Inventory Alerts
                </h3>
              </div>
              <span className="rounded-pill bg-status-danger-bg px-2 py-0.5 text-[10px] font-bold text-status-danger">
                {alerts.length} Low Items
              </span>
            </div>

            <div className="space-y-2.5">
              {alerts.map((item) => (
                <div
                  key={item.id}
                  className="rounded-card p-3 border border-divider bg-bg-subtle/60 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-bold text-brand-primary truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-brand-secondary">
                      <span>Stock: <strong className="text-status-danger">{item.stockQty} {item.unit}</strong></span>
                      <span>• Threshold: {item.threshold} {item.unit}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setRestockItem(item);
                      setRestockAmount(5);
                    }}
                    className="shrink-0 rounded-button bg-white px-2.5 py-1 text-[11px] font-bold text-brand-accent border border-divider hover:bg-bg-active transition"
                  >
                    Restock +
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card B: Pending Cash & Transfer Settlements */}
          <div className="rounded-card bg-white p-5 border border-divider shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-status-occupied" />
                <h3 className="font-header text-sm font-bold text-brand-heading">
                  Pending Bill Clearances
                </h3>
              </div>
              <span className="rounded-pill bg-status-occupied-bg px-2 py-0.5 text-[10px] font-bold text-status-occupied">
                {settlements.length} Waiting
              </span>
            </div>

            <div className="space-y-2.5">
              {settlements.length === 0 ? (
                <p className="text-xs text-brand-secondary italic text-center py-3">
                  All table payments are currently settled.
                </p>
              ) : (
                settlements.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-card p-3 border border-status-occupied/30 bg-status-occupied-bg/20 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-brand-primary">
                          Table {item.tableCode}
                        </span>
                        <span className="text-[11px] text-brand-secondary ml-1.5">
                          ({item.waiterName})
                        </span>
                      </div>
                      <span className="font-header font-bold text-brand-primary">
                        ETB {item.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-brand-secondary capitalize">
                        Method: <strong className="text-brand-primary">{item.method.replace("_", " ")}</strong>
                      </span>
                      <button
                        onClick={() => handleConfirmSettlement(item.id, item.tableCode, item.amount)}
                        className="rounded-button bg-status-free px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:opacity-90 transition"
                      >
                        Confirm &amp; Free Table
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card C: Live Reviews & Reputation Engine Stream */}
          <div className="rounded-card bg-white p-5 border border-divider shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-status-occupied fill-status-occupied" />
                <h3 className="font-header text-sm font-bold text-brand-heading">
                  Live Customer Ratings &amp; Google Reviews
                </h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-card p-3 border border-divider bg-white space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-brand-primary">
                      {rev.tableCode} • Waiter: {rev.staffName}
                    </span>
                    <span className="flex items-center gap-1 rounded-pill bg-status-occupied-bg px-2 py-0.5 text-[10px] font-bold text-status-occupied">
                      ★ {rev.weightedScore} / 5.0
                    </span>
                  </div>

                  {rev.comment && (
                    <p className="text-[11px] text-brand-secondary italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[10px] text-brand-secondary">
                    <span>{rev.timeAgo}</span>
                    {rev.redirectedToGoogle ? (
                      <span className="flex items-center gap-1 text-status-free font-bold">
                        <ExternalLink className="h-3 w-3" />
                        Google Review Funnel Active
                      </span>
                    ) : (
                      <span className="text-brand-secondary">
                        Internal Feedback Only
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Table Inspect & Actions Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-elevated border border-divider space-y-5">
            <div className="flex items-start justify-between border-b border-divider pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-header text-xl font-bold text-brand-heading">
                    Table {selectedTable.unique_code}
                  </h3>
                  <span
                    className={cn(
                      "rounded-pill px-2.5 py-0.5 text-xs font-bold uppercase",
                      selectedTable.status === "occupied" && "bg-status-occupied text-white",
                      selectedTable.status === "free" && "bg-status-free text-white",
                      selectedTable.status === "reserved" && "bg-status-reserved text-white"
                    )}
                  >
                    {selectedTable.status}
                  </span>
                </div>
                <p className="text-xs text-brand-secondary mt-0.5">
                  {selectedTable.section} • Capacity: {selectedTable.capacity} Guests
                </p>
              </div>

              <button
                onClick={() => setSelectedTable(null)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Table Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-divider">
                <span className="text-brand-secondary">Assigned Attendant:</span>
                <span className="font-bold text-brand-primary">
                  {selectedTable.assigned_staff_name || "Unassigned"}
                </span>
              </div>

              {selectedTable.status === "occupied" && (
                <>
                  <div className="flex justify-between py-1.5 border-b border-divider">
                    <span className="text-brand-secondary">Occupied Duration:</span>
                    <span className="font-bold text-status-occupied">
                      {selectedTable.occupied_since_minutes} minutes
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-divider">
                    <span className="text-brand-secondary">Current Bill Balance:</span>
                    <span className="font-header font-bold text-brand-primary text-sm">
                      ETB {(selectedTable.current_order_total || 0).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {selectedTable.status === "free" && (
                <button
                  onClick={() =>
                    handleTableStatusChange(selectedTable.id, "occupied", walkinGuestCount, walkinStaffName)
                  }
                  className="w-full rounded-button bg-status-occupied py-2.5 text-xs font-bold text-white hover:opacity-90 transition"
                >
                  Seat Guests &amp; Mark Occupied
                </button>
              )}

              {selectedTable.status === "occupied" && (
                <button
                  onClick={() => handleTableStatusChange(selectedTable.id, "free")}
                  className="w-full rounded-button bg-status-free py-2.5 text-xs font-bold text-white hover:opacity-90 transition"
                >
                  Clear Table &amp; Mark Free
                </button>
              )}

              <button
                onClick={() =>
                  handleTableStatusChange(
                    selectedTable.id,
                    selectedTable.status === "reserved" ? "free" : "reserved"
                  )
                }
                className="w-full rounded-button bg-bg-card py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-active transition"
              >
                {selectedTable.status === "reserved" ? "Cancel Reservation" : "Mark as Reserved"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Walk-In Seating Quick Modal */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-elevated border border-divider space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="font-header text-lg font-bold text-brand-heading">
                Seat Walk-in Guests
              </h3>
              <button
                onClick={() => setShowWalkinModal(false)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Select Free Table:
                </label>
                <select
                  value={selectedFreeTableId}
                  onChange={(e) => setSelectedFreeTableId(e.target.value)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs font-semibold text-brand-primary"
                >
                  {freeTablesList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.unique_code} ({t.section} - {t.capacity} Seats)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Number of Guests:
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={walkinGuestCount}
                  onChange={(e) => setWalkinGuestCount(parseInt(e.target.value, 10) || 2)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Assign Attendant:
                </label>
                <select
                  value={walkinStaffName}
                  onChange={(e) => setWalkinStaffName(e.target.value)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs font-semibold text-brand-primary"
                >
                  <option value="Michael Tadesse">Michael Tadesse (Lead Waiter)</option>
                  <option value="Sara Mengistu">Sara Mengistu (Terrace Waiter)</option>
                  <option value="Eden Haile">Eden Haile (Lounge Waiter)</option>
                  <option value="Dawit Bekele">Dawit Bekele (VIP Host)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowWalkinModal(false)}
                className="flex-1 rounded-button bg-bg-card py-2 text-xs font-semibold text-brand-primary border border-divider"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleTableStatusChange(selectedFreeTableId, "occupied", walkinGuestCount, walkinStaffName)
                }
                className="flex-1 rounded-button bg-brand-accent py-2 text-xs font-bold text-white hover:bg-brand-accentHover transition"
              >
                Confirm Seating
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Quick Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-elevated border border-divider space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="font-header text-lg font-bold text-brand-heading">
                Replenish Inventory
              </h3>
              <button
                onClick={() => setRestockItem(null)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-brand-primary">
                Item: <strong>{restockItem.name}</strong> ({restockItem.category})
              </p>
              <p className="text-brand-secondary">
                Current Stock: <strong className="text-status-danger">{restockItem.stockQty} {restockItem.unit}</strong> (Threshold: {restockItem.threshold} {restockItem.unit})
              </p>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Add Quantity ({restockItem.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseFloat(e.target.value) || 1)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setRestockItem(null)}
                className="flex-1 rounded-button bg-bg-card py-2 text-xs font-semibold text-brand-primary border border-divider"
              >
                Cancel
              </button>
              <button
                onClick={handleRestock}
                className="flex-1 rounded-button bg-status-free py-2 text-xs font-bold text-white hover:opacity-90 transition"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
