"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  KeyRound,
  CheckCircle2,
  Clock,
  Star,
  Users,
  Award,
  DollarSign,
  ChefHat,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  HeartHandshake,
  X,
  Plus,
  Flame,
  UserCheck,
  FileCheck,
  Palmtree,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentSessionAction } from "@/app/rms-login/actions";
import {
  getStaffLiveTablesAction,
  advanceOrderStatusAction,
  claimTableAction,
  settleTableBillAction,
  getOrderTicketAction,
  OrderTicketDetail,
} from "./actions";
import {
  requestClockInAction,
  requestClockOutAction,
  getMyClockStatusAction,
  submitLeaveRequestAction,
  getMyLeaveRequestsAction,
} from "@/app/admin/staff/actions";
import { PaymentMethodCard, PaymentMethod } from "@/components/order/PaymentMethodCard";
import { PrintableReceipt } from "@/components/order/PrintableReceipt";
import { ReceiptData } from "@/lib/receipts";

interface StaffStationTable {
  id?: string;
  code: string;
  section: string;
  status: "free" | "occupied" | "reserved";
  capacity?: number;
  guests?: number;
  elapsedMinutes?: number;
  billTotal?: number;
  activeOrderId?: string;
  activeOrder?: string;
  foodStatus?: "placed" | "preparing" | "ready" | "served";
  paymentMethod?: "cbe_birr" | "telebirr" | "cash" | "card";
  receiptImage?: string | null;
  transactionRef?: string;
  assignedStaffId?: string;
}

interface TipEntry {
  id: string;
  tableCode: string;
  amount: number;
  method: "cash" | "cbe_birr" | "telebirr";
  time: string;
  customerNote?: string;
}

export default function StaffDashboardPage() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [stationFilter, setStationFilter] = useState<"assigned" | "all">("assigned");
  const [tableCounts, setTableCounts] = useState<{ myCount: number; totalCount: number }>({ myCount: 0, totalCount: 0 });

  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      const session = await getCurrentSessionAction();
      if (!cancelled) setSessionUser(session);
    }
    loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const staffName = sessionUser?.fullName || "Attendant";
  const staffId = sessionUser?.id || "";

  const [clockState, setClockState] = useState<"idle" | "pending" | "clocked_in" | "clocked_out" | "rejected">("idle");
  const [shiftCode, setShiftCode] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [myLeave, setMyLeave] = useState<any[]>([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState("Annual Leave");
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveReason, setLeaveReason] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshClockAndLeave = async () => {
    const [clock, leaves] = await Promise.all([
      getMyClockStatusAction(),
      getMyLeaveRequestsAction(),
    ]);
    if (clock?.state) setClockState(clock.state);
    setMyLeave(leaves || []);
  };

  useEffect(() => {
    if (sessionUser?.id) refreshClockAndLeave();
  }, [sessionUser?.id]);

  // Station Tables State
  const [myTables, setMyTables] = useState<StaffStationTable[]>([]);

  const loadTables = async () => {
    const currentStaffId = sessionUser?.id;
    if (!currentStaffId) return;
    const res = await getStaffLiveTablesAction(currentStaffId, stationFilter === "assigned");
    if (res) {
      setMyTables(res.tables || []);
      setTableCounts({ myCount: res.myCount || 0, totalCount: res.totalCount || 0 });
    }
  };

  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 3000);
    return () => clearInterval(interval);
  }, [sessionUser, stationFilter]);

  // Tips Tracking State (Received from Customer QR Order Payments)
  const [tips, setTips] = useState<TipEntry[]>([
    {
      id: "tip-1",
      tableCode: "T-02",
      amount: 250,
      method: "cbe_birr",
      time: "12:15 PM",
      customerNote: "Extraordinary tibs & attentive service!",
    },
    {
      id: "tip-2",
      tableCode: "T-07",
      amount: 150,
      method: "cash",
      time: "01:30 PM",
    },
  ]);

  const [advancingId, setAdvancingId] = useState<string>("");
  const [settleTable, setSettleTable] = useState<StaffStationTable | null>(null);
  const [isSettling, setIsSettling] = useState(false);
  const [printedReceipt, setPrintedReceipt] = useState<ReceiptData | null>(null);

  // "Check order" popup — full item customization for the table
  const [checkOrderTable, setCheckOrderTable] = useState<StaffStationTable | null>(null);
  const [orderTicket, setOrderTicket] = useState<OrderTicketDetail | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  const openCheckOrder = async (table: StaffStationTable) => {
    if (!table.activeOrderId) return;
    setCheckOrderTable(table);
    setOrderTicket(null);
    setLoadingTicket(true);
    const ticket = await getOrderTicketAction(table.activeOrderId);
    setOrderTicket(ticket);
    setLoadingTicket(false);
  };

  // Training checklist
  const [checklist, setChecklist] = useState([
    { id: 1, title: "Table Etiquette & Greeting Standards", completed: true },
    { id: 2, title: "Digital Menu & Allergen Knowledge", completed: true },
    { id: 3, title: "QR Table System & CBE/Telebirr Verification", completed: true },
    { id: 4, title: "Complaint Handling & Escalation Protocol", completed: false },
  ]);

  const handleToggleChecklist = (id: number) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    showToast("Training progress updated!");
  };

  const handleClockIn = async () => {
    const res = await requestClockInAction(shiftCode || undefined);
    showToast(res.message || (res.success ? "Submitted" : "Failed"));
    await refreshClockAndLeave();
  };

  const handleClockOut = async () => {
    const res = await requestClockOutAction();
    showToast(res.message || (res.success ? "Clocked out" : "Failed"));
    await refreshClockAndLeave();
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await submitLeaveRequestAction({
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
    });
    showToast(res.message || (res.success ? "Leave submitted" : "Failed"));
    if (res.success) {
      setShowLeaveModal(false);
      setLeaveReason("");
      await refreshClockAndLeave();
    }
  };

  const mapWaiterPaymentMethod = (method: PaymentMethod): "cash" | "cbe_birr" | "telebirr" => {
    if (method === "cbe_transfer") return "cbe_birr";
    if (method === "telegram") return "telebirr";
    return "cash";
  };

  const handleWaiterSettle = async (
    method: PaymentMethod,
    payAccount?: string,
    tipAmount?: number
  ) => {
    if (!settleTable?.activeOrderId) return;
    setIsSettling(true);
    const res = await settleTableBillAction(
      settleTable.code,
      settleTable.activeOrderId,
      mapWaiterPaymentMethod(method),
      settleTable.billTotal || 0,
      payAccount?.trim() || undefined,
      tipAmount || 0
    );
    setIsSettling(false);
    if (!res.success) {
      showToast(res.message || "Could not settle this table.");
      return;
    }
    showToast(
      `Table ${settleTable.code} settled${tipAmount ? ` · tip ETB ${tipAmount}` : ""}.`
    );
    setSettleTable(null);
    if (res.receipt) setPrintedReceipt(res.receipt);
    await loadTables();
  };

  const advanceFoodStatus = async (tableCode: string) => {
    const target = myTables.find((t) => t.code === tableCode);
    if (!target?.activeOrderId) return;
    setAdvancingId(tableCode);
    const res = await advanceOrderStatusAction(target.activeOrderId);
    setAdvancingId("");
    if (!res.success) {
      showToast(res.message || "Could not update kitchen status.");
      return;
    }
    showToast(`Table ${tableCode} → ${(res.status || "").toUpperCase()}`);
    await loadTables();
  };

  const totalTips = tips.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-card bg-brand-primary px-4 py-3 text-white shadow-elevated transition-all animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-status-free shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Attendant Profile & Shift Status Header */}
      <div className="rounded-card bg-white p-6 border border-divider shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-brand-primary text-white font-bold text-base flex items-center justify-center shadow-xs">
            MT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-header text-xl font-bold text-brand-heading">
                {staffName}
              </h2>
              <span className="rounded-pill bg-bg-card px-2.5 py-0.5 text-[11px] font-bold text-brand-primary border border-divider capitalize">
                {sessionUser?.role || "Lead Waiter"}
              </span>
            </div>
            <p className="text-xs text-brand-secondary mt-0.5">
              Station: Main Dining Hall (Tables T-03 to T-14) • Today&apos;s Shift: 11:30 AM – 08:30 PM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Tip Summary Counter */}
          <div className="rounded-card bg-brand-accent/10 p-3 border border-brand-accent/30 text-right">
            <p className="text-[10px] uppercase font-bold text-brand-accent">
              Today&apos;s Total Tips
            </p>
            <p className="font-header text-lg font-bold text-brand-heading flex items-center justify-end gap-1">
              <HeartHandshake className="h-4 w-4 text-brand-accent" />
              ETB {totalTips.toLocaleString()}
            </p>
          </div>

          <div className="rounded-card bg-status-occupied-bg/40 p-3 border border-status-occupied/30 text-right">
            <p className="text-[10px] uppercase font-bold text-brand-secondary">
              Guest Rating
            </p>
            <p className="font-header text-lg font-bold text-status-occupied flex items-center justify-end gap-1">
              <Star className="h-4 w-4 fill-status-occupied" />
              4.92 / 5.0
            </p>
          </div>

          <button
            onClick={() => setShowLeaveModal(true)}
            className="flex items-center gap-1.5 rounded-button bg-bg-card px-3 py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-subtle transition shadow-xs cursor-pointer"
          >
            <Palmtree className="h-3.5 w-3.5 text-brand-accent" />
            <span>Request Leave</span>
          </button>
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <div className="grid grid-cols-1 gap-4">
        {/* Clock-In Banner */}
        <div className="rounded-card bg-brand-primary text-white p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-status-free">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-header text-sm font-bold text-white">
                {clockState === "clocked_in"
                  ? "On duty — admin approved"
                  : clockState === "pending"
                  ? "Clock-in waiting for admin approval"
                  : clockState === "rejected"
                  ? "Last clock-in was rejected"
                  : clockState === "clocked_out"
                  ? "Shift completed for today"
                  : "Not clocked in"}
              </h3>
              <p className="text-xs text-white/80">
                Tap &quot;I&apos;m on my job&quot; to request clock-in. Admin must approve before your shift is active.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(clockState === "idle" || clockState === "rejected" || clockState === "clocked_out") && (
              <>
                <input
                  type="text"
                  value={shiftCode}
                  onChange={(e) => setShiftCode(e.target.value)}
                  placeholder="Shift code (optional)"
                  className="rounded-button border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white placeholder:text-white/50 w-36"
                />
                <button
                  onClick={handleClockIn}
                  className="rounded-button bg-status-free px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-90 transition shrink-0"
                >
                  I&apos;m on my job
                </button>
              </>
            )}
            {clockState === "pending" && (
              <span className="rounded-pill bg-status-occupied px-3 py-1.5 text-[11px] font-bold">
                Pending approval
              </span>
            )}
            {clockState === "clocked_in" && (
              <button
                onClick={handleClockOut}
                className="rounded-button bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-white/25 transition shrink-0"
              >
                Clock Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Leave status strip */}
      {myLeave.length > 0 && (
        <div className="rounded-card border border-divider bg-white p-4 shadow-card">
          <h3 className="font-header text-sm font-bold text-brand-heading flex items-center gap-2 mb-3">
            <Palmtree className="h-4 w-4 text-brand-accent" />
            My Leave Requests
          </h3>
          <div className="space-y-2">
            {myLeave.slice(0, 5).map((lv) => (
              <div
                key={lv.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-button border border-divider bg-bg-subtle px-3 py-2 text-xs"
              >
                <div>
                  <p className="font-bold text-brand-primary">{lv.type}</p>
                  <p className="text-brand-secondary">
                    {lv.startDate} → {lv.endDate}
                    {lv.reason ? ` · ${lv.reason}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-pill px-2 py-0.5 text-[10px] font-bold uppercase",
                    lv.status === "approved"
                      ? "bg-status-free-bg text-status-free"
                      : lv.status === "rejected"
                      ? "bg-status-danger-bg text-status-danger"
                      : "bg-status-occupied-bg text-status-occupied"
                  )}
                >
                  {lv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 1: My Assigned Station Floor Tables */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-header text-lg font-bold text-brand-heading flex items-center gap-2">
              <span>Station Floor Tables</span>
              <span className="text-xs font-normal text-brand-secondary">
                ({myTables.length} {stationFilter === "assigned" ? "Assigned to You" : "Total Floor Tables"})
              </span>
            </h3>
            <p className="text-xs text-brand-secondary mt-0.5">
              Update kitchen status here or take payment at the table. Cashier portal also available at /cashier.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-button p-1 bg-bg-card border border-divider shadow-xs">
              <button
                type="button"
                onClick={() => setStationFilter("assigned")}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-button transition",
                  stationFilter === "assigned"
                    ? "bg-brand-accent text-white shadow-xs"
                    : "text-brand-secondary hover:text-brand-primary"
                )}
              >
                My Station ({tableCounts.myCount})
              </button>
              <button
                type="button"
                onClick={() => setStationFilter("all")}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-button transition",
                  stationFilter === "all"
                    ? "bg-brand-accent text-white shadow-xs"
                    : "text-brand-secondary hover:text-brand-primary"
                )}
              >
                All Tables ({tableCounts.totalCount})
              </button>
            </div>
          </div>
        </div>

        {myTables.length === 0 ? (
          <div className="rounded-card border border-dashed border-divider bg-bg-subtle p-8 text-center space-y-3">
            <UtensilsCrossed className="mx-auto h-8 w-8 text-brand-secondary opacity-60" />
            <div>
              <p className="font-header font-bold text-sm text-brand-primary">No tables assigned to your station yet</p>
              <p className="text-xs text-brand-secondary max-w-md mx-auto mt-1">
                You are logged in as <strong>{staffName}</strong>. You currently have 0 tables assigned. Switch to <strong>All Tables</strong> or assign tables to this waiter in <strong>Admin &gt; Floor Table Management</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStationFilter("all")}
              className="px-4 py-2 rounded-button bg-brand-primary text-white text-xs font-bold hover:bg-black transition"
            >
              View All Floor Tables ({tableCounts.totalCount})
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTables.map((table) => {
              const isOccupied = table.status === "occupied";
              const isAssignedToMe = table.assignedStaffId === staffId;

              return (
                <div
                  key={table.code}
                  className={cn(
                    "rounded-card p-5 border transition-all shadow-card flex flex-col justify-between",
                    isOccupied
                      ? "bg-white border-status-occupied/40"
                      : "bg-bg-subtle border-divider opacity-90"
                  )}
                >
                  <div className="space-y-3">
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-header text-lg font-bold text-brand-heading">
                            Table {table.code}
                          </h4>
                          {isAssignedToMe && (
                            <span className="rounded-pill bg-brand-accent/10 px-2 py-0.5 text-[9px] font-bold text-brand-accent border border-brand-accent/20">
                              My Table
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-brand-secondary">{table.section}</p>
                      </div>

                      <span
                        className={cn(
                          "rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase",
                          isOccupied ? "bg-status-occupied text-white" : "bg-status-free text-white"
                        )}
                      >
                        {table.status}
                      </span>
                    </div>

                    {/* Details */}
                    {isOccupied ? (
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between text-[11px] text-brand-secondary">
                          <span>Guests Seated: <strong>{table.guests} Guests</strong></span>
                          <span className="flex items-center gap-1 text-status-occupied font-semibold">
                            <Clock className="h-3 w-3" />
                            {table.elapsedMinutes}m
                          </span>
                        </div>

                        {/* Live Food Status Progress */}
                        <div className="rounded-card bg-bg-subtle p-2.5 border border-divider space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-brand-primary">Kitchen Status:</span>
                            <span
                              className={cn(
                                "font-bold uppercase text-[10px] px-2 py-0.5 rounded-pill",
                                table.foodStatus === "placed" && "bg-status-placed-bg text-status-placed",
                                table.foodStatus === "preparing" && "bg-status-preparing-bg text-status-preparing",
                                table.foodStatus === "ready" && "bg-status-ready-bg text-status-ready animate-pulse font-extrabold",
                                table.foodStatus === "served" && "bg-status-served-bg text-status-served"
                              )}
                            >
                              {table.foodStatus || "placed"}
                            </span>
                          </div>

                          <p className="text-[11px] text-brand-secondary line-clamp-2">
                            {table.activeOrder}
                          </p>

                          <button
                            type="button"
                            onClick={() => openCheckOrder(table)}
                            className="w-full mt-1 py-1.5 rounded-button bg-bg-card border border-divider text-brand-primary font-bold text-[11px] hover:bg-bg-subtle transition flex items-center justify-center gap-1"
                          >
                            <FileCheck className="h-3.5 w-3.5 text-brand-accent" />
                            <span>Check order &amp; customizations</span>
                          </button>

                          <Link
                            href={`/staff/order/${table.code}`}
                            className="w-full mt-1 py-1.5 rounded-button bg-brand-accent/10 border border-brand-accent/30 text-brand-accent font-bold text-[11px] hover:bg-brand-accent/20 transition flex items-center justify-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add items to order</span>
                          </Link>

                          {table.foodStatus !== "served" && (
                            <button
                              type="button"
                              disabled={advancingId === table.code}
                              onClick={() => advanceFoodStatus(table.code)}
                              className="w-full mt-1.5 py-1.5 rounded-button bg-brand-primary text-white font-bold text-xs hover:opacity-90 transition flex items-center justify-center gap-1 shadow-xs disabled:opacity-60"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>
                                {table.foodStatus === "placed" && "Start cooking"}
                                {table.foodStatus === "preparing" && "Mark ready"}
                                {table.foodStatus === "ready" && "Mark served"}
                                {!table.foodStatus && "Advance status"}
                              </span>
                            </button>
                          )}
                          {table.foodStatus === "served" && (
                            <button
                              type="button"
                              onClick={() => setSettleTable(table)}
                              className="w-full mt-1.5 py-1.5 rounded-button bg-status-free text-white font-bold text-xs hover:opacity-90 transition"
                            >
                              Served — take payment
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center space-y-2">
                        <p className="text-xs text-brand-secondary">
                          Table is free and sanitized for next dining guests.
                        </p>
                        <div className="flex flex-col items-center gap-2">
                          {!table.assignedStaffId && (
                            <button
                              type="button"
                              onClick={async () => {
                                await claimTableAction(table.code, staffId);
                                showToast(`Table ${table.code} claimed to your station!`);
                                await loadTables();
                              }}
                              className="rounded-button bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent border border-brand-accent/30 px-3 py-1 text-xs font-bold transition"
                            >
                              + Claim Table
                            </button>
                          )}
                          <Link
                            href={`/staff/order/${table.code}`}
                            className="rounded-button bg-brand-primary text-white px-3 py-1.5 text-xs font-bold hover:opacity-90 transition inline-flex items-center gap-1"
                          >
                            <UtensilsCrossed className="h-3.5 w-3.5" />
                            Start order for table
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {isOccupied && (
                    <div className="pt-3 border-t border-divider mt-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-brand-secondary uppercase">Current Bill</p>
                        <p className="font-header text-base font-bold text-brand-heading">
                          ETB {(table.billTotal || 0).toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettleTable(table)}
                        className="rounded-button bg-brand-accent px-3 py-1.5 text-[11px] font-bold text-white shrink-0"
                      >
                        Take payment
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Shift Customer Tips Log (Read-Only Telemetry) */}
      <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-header text-base font-bold text-brand-heading">
              Customer Gratuities Received ({tips.length} Orders)
            </h3>
            <p className="text-xs text-brand-secondary mt-0.5">
              Read-only shift gratuity log automatically recorded from guest QR table checkouts.
            </p>
          </div>

          <span className="rounded-pill bg-brand-accent/10 px-2.5 py-0.5 text-xs font-bold text-brand-accent border border-brand-accent/20">
            Customer Recorded
          </span>
        </div>

        <div className="space-y-2">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="flex items-center justify-between p-3.5 rounded-card bg-bg-subtle border border-divider text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-accent/10 text-brand-accent font-bold flex items-center justify-center shrink-0">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-heading">Table {tip.tableCode}</span>
                    <span className="rounded-pill bg-bg-card px-2 py-0.2 text-[10px] font-bold text-brand-secondary uppercase border border-divider">
                      {tip.method.replace("_", " ")}
                    </span>
                  </div>
                  {tip.customerNote && (
                    <p className="text-[11px] text-brand-secondary italic mt-0.5">
                      &quot;{tip.customerNote}&quot;
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="font-header text-sm font-bold text-brand-accent">
                  + ETB {tip.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-brand-secondary">{tip.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-card max-w-sm w-full p-6 space-y-5 border border-divider shadow-elevated relative">
            <button
              onClick={() => setShowLeaveModal(false)}
              className="absolute top-4 right-4 text-brand-secondary hover:text-brand-primary p-1 rounded-button hover:bg-bg-subtle transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                <Palmtree className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-header text-base font-bold text-brand-heading">
                  Request Leave
                </h3>
                <p className="text-xs text-brand-secondary">
                  Submitted to HR for admin approval
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-brand-secondary">
                  Leave Type
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-button bg-bg-subtle border border-divider font-bold text-brand-primary"
                >
                  <option>Annual Leave</option>
                  <option>Sick Leave</option>
                  <option>Unpaid Leave</option>
                  <option>Emergency</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-brand-secondary">
                    From
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-button bg-bg-subtle border border-divider font-bold text-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-brand-secondary">
                    To
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-button bg-bg-subtle border border-divider font-bold text-brand-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-brand-secondary">
                  Reason
                </label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  rows={3}
                  placeholder="Brief reason for leave"
                  className="w-full mt-1 px-3 py-2 rounded-button bg-bg-subtle border border-divider text-brand-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-button bg-brand-primary hover:bg-brand-heading text-white font-bold text-xs transition cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                Submit Leave Request
              </button>
            </form>
          </div>
        </div>
      )}

      {checkOrderTable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-card max-w-lg w-full p-5 space-y-4 border border-divider shadow-elevated relative">
            <button
              type="button"
              onClick={() => {
                setCheckOrderTable(null);
                setOrderTicket(null);
              }}
              className="absolute top-4 right-4 text-brand-secondary hover:text-brand-primary p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-header text-base font-bold text-brand-heading">
                  Order — Table {checkOrderTable.code}
                </h3>
                <p className="text-xs text-brand-secondary">
                  Ingredients, extras &amp; chef notes as sent to the kitchen
                </p>
              </div>
            </div>

            {loadingTicket ? (
              <div className="py-10 text-center text-xs text-brand-secondary">
                Loading order…
              </div>
            ) : !orderTicket || orderTicket.items.length === 0 ? (
              <div className="py-10 text-center text-xs text-brand-secondary">
                No items found for this order.
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {orderTicket.customerNote && (
                  <div className="rounded-button bg-status-occupied/10 border border-status-occupied/30 p-2.5 text-xs text-status-occupied font-semibold">
                    Table note: &ldquo;{orderTicket.customerNote}&rdquo;
                  </div>
                )}

                {orderTicket.items.map((item, idx) => {
                  const hasCustomization =
                    item.omittedIngredients.length > 0 ||
                    item.extras.length > 0 ||
                    !!item.chefNote;
                  return (
                    <div
                      key={idx}
                      className="rounded-card border border-divider bg-bg-subtle p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-pill bg-brand-accent text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {item.qty}x
                        </span>
                        <span className="font-bold text-sm text-brand-heading">
                          {item.name}
                        </span>
                      </div>

                      {item.omittedIngredients.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.omittedIngredients.map((ing, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-pill bg-status-danger-bg border border-status-danger/40 px-2 py-0.5 text-[10px] font-bold text-status-danger uppercase"
                            >
                              No {ing}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.extras.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.extras.map((ex, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-pill bg-status-free-bg border border-status-free/40 px-2 py-0.5 text-[10px] font-bold text-status-free uppercase"
                            >
                              + {ex.name}
                              {ex.price > 0 && ` (ETB ${ex.price})`}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.chefNote && (
                        <p className="text-xs text-brand-primary italic">
                          Note: &ldquo;{item.chefNote}&rdquo;
                        </p>
                      )}

                      {!hasCustomization && (
                        <p className="text-[11px] text-brand-secondary">
                          Standard preparation — no customization.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setCheckOrderTable(null);
                setOrderTicket(null);
              }}
              className="w-full py-2.5 rounded-button bg-brand-primary text-white font-bold text-xs hover:bg-brand-heading transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {settleTable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-card max-w-lg w-full p-5 space-y-3 border border-divider shadow-elevated relative">
            <button
              type="button"
              onClick={() => setSettleTable(null)}
              className="absolute top-4 right-4 text-brand-secondary hover:text-brand-primary p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <PaymentMethodCard
              totalAmount={settleTable.billTotal || 0}
              tableCode={settleTable.code}
              staffMode
              onPaymentConfirmed={(method, payAccount, tip) =>
                handleWaiterSettle(method, payAccount, tip)
              }
              isProcessing={isSettling}
            />
          </div>
        </div>
      )}

      {printedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-card max-w-md w-full p-5 space-y-3 border border-divider shadow-elevated">
            <PrintableReceipt
              receipt={printedReceipt}
              continueLabel="Close"
              onContinue={() => setPrintedReceipt(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
