"use client";

import React, { useState, useEffect, useTransition, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  CircleDollarSign,
  TrendingUp,
  DollarSign,
  Plus,
  CheckCircle2,
  RefreshCw,
  Building2,
  X,
  Star,
  Flame,
  Download,
  ShoppingBag,
  UtensilsCrossed,
  CalendarDays,
  Wallet,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFinanceData,
  logExpenseAction,
  MockExpenseItem,
  MenuEngineeringItem,
  type SalesAnalyticsResult,
  type SalesPeriod,
} from "./actions";
import { SALES_PERIOD_LABELS } from "@/lib/sales/periods";
import {
  exportSalesByOrder,
  exportSalesByItem,
  exportSalesFull,
} from "@/lib/sales/export-excel";

type DetailView = "orders" | "items" | "opex" | "menu";

const PERIODS: SalesPeriod[] = ["daily", "weekly", "monthly", "yearly", "all_time"];
const VALID_TABS: DetailView[] = ["orders", "items", "opex", "menu"];

function etb(n: number) {
  return `ETB ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function channelPct(part: number, total: number) {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function todayAddisYmd() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Addis_Ababa" });
}

function AdminFinancePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tabParam = searchParams.get("tab");
  const detailView: DetailView =
    tabParam && VALID_TABS.includes(tabParam as DetailView)
      ? (tabParam as DetailView)
      : "orders";

  const [isPending, startTransition] = useTransition();
  const [period, setPeriod] = useState<SalesPeriod>("daily");
  const [anchorDate, setAnchorDate] = useState(todayAddisYmd());
  const [financeData, setFinanceData] = useState<Awaited<ReturnType<typeof getFinanceData>> | null>(null);
  const [expenseFilter, setExpenseFilter] = useState<string>("all");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [expCategory, setExpCategory] = useState<MockExpenseItem["category"]>("utilities");
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState(5000);
  const [expDate, setExpDate] = useState(todayAddisYmd());

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sales: SalesAnalyticsResult | null = financeData?.sales ?? null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const setDetailView = (tab: DetailView) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "orders") params.delete("tab");
    else params.set("tab", tab);
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const loadData = useCallback(
    (p: SalesPeriod = period, date?: string) => {
      startTransition(async () => {
        const dateArg = p === "daily" ? date ?? anchorDate : undefined;
        const fin = await getFinanceData(p, dateArg);
        setFinanceData(fin);
      });
    },
    [period, anchorDate]
  );

  useEffect(() => {
    loadData("daily", todayAddisYmd());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePeriodChange = (p: SalesPeriod) => {
    setPeriod(p);
    loadData(p, p === "daily" ? anchorDate : undefined);
  };

  const handleDateChange = (ymd: string) => {
    setAnchorDate(ymd);
    if (period === "daily") loadData("daily", ymd);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await logExpenseAction({
        category: expCategory,
        title: expTitle,
        amount: expAmount,
        expenseDate: expDate,
      });
      if (res.success) {
        setShowExpenseModal(false);
        setExpTitle("");
        showToast(`Expense of ETB ${expAmount.toLocaleString()} logged!`);
        loadData();
      }
    });
  };

  if (!financeData || !sales) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  const { kpis, expenses, menuMatrix } = financeData;
  const sk = sales.kpis;
  const cashGap = sk.grossRevenue - sk.paidRevenue;

  const filteredExpenses = expenses.filter((e: MockExpenseItem) => {
    return expenseFilter === "all" || e.category === expenseFilter;
  });

  const ch = sk.channelBreakdown;
  const rev = sk.grossRevenue || 1;

  return (
    <div className="space-y-6 pb-10 sm:space-y-8 sm:pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-card bg-brand-primary px-4 py-3 text-white shadow-elevated animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-status-free shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-divider pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-accent">
              <CircleDollarSign className="h-3 w-3" />
              Sales &amp; Finance
            </span>
            <span className="text-[12px] text-brand-secondary">
              {sales.range.displayFrom} → {sales.range.displayTo}
            </span>
          </div>
          <h1 className="font-header text-2xl font-bold tracking-tight text-brand-heading">
            Sales Dashboard &amp; P&amp;L
          </h1>
          <p className="mt-0.5 font-sans text-xs text-brand-secondary">
            Reconcile cash against booked sales. Export by order or by menu item with COGS and gross profit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              exportSalesByOrder(sales);
              showToast("Exported by-order Excel");
            }}
            className="flex items-center gap-1.5 rounded-button border border-divider bg-bg-card px-3 py-2 text-xs font-semibold text-brand-primary hover:bg-bg-active"
          >
            <Download className="h-3.5 w-3.5" />
            By Order
          </button>
          <button
            type="button"
            onClick={() => {
              exportSalesByItem(sales);
              showToast("Exported by-item Excel");
            }}
            className="flex items-center gap-1.5 rounded-button border border-divider bg-bg-card px-3 py-2 text-xs font-semibold text-brand-primary hover:bg-bg-active"
          >
            <Download className="h-3.5 w-3.5" />
            By Item
          </button>
          <button
            type="button"
            onClick={() => {
              exportSalesFull(sales);
              showToast("Exported full sales workbook");
            }}
            className="flex items-center gap-1.5 rounded-button bg-brand-primary px-3 py-2 text-xs font-bold text-white hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" />
            Full Excel
          </button>
          <button
            type="button"
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 rounded-button bg-brand-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-accentHover"
          >
            <Plus className="h-4 w-4" />
            Log Expense
          </button>
          <button
            type="button"
            onClick={() => loadData()}
            className="flex items-center gap-1.5 rounded-button border border-divider bg-bg-card px-3.5 py-2 text-xs font-semibold text-brand-primary hover:bg-bg-active"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-brand-secondary", isPending && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Period controls */}
      <div className="flex flex-col gap-3 rounded-card border border-divider bg-white p-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePeriodChange(p)}
              className={cn(
                "rounded-pill px-3.5 py-1.5 text-xs font-bold transition",
                period === p
                  ? "bg-brand-primary text-white"
                  : "bg-bg-subtle text-brand-secondary hover:text-brand-primary"
              )}
            >
              {SALES_PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        {period === "daily" && (
          <label className="flex items-center gap-2 text-xs text-brand-secondary">
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="font-semibold">Day</span>
            <input
              type="date"
              value={anchorDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="rounded-button border border-divider bg-bg-subtle px-2 py-1.5 text-xs font-semibold text-brand-primary"
            />
          </label>
        )}
      </div>

      {/* Sales KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-3 rounded-card border border-divider bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              {SALES_PERIOD_LABELS[period]} Gross Sales
            </p>
            <div className="rounded-xl bg-status-free-bg p-2 text-status-free">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="font-header text-2xl font-bold text-brand-heading">{etb(sk.grossRevenue)}</p>
          <div className="flex justify-between border-t border-divider pt-2 text-[11px] text-brand-secondary">
            <span>Dine-in {channelPct(ch.dineIn, rev)}</span>
            <span>Takeout {channelPct(ch.takeout, rev)}</span>
            <span>Delivery {channelPct(ch.delivery, rev)}</span>
          </div>
        </div>

        <div className="space-y-3 rounded-card border border-divider bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">Recipe COGS</p>
            <div className="rounded-xl bg-brand-accent/10 p-2 text-brand-accent">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="font-header text-2xl font-bold text-brand-primary">{etb(sk.realizedCogs)}</p>
          <div className="flex justify-between border-t border-divider pt-2 text-[11px] font-semibold">
            <span className="text-brand-secondary">Target 28–35%</span>
            <span className="font-bold text-status-free">{sk.foodCostPercent}% actual</span>
          </div>
        </div>

        <div className="space-y-3 rounded-card border border-divider bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">Gross Profit</p>
            <div className="rounded-xl bg-status-reserved-bg p-2 text-status-reserved">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="font-header text-2xl font-bold text-brand-heading">{etb(sk.grossProfit)}</p>
          <div className="flex justify-between border-t border-divider pt-2 text-[11px] font-semibold">
            <span className="text-brand-secondary">{sk.orderCount} orders · avg {etb(sk.avgTicket)}</span>
            <span className="font-bold text-status-free">{sk.grossMarginPercent}% margin</span>
          </div>
        </div>

        <div className="space-y-3 rounded-card bg-brand-primary p-5 text-white shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase text-white/80">Net Profit (after OPEX)</p>
            <div className="rounded-xl bg-white/10 p-2 text-status-free">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="font-header text-2xl font-bold">{etb(kpis.netProfit)}</p>
          <div className="flex justify-between border-t border-white/10 pt-2 text-[11px] font-semibold text-white/80">
            <span>OPEX {etb(kpis.totalOpex)}</span>
            <span className="text-status-free">+{kpis.netMarginPercent}% net</span>
          </div>
        </div>
      </div>

      {/* Cash reconciliation */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-card border border-divider bg-white px-4 py-3 shadow-card">
          <Receipt className="h-5 w-5 text-brand-accent shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase text-brand-secondary">Booked sales</p>
            <p className="font-header text-sm font-bold text-brand-heading">{etb(sk.grossRevenue)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-card border border-divider bg-white px-4 py-3 shadow-card">
          <CheckCircle2 className="h-5 w-5 text-status-free shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase text-brand-secondary">
              Paid / expected cash ({sk.paidOrderCount} paid)
            </p>
            <p className="font-header text-sm font-bold text-brand-heading">{etb(sk.paidRevenue)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-card border border-divider bg-white px-4 py-3 shadow-card">
          <Wallet className="h-5 w-5 text-status-occupied shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase text-brand-secondary">
              Tips collected
            </p>
            <p className="font-header text-sm font-bold text-brand-heading">{etb(sk.tipsTotal)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-card border border-divider bg-white px-4 py-3 shadow-card">
          <Wallet className="h-5 w-5 text-status-occupied shrink-0" />
          <div>
            <p className="text-[10px] font-semibold uppercase text-brand-secondary">
              Open / unpaid gap
            </p>
            <p
              className={cn(
                "font-header text-sm font-bold",
                cashGap > 0 ? "text-status-occupied" : "text-status-free"
              )}
            >
              {etb(cashGap)}
            </p>
          </div>
        </div>
      </div>

      {/* Detail tabs */}
      <div className="admin-scroll-x flex items-center gap-2 border-b border-divider pb-2">
        {(
          [
            { id: "orders" as const, label: "By Order", icon: ShoppingBag, count: sales.byOrder.length },
            { id: "items" as const, label: "By Menu Item", icon: UtensilsCrossed, count: sales.byItem.length },
            { id: "opex" as const, label: "OPEX Log", icon: Building2, count: expenses.length },
            { id: "menu" as const, label: "Menu Matrix", icon: Star, count: menuMatrix.length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setDetailView(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-button px-4 py-2 text-xs font-bold transition",
              detailView === tab.id
                ? "bg-brand-primary text-white shadow-xs"
                : "border border-divider bg-white text-brand-secondary hover:bg-bg-subtle hover:text-brand-primary"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
            <span
              className={cn(
                "rounded-pill px-1.5 text-[10px]",
                detailView === tab.id ? "bg-white/20" : "bg-bg-card text-brand-secondary"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* BY ORDER */}
      {detailView === "orders" && (
        <div className="space-y-4 rounded-card border border-divider bg-white p-4 shadow-card sm:p-6">
          <div className="flex flex-col gap-2 border-b border-divider pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-header text-base font-bold text-brand-heading">Sales by order</h2>
              <p className="text-[11px] text-brand-secondary">
                One row per ticket — expand for line items. Matches what a guest paid as a single sale.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                exportSalesByOrder(sales);
                showToast("Exported by-order Excel");
              }}
              className="flex items-center gap-1.5 self-start rounded-button bg-brand-accent px-3 py-1.5 text-xs font-bold text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Excel by order
            </button>
          </div>

          <div className="admin-scroll-x">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b border-divider text-[10px] font-semibold uppercase tracking-wider text-brand-secondary">
                  <th className="pb-3 pl-2">Order</th>
                  <th className="pb-3">When</th>
                  <th className="pb-3">Table / Ch</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Share %</th>
                  <th className="pb-3 text-right">Revenue</th>
                  <th className="pb-3 text-right">Tip</th>
                  <th className="pb-3 text-right">Paid</th>
                  <th className="pb-3 pr-2 text-right">Gross</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {sales.byOrder.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-brand-secondary">
                      No orders in this period.
                    </td>
                  </tr>
                )}
                {sales.byOrder.map((o) => (
                  <React.Fragment key={o.id}>
                    <tr
                      className="cursor-pointer hover:bg-bg-subtle/50"
                      onClick={() =>
                        setExpandedOrderId(expandedOrderId === o.id ? null : o.id)
                      }
                    >
                      <td className="py-3 pl-2 font-bold text-brand-primary">{o.orderNumber}</td>
                      <td className="py-3 font-mono text-[11px] text-brand-secondary">{o.createdAt}</td>
                      <td className="py-3">
                        <span className="font-semibold text-brand-heading">{o.tableLabel}</span>
                        <span className="ml-1 text-[10px] capitalize text-brand-secondary">
                          {o.channel.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "rounded-pill border px-2 py-0.5 text-[10px] font-bold capitalize",
                            o.status === "paid"
                              ? "border-status-free/30 bg-status-free-bg text-status-free"
                              : "border-divider bg-bg-card text-brand-primary"
                          )}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-[11px]">{o.revenueSharePercent}%</td>
                      <td className="py-3 text-right font-header font-bold">{etb(o.revenue)}</td>
                      <td className="py-3 text-right text-brand-accent font-semibold">
                        {o.tipAmount > 0 ? etb(o.tipAmount) : "—"}
                      </td>
                      <td className="py-3 text-right text-brand-secondary">
                        {o.amountPaid > 0 ? etb(o.amountPaid) : "—"}
                      </td>
                      <td className="py-3 pr-2 text-right font-bold text-status-free">
                        {etb(o.grossProfit)}
                        <span className="ml-1 text-[10px] text-brand-secondary">{o.marginPercent}%</span>
                      </td>
                    </tr>
                    {expandedOrderId === o.id && (
                      <tr className="bg-bg-subtle/40">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                            {[
                              { label: "Staff", value: o.waiterName },
                              { label: "Payment", value: o.paymentMethod || "—" },
                              { label: "Pay status", value: o.paymentStatus || "unpaid" },
                              { label: "Food cost %", value: `${o.foodCostPercent}%` },
                              { label: "Tip % of bill", value: `${o.tipPercent}%` },
                              { label: "Expected cash", value: etb(o.expectedCash) },
                            ].map((m) => (
                              <div
                                key={m.label}
                                className="rounded-button border border-divider bg-white px-2.5 py-2"
                              >
                                <p className="text-[9px] font-bold uppercase text-brand-secondary">
                                  {m.label}
                                </p>
                                <p className="text-[11px] font-bold capitalize text-brand-heading">
                                  {m.value}
                                </p>
                              </div>
                            ))}
                          </div>
                          <p className="mb-2 text-[10px] font-semibold uppercase text-brand-secondary">
                            Line items · {o.itemCount} units · {o.revenueSharePercent}% of period sales
                          </p>
                          <div className="admin-scroll-x">
                            <table className="w-full text-[11px]">
                              <thead>
                                <tr className="text-brand-secondary">
                                  <th className="pb-1 text-left">Item</th>
                                  <th className="pb-1 text-right">Qty</th>
                                  <th className="pb-1 text-right">Unit</th>
                                  <th className="pb-1 text-right">Subtotal</th>
                                  <th className="pb-1 text-right">Line share</th>
                                  <th className="pb-1 text-right">COGS share</th>
                                  <th className="pb-1 text-right">Line gross</th>
                                </tr>
                              </thead>
                              <tbody>
                                {o.items.map((line, idx) => {
                                  const lineShare =
                                    o.revenue > 0
                                      ? ((line.subtotal / o.revenue) * 100).toFixed(1)
                                      : "0";
                                  return (
                                    <tr key={`${o.id}-${idx}`}>
                                      <td className="py-1 font-semibold text-brand-heading">
                                        {line.name}
                                      </td>
                                      <td className="py-1 text-right">{line.quantity}</td>
                                      <td className="py-1 text-right">{etb(line.unitPrice)}</td>
                                      <td className="py-1 text-right">{etb(line.subtotal)}</td>
                                      <td className="py-1 text-right font-mono">{lineShare}%</td>
                                      <td className="py-1 text-right text-brand-secondary">
                                        {etb(line.allocatedCogs)}
                                      </td>
                                      <td className="py-1 text-right text-status-free font-semibold">
                                        {etb(line.subtotal - line.allocatedCogs)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
              {sales.byOrder.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-divider font-bold">
                    <td className="py-3 pl-2" colSpan={5}>
                      Period total · {sk.orderCount} orders · tips {etb(sk.tipsTotal)}
                    </td>
                    <td className="py-3 text-right">{etb(sk.grossRevenue)}</td>
                    <td className="py-3 text-right">{etb(sk.tipsTotal)}</td>
                    <td className="py-3 text-right">{etb(sk.paidRevenue)}</td>
                    <td className="py-3 pr-2 text-right text-status-free">{etb(sk.grossProfit)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* BY ITEM */}
      {detailView === "items" && (
        <div className="space-y-4 rounded-card border border-divider bg-white p-4 shadow-card sm:p-6">
          <div className="flex flex-col gap-2 border-b border-divider pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-header text-base font-bold text-brand-heading">Sales by menu item</h2>
              <p className="text-[11px] text-brand-secondary">
                Units sold, period share %, and growth vs the prior equal window.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                exportSalesByItem(sales);
                showToast("Exported by-item Excel");
              }}
              className="flex items-center gap-1.5 self-start rounded-button bg-brand-accent px-3 py-1.5 text-xs font-bold text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Excel by item
            </button>
          </div>

          <div className="admin-scroll-x">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-divider text-[10px] font-semibold uppercase tracking-wider text-brand-secondary">
                  <th className="pb-3 pl-2">Menu item</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3 text-right">Qty</th>
                  <th className="pb-3 text-right">Growth</th>
                  <th className="pb-3 text-right">Share %</th>
                  <th className="pb-3 text-right">Revenue</th>
                  <th className="pb-3 text-right">COGS</th>
                  <th className="pb-3 pr-2 text-right">Gross</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {sales.byItem.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-brand-secondary">
                      No menu items sold in this period.
                    </td>
                  </tr>
                )}
                {sales.byItem.map((item) => (
                  <tr key={item.menuItemId} className="hover:bg-bg-subtle/50">
                    <td className="py-3 pl-2 font-bold text-brand-primary">{item.name}</td>
                    <td className="py-3 text-brand-secondary">{item.category}</td>
                    <td className="py-3 text-right font-header font-bold text-brand-heading">
                      {item.quantitySold}
                    </td>
                    <td
                      className={cn(
                        "py-3 text-right font-semibold",
                        (item.salesGrowthPercent ?? 0) >= 0
                          ? "text-status-free"
                          : "text-status-danger"
                      )}
                    >
                      {item.salesGrowthPercent == null
                        ? "—"
                        : `${item.salesGrowthPercent > 0 ? "+" : ""}${item.salesGrowthPercent}%`}
                    </td>
                    <td className="py-3 text-right font-mono text-[11px]">
                      {item.revenueSharePercent}%
                    </td>
                    <td className="py-3 text-right font-bold">{etb(item.revenue)}</td>
                    <td className="py-3 text-right text-brand-secondary">{etb(item.allocatedCogs)}</td>
                    <td className="py-3 pr-2 text-right font-bold text-status-free">
                      {etb(item.grossProfit)}
                      <span className="ml-1 text-[10px] text-brand-secondary">{item.marginPercent}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OPEX */}
      {detailView === "opex" && (
        <div className="space-y-5 rounded-card border border-divider bg-white p-6 shadow-card">
          <div className="flex flex-col gap-3 border-b border-divider pb-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All Categories" },
                { id: "rent", label: "Rent" },
                { id: "salaries", label: "Salaries" },
                { id: "utilities", label: "Utilities" },
                { id: "supplies", label: "Supplies" },
                { id: "maintenance", label: "Maintenance" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setExpenseFilter(cat.id)}
                  className={cn(
                    "rounded-pill px-3 py-1 text-xs font-semibold transition",
                    expenseFilter === cat.id
                      ? "bg-brand-primary text-white"
                      : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 rounded-button bg-brand-accent px-3 py-1.5 text-xs font-bold text-white"
            >
              <Plus className="h-4 w-4" />
              Log Expense
            </button>
          </div>

          <div className="admin-scroll-x">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-divider text-[10px] font-semibold uppercase tracking-wider text-brand-secondary">
                  <th className="pb-3 pl-2">Expense Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Accounting Date</th>
                  <th className="pb-3">Amount (ETB)</th>
                  <th className="pb-3 pr-2 text-right">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {filteredExpenses.map((exp: MockExpenseItem) => (
                  <tr key={exp.id} className="hover:bg-bg-subtle/50">
                    <td className="py-3.5 pl-2 font-bold text-brand-primary">{exp.title}</td>
                    <td className="py-3.5">
                      <span className="rounded-pill border border-divider bg-bg-card px-2 py-0.5 text-[10px] font-bold capitalize text-brand-primary">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-[11px] text-brand-secondary">
                      {exp.expenseDate}
                    </td>
                    <td className="py-3.5 font-header font-bold text-brand-heading">
                      {etb(exp.amount)}
                    </td>
                    <td className="py-3.5 pr-2 text-right text-[11px] text-brand-secondary">
                      {exp.loggedBy}
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-brand-secondary">
                      No expenses in this period filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MENU MATRIX */}
      {detailView === "menu" && (
        <div className="space-y-4">
          {menuMatrix.length === 0 && (
            <p className="rounded-card border border-divider bg-white p-8 text-center text-xs text-brand-secondary">
              No item sales in this period to classify.
            </p>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {menuMatrix.map((item: MenuEngineeringItem) => {
              const isStar = item.classification === "Star";
              const isPlowhorse = item.classification === "Plowhorse";
              const isPuzzle = item.classification === "Puzzle";
              const isDog = item.classification === "Dog";
              return (
                <div
                  key={item.id}
                  className="space-y-3 rounded-card border border-divider bg-white p-5 shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={cn(
                          "rounded-pill border px-2.5 py-0.5 text-[10px] font-bold uppercase",
                          isStar && "border-status-free/30 bg-status-free-bg text-status-free",
                          isPlowhorse &&
                            "border-status-occupied/30 bg-status-occupied-bg text-status-occupied",
                          isPuzzle &&
                            "border-status-reserved/30 bg-status-reserved-bg text-status-reserved",
                          isDog && "border-status-danger/30 bg-status-danger-bg text-status-danger"
                        )}
                      >
                        {item.classification}
                      </span>
                      <h3 className="mt-1.5 font-header text-base font-bold text-brand-heading">
                        {item.dishName}
                      </h3>
                      <p className="text-[10px] text-brand-secondary">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-header text-sm font-bold text-brand-primary">
                        {etb(item.totalRevenue)}
                      </p>
                      <p className="text-[11px] font-semibold text-brand-secondary">
                        {item.salesCount} sold
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-divider pt-2 text-xs font-semibold">
                    <span className="text-brand-secondary">Gross food margin</span>
                    <span className="font-header text-sm font-bold text-status-free">
                      {item.grossMarginPercent}%
                    </span>
                  </div>
                  <div className="rounded-card border border-divider/60 bg-bg-subtle p-2.5 text-[11px] text-brand-secondary">
                    <strong className="mb-0.5 block text-brand-primary">Recommendation:</strong>
                    {item.recommendation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LOG EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-xs animate-in fade-in sm:items-center sm:p-4">
          <div className="w-full max-w-md space-y-4 rounded-t-card border border-divider bg-white p-6 shadow-elevated sm:rounded-card">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="font-header text-lg font-bold text-brand-heading">
                Log Operational Expense
              </h3>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="rounded-button p-1 text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-brand-primary">
                  Expense Description
                </label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Cooking Gas Cylinders (5x)"
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-semibold text-brand-primary">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) =>
                      setExpCategory(e.target.value as MockExpenseItem["category"])
                    }
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs font-semibold text-brand-primary"
                  >
                    <option value="rent">Rent</option>
                    <option value="salaries">Salaries</option>
                    <option value="utilities">Utilities</option>
                    <option value="supplies">Supplies</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="misc">Misc / Licenses</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-brand-primary">Amount (ETB)</label>
                  <input
                    type="number"
                    min="1"
                    value={expAmount}
                    onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs font-bold text-brand-primary"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block font-semibold text-brand-primary">Accounting Date</label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 rounded-button border border-divider bg-bg-card py-2 text-xs font-semibold text-brand-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-button bg-brand-accent py-2 text-xs font-bold text-white hover:bg-brand-accentHover"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminFinancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-accent" />
        </div>
      }
    >
      <AdminFinancePageInner />
    </Suspense>
  );
}
