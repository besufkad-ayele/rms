"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  DollarSign,
  TrendingUp,
  UtensilsCrossed,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  RefreshCw,
  CreditCard,
  Star,
  Sparkles,
  Crown,
  Sparkle,
  ThumbsUp,
  ShieldAlert,
  XCircle,
  BarChart3,
  Sliders,
  UserCheck,
  Check,
  Inbox,
  SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDashboardData,
  updateTableStatusAction,
  updateTicketStatusAction,
  confirmSettlementAction,
  quickRestockIngredientAction,
  approvePriceRecommendationAction,
  updateStaffPermissionAction,
  PriceRecommendation,
  MenuEngineeringItem,
  StaffPermissionRecord,
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

  // Active User & Main State
  const [sessionUser, setSessionUser] = useState<{ role: string; fullName: string; email?: string }>({
    role: "admin",
    fullName: "Abebe Kebede (Owner)",
  });
  const [activeTab, setActiveTab] = useState<"operations" | "menu_engineering" | "permissions">("operations");

  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [tables, setTables] = useState<TableFloorState[]>([]);
  const [tickets, setTickets] = useState<LiveKitchenTicket[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlertItem[]>([]);
  const [settlements, setSettlements] = useState<PendingSettlementItem[]>([]);
  const [reviews, setReviews] = useState<RecentReviewItem[]>([]);
  const [priceRecommendations, setPriceRecommendations] = useState<PriceRecommendation[]>([]);
  const [menuEngineering, setMenuEngineering] = useState<MenuEngineeringItem[]>([]);
  const [staffPermissions, setStaffPermissions] = useState<StaffPermissionRecord[]>([]);

  // Filter States
  const [floorSection, setFloorSection] = useState<string>("all");
  const [floorStatusFilter, setFloorStatusFilter] = useState<string>("all");
  const [kitchenTab, setKitchenTab] = useState<string>("all");

  // Restock Modal State
  const [restockItem, setRestockItem] = useState<LowStockAlertItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(5);

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  const showToast = (text: string, type: "success" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Data Fetch
  const loadData = async () => {
    const data = await getDashboardData();
    if (data.sessionUser) setSessionUser(data.sessionUser);
    setKpis(data.kpis);
    setTables(data.tables);
    setTickets(data.tickets);
    setAlerts(data.alerts);
    setSettlements(data.settlements);
    setReviews(data.reviews);
    setPriceRecommendations(data.priceRecommendations || []);
    setMenuEngineering(data.menuEngineering || []);
    setStaffPermissions(data.staffPermissionsList || []);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
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

  const handleApprovePriceRecommendation = (rec: PriceRecommendation) => {
    startTransition(async () => {
      const res = await approvePriceRecommendationAction(rec.menuItemId, rec.recommendedPrice);
      if (res.success) {
        setPriceRecommendations((prev) => prev.filter((p) => p.id !== rec.id));
        showToast(`Approved new price ETB ${rec.recommendedPrice} for ${rec.menuItemName}!`);
        loadData();
      }
    });
  };

  const handleTogglePermission = (
    staffId: string,
    permKey: "can_manage_inventory" | "can_view_finance" | "can_manage_shifts" | "can_manage_staff",
    currentVal: boolean
  ) => {
    startTransition(async () => {
      const res = await updateStaffPermissionAction(staffId, permKey, !currentVal);
      if (res.success) {
        setStaffPermissions(res.staffPermissionsList);
        showToast(`Updated permission for staff member.`);
      }
    });
  };

  const filteredTables = tables.filter((t) => {
    const matchSection = floorSection === "all" || t.section === floorSection;
    const matchStatus = floorStatusFilter === "all" || t.status === floorStatusFilter;
    return matchSection && matchStatus;
  });

  const filteredTickets = tickets.filter((t) => {
    if (kitchenTab === "all") return true;
    return t.status === kitchenTab;
  });

  const isOwner = sessionUser.role === "admin";

  if (!kpis) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-accent" />
          <p className="font-sans text-xs font-semibold text-brand-secondary">
            Connecting to Live Supabase Financial Engine...
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

      {/* Top Banner / User Badge & Navigation Tabs */}
      <div className="flex flex-col gap-4 border-b border-divider pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-pill px-3 py-0.5 text-xs font-bold",
                isOwner ? "bg-brand-accent text-white" : "bg-brand-primary text-white"
              )}
            >
              {isOwner ? <Crown className="h-3.5 w-3.5" /> : <ChefHat className="h-3.5 w-3.5" />}
              {isOwner ? "Owner Super-Admin View" : "Operations Manager View"}
            </span>
            <span className="text-xs text-brand-secondary font-medium">
              Signed in as: <strong className="text-brand-heading">{sessionUser.fullName}</strong>
            </span>
          </div>

          <h1 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
            Executive Operations &amp; Intelligence Hub
          </h1>
          <p className="font-sans text-xs text-brand-secondary mt-0.5">
            Real-time Supabase floor occupancy, KDS kitchen tickets stream, recipe COGS deduction, dynamic pricing &amp; menu engineering.
          </p>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-pill bg-bg-card p-1 border border-divider shadow-xs text-xs font-semibold">
            <button
              onClick={() => setActiveTab("operations")}
              className={cn(
                "flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 transition",
                activeTab === "operations"
                  ? "bg-brand-primary text-white"
                  : "text-brand-secondary hover:text-brand-primary"
              )}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Live Operations</span>
            </button>

            {isOwner && (
              <button
                onClick={() => setActiveTab("menu_engineering")}
                className={cn(
                  "flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 transition",
                  activeTab === "menu_engineering"
                    ? "bg-brand-accent text-white font-bold"
                    : "text-brand-secondary hover:text-brand-primary"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Dynamic Pricing &amp; Menu</span>
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => setActiveTab("permissions")}
                className={cn(
                  "flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 transition",
                  activeTab === "permissions"
                    ? "bg-brand-primary text-white"
                    : "text-brand-secondary hover:text-brand-primary"
                )}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Staff Roles &amp; Permissions</span>
              </button>
            )}
          </div>

          <button
            onClick={loadData}
            title="Refresh Data"
            className="flex items-center gap-1.5 rounded-button bg-bg-card px-3.5 py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-active transition"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-brand-secondary", isPending && "animate-spin")} />
            <span>Refresh Live DB</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE LIVE OPERATIONS VIEW */}
      {/* ========================================================================= */}
      {activeTab === "operations" && (
        <div className="space-y-8">
          {/* Executive Top KPI Stats Grid */}
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
                <span className="text-brand-secondary font-medium">Live DB</span>
              </div>
            </div>

            {/* KPI 2: Realized COGS & Profit */}
            <div className="rounded-card bg-white p-5 border border-divider shadow-card relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-secondary">
                    Recipe COGS &amp; Gross Profit
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
                  {kpis.totalTables > 0 ? Math.round((kpis.occupiedTables / kpis.totalTables) * 100) : 0}% Occupancy Rate
                </span>
                <span className="text-status-free font-bold">{kpis.freeTables} Free Tables</span>
              </div>
            </div>

            {/* KPI 4: Kitchen Flow & Rating */}
            <div className="rounded-card bg-white p-5 border border-divider shadow-card relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-secondary">
                    Kitchen Pace &amp; Rating
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

          {/* Floor Matrix Grid */}
          <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-header text-lg font-bold text-brand-heading">
                    Live Table Floor Matrix (Supabase Registered)
                  </h2>
                  <span className="rounded-pill bg-bg-card px-2.5 py-0.5 text-xs font-bold text-brand-primary border border-divider">
                    {tables.length} Registered Tables
                  </span>
                </div>
                <p className="font-sans text-xs text-brand-secondary mt-0.5">
                  Real-time table occupancy status directly from Supabase DB.
                </p>
              </div>

              {/* Section Filter Pills */}
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

            {/* 25 Tables Grid */}
            {filteredTables.length === 0 ? (
              <div className="rounded-card border border-dashed border-divider p-8 text-center space-y-2">
                <Inbox className="h-8 w-8 text-brand-secondary/40 mx-auto" />
                <p className="text-xs font-semibold text-brand-secondary">
                  No registered tables found in Supabase for this filter. Run <code className="bg-bg-card px-1.5 py-0.5 rounded font-mono text-brand-accent">supabase/seed.sql</code> in your SQL editor to populate tables!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pt-2">
                {filteredTables.map((table) => {
                  const isOccupied = table.status === "occupied";
                  const isFree = table.status === "free";
                  const isReserved = table.status === "reserved";

                  return (
                    <div
                      key={table.id}
                      className={cn(
                        "group relative cursor-pointer rounded-card p-3.5 border transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md",
                        isOccupied && "bg-status-occupied-bg/40 border-status-occupied/30 hover:border-status-occupied",
                        isFree && "bg-white border-divider hover:border-status-free hover:bg-status-free-bg/10",
                        isReserved && "bg-status-reserved-bg/30 border-status-reserved/30 hover:border-status-reserved"
                      )}
                    >
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

                      <div className="space-y-1 text-[11px] text-brand-secondary">
                        <p className="truncate font-medium">{table.section}</p>
                        <p className="text-[10px]">Capacity: {table.capacity} Seats</p>
                      </div>

                      {isOccupied && (
                        <div className="mt-3 pt-2.5 border-t border-divider/60 space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold text-brand-primary">
                            <span>ETB {(table.current_order_total || 0).toLocaleString()}</span>
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-status-occupied">
                              <Clock className="h-3 w-3" />
                              {table.occupied_since_minutes}m
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Split Row: KDS + Low Stock & Settlements */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: KDS (7 Cols) */}
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
                    Orders deduct recipe ingredients automatically. Advance tickets as dishes are cooked.
                  </p>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredTickets.length === 0 ? (
                  <div className="rounded-card border border-dashed border-divider p-8 text-center">
                    <UtensilsCrossed className="h-8 w-8 text-brand-secondary/40 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-brand-secondary">
                      No active tickets in kitchen stream right now. Placing a digital QR order will populate this stream live!
                    </p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-card p-4 border bg-white border-divider space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-header text-sm font-bold text-brand-heading">
                            {ticket.tableCode} ({ticket.orderNumber})
                          </span>
                          <p className="text-[11px] text-brand-secondary">Attendant: {ticket.waiterName}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded-pill bg-bg-card px-2.5 py-0.5 text-[10px] font-bold uppercase">
                            {ticket.status}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-button bg-bg-subtle p-3 border border-divider/60 space-y-1 text-xs">
                        {ticket.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="font-semibold text-brand-primary">{item.quantity}× {item.name}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-sans text-xs font-bold text-brand-primary">
                          Total: ETB {ticket.totalAmount.toLocaleString()}
                        </span>

                        <div className="flex items-center gap-2">
                          {ticket.status === "placed" && (
                            <button
                              onClick={() => handleTicketStatusChange(ticket.id, "preparing")}
                              className="rounded-button bg-status-kitchen px-3 py-1.5 text-xs font-bold text-white"
                            >
                              Start Cooking
                            </button>
                          )}
                          {ticket.status === "preparing" && (
                            <button
                              onClick={() => handleTicketStatusChange(ticket.id, "ready")}
                              className="rounded-button bg-status-free px-3 py-1.5 text-xs font-bold text-white"
                            >
                              Mark Ready
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Alerts & Settlements (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Critical Stock Alerts */}
              <div className="rounded-card bg-white p-5 border border-divider shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-status-danger" />
                    <h3 className="font-header text-sm font-bold text-brand-heading">
                      Critical Stock Threshold Alerts
                    </h3>
                  </div>
                  <span className="rounded-pill bg-status-danger-bg px-2 py-0.5 text-[10px] font-bold text-status-danger">
                    {alerts.length} Low
                  </span>
                </div>

                <div className="space-y-2.5">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center rounded-button bg-status-free-bg/30 border border-status-free/20">
                      <CheckCircle2 className="h-5 w-5 text-status-free mx-auto mb-1" />
                      <p className="text-xs font-semibold text-status-free">
                        All ingredient stock levels are healthy above threshold!
                      </p>
                    </div>
                  ) : (
                    alerts.map((item) => (
                      <div key={item.id} className="rounded-card p-3 border border-divider bg-bg-subtle flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-brand-primary">{item.name}</p>
                          <p className="text-[10px] text-brand-secondary">Stock: {item.stockQty} {item.unit}</p>
                        </div>

                        <button
                          onClick={() => {
                            setRestockItem(item);
                            setRestockAmount(500);
                            handleRestock();
                          }}
                          className="rounded-button bg-white px-2.5 py-1 text-[11px] font-bold text-brand-accent border border-divider"
                        >
                          Restock +
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Bill Clearances */}
              <div className="rounded-card bg-white p-5 border border-divider shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-status-occupied" />
                    <h3 className="font-header text-sm font-bold text-brand-heading">
                      Pending Bill Clearances
                    </h3>
                  </div>
                  <span className="rounded-pill bg-status-occupied-bg px-2 py-0.5 text-[10px] font-bold text-status-occupied">
                    {settlements.length} Pending
                  </span>
                </div>

                <div className="space-y-2.5">
                  {settlements.length === 0 ? (
                    <p className="text-xs text-brand-secondary italic text-center py-4">
                      All table payments are currently settled in database.
                    </p>
                  ) : (
                    settlements.map((item) => (
                      <div key={item.id} className="rounded-card p-3 border border-status-occupied/30 bg-status-occupied-bg/10 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-brand-primary">Table {item.tableCode} (ETB {item.amount.toLocaleString()})</p>
                          <p className="text-[10px] text-brand-secondary">Method: {item.method.toUpperCase()}</p>
                        </div>

                        <button
                          onClick={() => handleConfirmSettlement(item.id, item.tableCode, item.amount)}
                          className="rounded-button bg-status-free px-3 py-1.5 text-xs font-bold text-white"
                        >
                          Confirm Clear
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DYNAMIC PRICING & MENU ENGINEERING MATRIX (OWNER ONLY) */}
      {/* ========================================================================= */}
      {activeTab === "menu_engineering" && isOwner && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Section A: Dynamic Recipe Price Recommendation Engine */}
          <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-divider pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-accent" />
                  <h2 className="font-header text-lg font-bold text-brand-heading">
                    Dynamic Recipe Price Recommendation Engine
                  </h2>
                </div>
                <p className="font-sans text-xs text-brand-secondary mt-0.5">
                  Automatically detects raw ingredient market price increases and recommends optimal menu item price adjustments to protect target margins.
                </p>
              </div>

              <span className="rounded-pill bg-brand-accent/10 px-3 py-1 text-xs font-bold text-brand-accent">
                {priceRecommendations.length} Dynamic Recommendations
              </span>
            </div>

            {priceRecommendations.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-divider rounded-card">
                <SparklesIcon className="h-8 w-8 text-brand-accent/40 mx-auto mb-2" />
                <p className="text-xs text-brand-secondary font-semibold">
                  No active menu items found in Supabase. Run <code className="font-mono text-brand-accent">supabase/seed.sql</code> to populate menu items!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {priceRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-card p-5 border border-brand-accent/30 bg-background-active/30 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="rounded-pill bg-bg-card px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-primary border border-divider">
                          {rec.category}
                        </span>
                        <h3 className="font-header text-base font-bold text-brand-heading mt-1">
                          {rec.menuItemName}
                        </h3>
                      </div>
                      <span className="rounded-pill bg-status-occupied-bg px-2.5 py-1 text-[11px] font-bold text-status-occupied border border-status-occupied/20">
                        Food Cost: {rec.currentFoodCostPct}%
                      </span>
                    </div>

                    <p className="text-xs text-brand-secondary bg-white/80 p-2.5 rounded-button border border-divider italic">
                      💡 &ldquo;{rec.ingredientCostChangeNote}&rdquo;
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1 text-xs">
                      <div className="p-2 rounded-button bg-white border border-divider">
                        <span className="text-[10px] text-brand-secondary block">Current Price</span>
                        <strong className="text-brand-primary font-header text-sm">ETB {rec.currentPrice}</strong>
                      </div>
                      <div className="p-2 rounded-button bg-status-free-bg/50 border border-status-free/30">
                        <span className="text-[10px] text-status-free font-bold block">Recommended</span>
                        <strong className="text-status-free font-header text-sm">ETB {rec.recommendedPrice}</strong>
                      </div>
                      <div className="p-2 rounded-button bg-white border border-divider">
                        <span className="text-[10px] text-brand-secondary block">New Margin %</span>
                        <strong className="text-brand-accent font-header text-sm">{rec.projectedFoodCostPct}% Cost</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleApprovePriceRecommendation(rec)}
                      className="w-full flex items-center justify-center gap-2 rounded-button bg-brand-accent py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-accentHover transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve &amp; Update Price to ETB {rec.recommendedPrice}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Menu Engineering Matrix (Stars, Plowhorses, Puzzles, Dogs) */}
          <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-6">
            <div>
              <h2 className="font-header text-lg font-bold text-brand-heading">
                Menu Engineering Profitability Matrix
              </h2>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                Classifies dishes based on customer demand (volume) vs profitability (gross margin) to highlight top performers and underperforming dishes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stars */}
              <div className="rounded-card p-4 border border-status-free/40 bg-status-free-bg/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-header font-bold text-sm text-status-free flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-status-free" />
                    Stars (High Vol + High Margin)
                  </span>
                </div>
                <p className="text-[11px] text-brand-secondary">
                  Your best menu items. High demand and high profitability.
                </p>
                <div className="space-y-2 pt-1">
                  {menuEngineering
                    .filter((m) => m.classification === "Star")
                    .map((item) => (
                      <div key={item.id} className="p-2.5 rounded-button bg-white border border-divider text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-brand-primary">
                          <span>{item.name}</span>
                          <span>ETB {item.price}</span>
                        </div>
                        <p className="text-[10px] text-status-free font-semibold">{item.recommendationAction}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Plowhorses */}
              <div className="rounded-card p-4 border border-status-occupied/40 bg-status-occupied-bg/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-header font-bold text-sm text-status-occupied flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-status-occupied" />
                    Plowhorses (High Vol + Low Margin)
                  </span>
                </div>
                <p className="text-[11px] text-brand-secondary">
                  Popular dishes with lower profit margins. Recommend price increases.
                </p>
                <div className="space-y-2 pt-1">
                  {menuEngineering
                    .filter((m) => m.classification === "Plowhorse")
                    .map((item) => (
                      <div key={item.id} className="p-2.5 rounded-button bg-white border border-divider text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-brand-primary">
                          <span>{item.name}</span>
                          <span>ETB {item.price}</span>
                        </div>
                        <p className="text-[10px] text-status-occupied font-semibold">{item.recommendationAction}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Puzzles */}
              <div className="rounded-card p-4 border border-brand-accent/40 bg-brand-accent/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-header font-bold text-sm text-brand-accent flex items-center gap-1.5">
                    <Sparkle className="h-4 w-4 text-brand-accent" />
                    Puzzles (Low Vol + High Margin)
                  </span>
                </div>
                <p className="text-[11px] text-brand-secondary">
                  High margin dishes that need better marketing or menu placement.
                </p>
                <div className="space-y-2 pt-1">
                  {menuEngineering
                    .filter((m) => m.classification === "Puzzle")
                    .map((item) => (
                      <div key={item.id} className="p-2.5 rounded-button bg-white border border-divider text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-brand-primary">
                          <span>{item.name}</span>
                          <span>ETB {item.price}</span>
                        </div>
                        <p className="text-[10px] text-brand-accent font-semibold">{item.recommendationAction}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Dogs */}
              <div className="rounded-card p-4 border border-status-danger/40 bg-status-danger-bg/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-header font-bold text-sm text-status-danger flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-status-danger" />
                    Dogs (Low Vol + Low Margin)
                  </span>
                </div>
                <p className="text-[11px] text-brand-secondary">
                  Low demand and low profitability. Candidates for removal.
                </p>
                <div className="space-y-2 pt-1">
                  {menuEngineering
                    .filter((m) => m.classification === "Dog")
                    .map((item) => (
                      <div key={item.id} className="p-2.5 rounded-button bg-white border border-divider text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-brand-primary">
                          <span>{item.name}</span>
                          <span>ETB {item.price}</span>
                        </div>
                        <p className="text-[10px] text-status-danger font-semibold">{item.recommendationAction}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Action Cards: What to Add Next vs What to Stop Providing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-divider">
              <div className="rounded-card p-5 border border-status-free/40 bg-status-free-bg/10 space-y-3">
                <div className="flex items-center gap-2 text-status-free">
                  <ThumbsUp className="h-5 w-5" />
                  <h3 className="font-header font-bold text-sm text-brand-heading">
                    Owner Recommendation: What to Add Next
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-brand-primary">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-status-free shrink-0 mt-0.5" />
                    <span><strong>Add Avocado &amp; Goat Cheese Sambusa Trio:</strong> High customer inquiry during fasting seasons with 72% projected gross margin.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-status-free shrink-0 mt-0.5" />
                    <span><strong>Add Aged Tej Cocktail Decanters:</strong> Terrace lounge guests frequently request artisanal honey wine infusions.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-card p-5 border border-status-danger/40 bg-status-danger-bg/10 space-y-3">
                <div className="flex items-center gap-2 text-status-danger">
                  <ShieldAlert className="h-5 w-5" />
                  <h3 className="font-header font-bold text-sm text-brand-heading">
                    Owner Recommendation: What to Stop Providing
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-brand-primary">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-status-danger shrink-0 mt-0.5" />
                    <span><strong>Remove Slow Steamed Vegetable Side:</strong> Accounts for less than 1.2% of sales with frequent kitchen spoilage variance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-status-danger shrink-0 mt-0.5" />
                    <span><strong>De-list Generic Carbonated Soda 300ml:</strong> Replace with higher-margin artisanal fresh house fruit juices.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STAFF ROLES & GRANULAR PERMISSION MANAGEMENT (OWNER ONLY) */}
      {/* ========================================================================= */}
      {activeTab === "permissions" && isOwner && (
        <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-6 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-brand-accent" />
              <h2 className="font-header text-lg font-bold text-brand-heading">
                Staff Granular Role &amp; Access Permission Control
              </h2>
            </div>
            <p className="font-sans text-xs text-brand-secondary mt-0.5">
              The Owner grants or revokes modular operational permissions for each manager and staff member in Supabase DB.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-divider text-brand-secondary font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Manage Inventory</th>
                  <th className="py-3 px-4 text-center">View Financial P&amp;L</th>
                  <th className="py-3 px-4 text-center">Manage Shifts</th>
                  <th className="py-3 px-4 text-center">Manage Staff HR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {staffPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-brand-secondary italic">
                      No staff accounts found in Supabase. Run <code className="font-mono text-brand-accent">supabase/seed.sql</code> to populate staff accounts!
                    </td>
                  </tr>
                ) : (
                  staffPermissions.map((staff) => (
                    <tr key={staff.id} className="hover:bg-bg-subtle/50 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-brand-primary">{staff.fullName}</p>
                        <p className="text-[10px] text-brand-secondary font-mono">{staff.email || staff.phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-pill bg-bg-card px-2.5 py-0.5 text-[10px] font-bold uppercase text-brand-primary border border-divider">
                          {staff.role}
                        </span>
                      </td>

                      {/* Permission Switches */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePermission(staff.id, "can_manage_inventory", staff.permissions.can_manage_inventory)}
                          className={cn(
                            "px-3 py-1 rounded-pill text-[10px] font-bold transition",
                            staff.permissions.can_manage_inventory
                              ? "bg-status-free-bg text-status-free border border-status-free/30"
                              : "bg-bg-subtle text-brand-secondary border border-divider"
                          )}
                        >
                          {staff.permissions.can_manage_inventory ? "Granted" : "Disabled"}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePermission(staff.id, "can_view_finance", staff.permissions.can_view_finance)}
                          className={cn(
                            "px-3 py-1 rounded-pill text-[10px] font-bold transition",
                            staff.permissions.can_view_finance
                              ? "bg-status-free-bg text-status-free border border-status-free/30"
                              : "bg-bg-subtle text-brand-secondary border border-divider"
                          )}
                        >
                          {staff.permissions.can_view_finance ? "Granted" : "Disabled"}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePermission(staff.id, "can_manage_shifts", staff.permissions.can_manage_shifts)}
                          className={cn(
                            "px-3 py-1 rounded-pill text-[10px] font-bold transition",
                            staff.permissions.can_manage_shifts
                              ? "bg-status-free-bg text-status-free border border-status-free/30"
                              : "bg-bg-subtle text-brand-secondary border border-divider"
                          )}
                        >
                          {staff.permissions.can_manage_shifts ? "Granted" : "Disabled"}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleTogglePermission(staff.id, "can_manage_staff", staff.permissions.can_manage_staff)}
                          className={cn(
                            "px-3 py-1 rounded-pill text-[10px] font-bold transition",
                            staff.permissions.can_manage_staff
                              ? "bg-status-free-bg text-status-free border border-status-free/30"
                              : "bg-bg-subtle text-brand-secondary border border-divider"
                          )}
                        >
                          {staff.permissions.can_manage_staff ? "Granted" : "Disabled"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
