"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  ShoppingBag,
  Clock,
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  ChefHat,
  X,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getOrdersData,
  advanceOrderStatusAction,
  disputeOrderAction,
  MockAdminOrder,
} from "./actions";

export default function AdminOrdersPage() {
  const [isPending, startTransition] = useTransition();

  const [orders, setOrders] = useState<MockAdminOrder[]>([]);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<MockAdminOrder | null>(null);
  const [disputeOrder, setDisputeOrder] = useState<MockAdminOrder | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>("Customer requested cancellation");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    const data = await getOrdersData();
    setOrders(data.orders);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchChannel = channelFilter === "all" || o.channel === channelFilter;
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch =
      searchQuery === "" ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tableCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.waiterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchChannel && matchStatus && matchSearch;
  });

  const activeOrders = orders.filter((o) => o.status !== "paid" && o.status !== "cancelled" && o.status !== "disputed");
  const totalVolume = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCogs = orders.reduce((sum, o) => sum + o.calculatedCogs, 0);

  const handleAdvanceStatus = (orderId: string, newStatus: MockAdminOrder["status"]) => {
    startTransition(async () => {
      const res = await advanceOrderStatusAction(orderId, newStatus);
      if (res.success) {
        setOrders(res.orders);
        showToast(`Order status updated to ${newStatus.toUpperCase()}`);
      }
    });
  };

  const handleDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrder) return;

    startTransition(async () => {
      const res = await disputeOrderAction(disputeOrder.id, disputeReason);
      if (res.success) {
        setOrders(res.orders);
        setDisputeOrder(null);
        showToast(`Order ${disputeOrder.orderNumber} marked as DISPUTED. Recipe stock restored!`);
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
              <ShoppingBag className="h-3 w-3" />
              Module 03: Kitchen &amp; Fulfillment
            </span>
            <span className="text-[12px] text-brand-secondary">
              • Real-time Order Life Cycle &amp; Inventory Reversals
            </span>
          </div>
          <h1 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
            Orders Pipeline &amp; Kitchen Management
          </h1>
          <p className="font-sans text-xs text-brand-secondary mt-0.5">
            Monitor real-time ticket fulfillment, calculate dish COGS per order, and handle dispute cancellations with automated stock restoration.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-button bg-white p-1 border border-divider">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "rounded-button px-3 py-1 text-xs font-bold transition",
                viewMode === "kanban"
                  ? "bg-brand-primary text-white"
                  : "text-brand-secondary hover:text-brand-primary"
              )}
            >
              Pipeline Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "rounded-button px-3 py-1 text-xs font-bold transition",
                viewMode === "table"
                  ? "bg-brand-primary text-white"
                  : "text-brand-secondary hover:text-brand-primary"
              )}
            >
              Table History
            </button>
          </div>

          <button
            onClick={loadData}
            title="Refresh Orders"
            className="flex items-center gap-1.5 rounded-button bg-bg-card px-3.5 py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-active transition"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-brand-secondary", isPending && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Active In Kitchen
            </p>
            <p className="font-header text-2xl font-bold text-status-occupied mt-1">
              {activeOrders.length} Tickets
            </p>
          </div>
          <div className="rounded-xl bg-status-occupied-bg p-2.5 text-status-occupied">
            <ChefHat className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Total Order Volume
            </p>
            <p className="font-header text-xl font-bold text-brand-heading mt-1">
              ETB {totalVolume.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-status-free-bg p-2.5 text-status-free">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Calculated COGS
            </p>
            <p className="font-header text-xl font-bold text-brand-primary mt-1">
              ETB {totalCogs.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-brand-accent/10 p-2.5 text-brand-accent">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Average Margin
            </p>
            <p className="font-header text-xl font-bold text-status-free mt-1">
              {totalVolume > 0 ? (((totalVolume - totalCogs) / totalVolume) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="rounded-xl bg-bg-card p-2.5 text-brand-primary">
            <UtensilsCrossed className="h-5 w-5 text-brand-accent" />
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-3 border-b border-divider">
        {/* Channel Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Channels" },
            { id: "dine_in", label: "Dine-In" },
            { id: "takeout", label: "Takeout" },
            { id: "delivery", label: "Delivery" },
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => setChannelFilter(ch.id)}
              className={cn(
                "rounded-pill px-3 py-1 text-xs font-semibold transition",
                channelFilter === ch.id
                  ? "bg-brand-primary text-white"
                  : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
              )}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-secondary" />
          <input
            type="text"
            placeholder="Search order #, table, dish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary placeholder:text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
        </div>
      </div>

      {/* PIPELINE KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {/* Column 1: Placed */}
          <div className="rounded-card bg-bg-subtle/80 p-4 border border-divider space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-divider">
              <span className="flex items-center gap-2 font-header text-xs font-bold uppercase text-brand-heading">
                <span className="h-2 w-2 rounded-full bg-status-occupied" />
                Placed Tickets
              </span>
              <span className="rounded-pill bg-status-occupied-bg px-2 py-0.5 text-[10px] font-bold text-status-occupied">
                {orders.filter((o) => o.status === "placed").length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredOrders
                .filter((o) => o.status === "placed")
                .map((order) => (
                  <OrderKanbanCard
                    key={order.id}
                    order={order}
                    onAdvance={() => handleAdvanceStatus(order.id, "preparing")}
                    advanceLabel="Start Prep"
                    onDispute={() => setDisputeOrder(order)}
                    onInspect={() => setSelectedOrder(order)}
                  />
                ))}
            </div>
          </div>

          {/* Column 2: Preparing */}
          <div className="rounded-card bg-bg-subtle/80 p-4 border border-divider space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-divider">
              <span className="flex items-center gap-2 font-header text-xs font-bold uppercase text-brand-heading">
                <span className="h-2 w-2 rounded-full bg-status-kitchen" />
                In Preparation
              </span>
              <span className="rounded-pill bg-status-kitchen-bg px-2 py-0.5 text-[10px] font-bold text-status-kitchen">
                {orders.filter((o) => o.status === "preparing").length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredOrders
                .filter((o) => o.status === "preparing")
                .map((order) => (
                  <OrderKanbanCard
                    key={order.id}
                    order={order}
                    onAdvance={() => handleAdvanceStatus(order.id, "ready")}
                    advanceLabel="Mark Ready"
                    onDispute={() => setDisputeOrder(order)}
                    onInspect={() => setSelectedOrder(order)}
                  />
                ))}
            </div>
          </div>

          {/* Column 3: Ready for Table */}
          <div className="rounded-card bg-bg-subtle/80 p-4 border border-divider space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-divider">
              <span className="flex items-center gap-2 font-header text-xs font-bold uppercase text-brand-heading">
                <span className="h-2 w-2 rounded-full bg-status-free" />
                Ready to Serve
              </span>
              <span className="rounded-pill bg-status-free-bg px-2 py-0.5 text-[10px] font-bold text-status-free">
                {orders.filter((o) => o.status === "ready").length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredOrders
                .filter((o) => o.status === "ready")
                .map((order) => (
                  <OrderKanbanCard
                    key={order.id}
                    order={order}
                    onAdvance={() => handleAdvanceStatus(order.id, "served")}
                    advanceLabel="Mark Served"
                    onDispute={() => setDisputeOrder(order)}
                    onInspect={() => setSelectedOrder(order)}
                  />
                ))}
            </div>
          </div>

          {/* Column 4: Served / Settling */}
          <div className="rounded-card bg-bg-subtle/80 p-4 border border-divider space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-divider">
              <span className="flex items-center gap-2 font-header text-xs font-bold uppercase text-brand-heading">
                <span className="h-2 w-2 rounded-full bg-brand-primary" />
                Served / Settling
              </span>
              <span className="rounded-pill bg-bg-card px-2 py-0.5 text-[10px] font-bold text-brand-primary">
                {orders.filter((o) => o.status === "served").length}
              </span>
            </div>

            <div className="space-y-3">
              {filteredOrders
                .filter((o) => o.status === "served")
                .map((order) => (
                  <OrderKanbanCard
                    key={order.id}
                    order={order}
                    onAdvance={() => handleAdvanceStatus(order.id, "paid")}
                    advanceLabel="Mark Paid"
                    onDispute={() => setDisputeOrder(order)}
                    onInspect={() => setSelectedOrder(order)}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="rounded-card bg-white p-6 border border-divider shadow-card overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-divider text-brand-secondary uppercase font-semibold text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Order #</th>
                <th className="pb-3">Table / Channel</th>
                <th className="pb-3">Attendant</th>
                <th className="pb-3">Items Summary</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Recipe COGS</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider/60">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-bg-subtle/50 transition">
                  <td className="py-3.5 pl-2 font-bold font-mono text-brand-primary">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3.5">
                    <span className="font-bold text-brand-primary">{ord.tableCode}</span>
                    <span className="text-[11px] text-brand-secondary ml-1 capitalize">
                      ({ord.channel.replace("_", " ")})
                    </span>
                  </td>
                  <td className="py-3.5 text-brand-secondary font-medium">
                    {ord.waiterName}
                  </td>
                  <td className="py-3.5 text-brand-primary">
                    <p className="truncate max-w-[200px]">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </p>
                  </td>
                  <td className="py-3.5 font-bold text-brand-heading">
                    ETB {ord.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 font-mono text-brand-secondary">
                    ETB {ord.calculatedCogs.toFixed(2)}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={cn(
                        "rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase",
                        ord.status === "placed" && "bg-status-occupied text-white",
                        ord.status === "preparing" && "bg-status-kitchen text-white",
                        ord.status === "ready" && "bg-status-free text-white",
                        ord.status === "served" && "bg-brand-primary text-white",
                        ord.status === "paid" && "bg-status-free-bg text-status-free border border-status-free/20",
                        ord.status === "disputed" && "bg-status-danger text-white"
                      )}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="rounded-button bg-bg-card px-2.5 py-1 text-[11px] font-bold text-brand-primary border border-divider hover:bg-bg-active transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {disputeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-elevated border border-divider space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-status-danger" />
                <h3 className="font-header text-lg font-bold text-brand-heading">
                  Flag Order Dispute / Cancellation
                </h3>
              </div>
              <button
                onClick={() => setDisputeOrder(null)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit} className="space-y-3 text-xs">
              <div className="rounded-card bg-status-danger-bg p-3 border border-status-danger/20 text-status-danger space-y-1">
                <p className="font-bold">
                  Order {disputeOrder.orderNumber} ({disputeOrder.tableCode}) - ETB {disputeOrder.totalAmount}
                </p>
                <p className="text-[11px]">
                  Flagging this order will immediately trigger <strong>Automated Reverse Recipe Deduction</strong>, restoring all ingredients back to active inventory balance.
                </p>
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Reason for Dispute / Return:
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-semibold"
                >
                  <option value="Customer requested cancellation">Customer Requested Cancellation</option>
                  <option value="Kitchen preparation error">Kitchen Preparation Error / Wrong Dish</option>
                  <option value="Severe food quality dispute">Severe Food Quality Dispute</option>
                  <option value="Accidental duplicate order">Accidental Duplicate Order</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeOrder(null)}
                  className="flex-1 rounded-button bg-bg-card py-2 text-xs font-semibold text-brand-primary border border-divider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-button bg-status-danger py-2 text-xs font-bold text-white hover:opacity-90 transition"
                >
                  Confirm &amp; Restore Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-elevated border border-divider space-y-4">
            <div className="flex items-start justify-between border-b border-divider pb-3">
              <div>
                <h3 className="font-header text-lg font-bold text-brand-heading">
                  Order Details: {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-brand-secondary">
                  Table {selectedOrder.tableCode} • Attendant: {selectedOrder.waiterName} • {selectedOrder.createdAt}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2 text-xs">
              <p className="font-semibold uppercase text-brand-secondary text-[10px]">
                Ordered Dishes:
              </p>
              <div className="space-y-1.5">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-button bg-bg-subtle p-2 border border-divider/60"
                  >
                    <div>
                      <span className="font-bold text-brand-primary">{item.quantity}× {item.name}</span>
                      {item.notes && (
                        <p className="text-[11px] text-status-occupied italic">{item.notes}</p>
                      )}
                    </div>
                    <span className="font-bold font-header text-brand-primary">
                      ETB {item.subtotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {selectedOrder.customerNotes && (
                <div className="rounded-button bg-bg-card p-2 text-[11px] text-brand-secondary italic">
                  Note: {selectedOrder.customerNotes}
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-divider space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-secondary">Recipe COGS Cost:</span>
                <span className="font-mono text-brand-primary">ETB {selectedOrder.calculatedCogs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm">
                <span className="text-brand-primary">Gross Bill Total:</span>
                <span className="font-header text-brand-heading">ETB {selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full rounded-button bg-brand-primary py-2 text-xs font-bold text-white hover:opacity-90 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Kanban Card Subcomponent
function OrderKanbanCard({
  order,
  onAdvance,
  advanceLabel,
  onDispute,
  onInspect,
}: {
  order: MockAdminOrder;
  onAdvance: () => void;
  advanceLabel: string;
  onDispute: () => void;
  onInspect: () => void;
}) {
  return (
    <div className="rounded-card bg-white p-3.5 border border-divider shadow-xs space-y-3 hover:border-brand-accent transition">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="font-header font-bold text-sm text-brand-heading">
            {order.tableCode}
          </span>
          <span className="text-[11px] font-mono text-brand-secondary ml-1.5">
            {order.orderNumber}
          </span>
        </div>
        <span className="text-[10px] text-brand-secondary font-medium">
          {order.createdAt}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1 text-xs">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-[11px]">
            <span className="font-medium text-brand-primary truncate max-w-[150px]">
              {item.quantity}× {item.name}
            </span>
            <span className="font-mono text-brand-secondary">ETB {item.subtotal}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-divider flex items-center justify-between text-xs">
        <span className="font-bold text-brand-heading">
          ETB {order.totalAmount.toLocaleString()}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onDispute}
            title="Flag Dispute / Cancel"
            className="p-1 rounded-button text-brand-secondary hover:text-status-danger hover:bg-status-danger-bg"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onAdvance}
            className="rounded-button bg-brand-primary px-2.5 py-1 text-[10px] font-bold text-white shadow-xs hover:opacity-90 transition"
          >
            {advanceLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
