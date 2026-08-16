"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  CircleDollarSign,
  TrendingUp,
  DollarSign,
  PieChart,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Building2,
  Users,
  Lightbulb,
  X,
  Star,
  Flame,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFinanceData,
  logExpenseAction,
  MockExpenseItem,
  MenuEngineeringItem,
} from "./actions";

export default function AdminFinancePage() {
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"opex" | "menu">("opex");
  const [financeData, setFinanceData] = useState<any>(null);
  const [expenseFilter, setExpenseFilter] = useState<string>("all");
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);

  // New Expense Form State
  const [expCategory, setExpCategory] = useState<MockExpenseItem["category"]>("utilities");
  const [expTitle, setExpTitle] = useState<string>("");
  const [expAmount, setExpAmount] = useState<number>(5000);
  const [expDate, setExpDate] = useState<string>("2026-08-15");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    const data = await getFinanceData();
    setFinanceData(data);
  };

  useEffect(() => {
    loadData();
  }, []);

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

  if (!financeData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-accent" />
      </div>
    );
  }

  const { kpis, expenses, menuMatrix } = financeData;

  const filteredExpenses = expenses.filter((e: MockExpenseItem) => {
    return expenseFilter === "all" || e.category === expenseFilter;
  });

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
              <CircleDollarSign className="h-3 w-3" />
              Module 05: Financial Analytics &amp; P&amp;L
            </span>
            <span className="text-[12px] text-brand-secondary">
              • True Net Profit, Automated COGS &amp; Menu Matrix
            </span>
          </div>
          <h1 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
            Financial Performance &amp; Net Profit Intelligence
          </h1>
          <p className="font-sans text-xs text-brand-secondary mt-0.5">
            Realize true net profitability by combining sales channels, exact recipe BOM food deductions, and operational expenses.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 rounded-button bg-brand-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-accentHover transition"
          >
            <Plus className="h-4 w-4" />
            <span>Log Operational Expense</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh Finance Data"
            className="flex items-center gap-1.5 rounded-button bg-bg-card px-3.5 py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-active transition"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-brand-secondary", isPending && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary P&L Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="rounded-card bg-white p-5 border border-divider shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Monthly Gross Revenue
            </p>
            <div className="rounded-xl bg-status-free-bg p-2 text-status-free">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="font-header text-2xl font-bold text-brand-heading">
            ETB {kpis.grossRevenue.toLocaleString()}
          </p>
          <div className="pt-2 border-t border-divider text-[11px] text-brand-secondary flex justify-between">
            <span>Dine-In: 73%</span>
            <span>Takeout: 18%</span>
            <span>Delivery: 9%</span>
          </div>
        </div>

        {/* Realized Recipe COGS */}
        <div className="rounded-card bg-white p-5 border border-divider shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Recipe COGS (Food Cost)
            </p>
            <div className="rounded-xl bg-brand-accent/10 p-2 text-brand-accent">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="font-header text-2xl font-bold text-brand-primary">
            ETB {kpis.realizedCogs.toLocaleString()}
          </p>
          <div className="pt-2 border-t border-divider text-[11px] flex justify-between font-semibold">
            <span className="text-brand-secondary">Target: 28-35%</span>
            <span className="text-status-free font-bold">{kpis.foodCostPercent}% Actual</span>
          </div>
        </div>

        {/* Total OPEX */}
        <div className="rounded-card bg-white p-5 border border-divider shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Operational Overhead (OPEX)
            </p>
            <div className="rounded-xl bg-status-occupied-bg p-2 text-status-occupied">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="font-header text-2xl font-bold text-status-occupied">
            ETB {kpis.totalOpex.toLocaleString()}
          </p>
          <div className="pt-2 border-t border-divider text-[11px] text-brand-secondary flex justify-between">
            <span>Rent + Salaries + Utilities</span>
          </div>
        </div>

        {/* Real Net Profit */}
        <div className="rounded-card bg-brand-primary text-white p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase text-white/80">
              Real Net Profit
            </p>
            <div className="rounded-xl bg-white/10 p-2 text-status-free">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="font-header text-2xl font-bold text-white">
            ETB {kpis.netProfit.toLocaleString()}
          </p>
          <div className="pt-2 border-t border-white/10 text-[11px] text-white/80 flex justify-between font-semibold">
            <span>After COGS &amp; OPEX</span>
            <span className="text-status-free font-bold">+{kpis.netMarginPercent}% Margin</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-divider pb-2">
        <button
          onClick={() => setActiveTab("opex")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-button text-xs font-bold transition",
            activeTab === "opex"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-white text-brand-secondary border border-divider hover:text-brand-primary hover:bg-bg-subtle"
          )}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Operational Expenses Log (OPEX)</span>
          <span className="rounded-pill bg-white/20 px-1.5 py-0.2 text-[10px]">
            {expenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("menu")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-button text-xs font-bold transition",
            activeTab === "menu"
              ? "bg-brand-primary text-white shadow-xs"
              : "bg-white text-brand-secondary border border-divider hover:text-brand-primary hover:bg-bg-subtle"
          )}
        >
          <Star className="h-3.5 w-3.5 text-status-occupied" />
          <span>Menu Engineering Profit Matrix</span>
          <span className="rounded-pill bg-bg-card px-1.5 py-0.2 text-[10px] text-brand-secondary">
            {menuMatrix.length}
          </span>
        </button>
      </div>

      {/* TAB 1: OPEX Table */}
      {activeTab === "opex" && (
        <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-3 border-b border-divider">
            {/* Category Filter */}
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
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 rounded-button bg-brand-accent px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-accentHover transition"
            >
              <Plus className="h-4 w-4" />
              <span>Log Expense</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-divider text-brand-secondary uppercase font-semibold text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Expense Description</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Accounting Date</th>
                  <th className="pb-3">Amount (ETB)</th>
                  <th className="pb-3 pr-2 text-right">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {filteredExpenses.map((exp: MockExpenseItem) => (
                  <tr key={exp.id} className="hover:bg-bg-subtle/50 transition">
                    <td className="py-3.5 pl-2 font-bold text-brand-primary">
                      {exp.title}
                    </td>
                    <td className="py-3.5">
                      <span className="rounded-pill bg-bg-card px-2 py-0.5 text-[10px] font-bold text-brand-primary capitalize border border-divider">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 text-brand-secondary font-mono text-[11px]">
                      {exp.expenseDate}
                    </td>
                    <td className="py-3.5 font-bold font-header text-brand-heading">
                      ETB {exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 pr-2 text-right text-brand-secondary text-[11px]">
                      {exp.loggedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Menu Engineering Matrix */}
      {activeTab === "menu" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuMatrix.map((item: MenuEngineeringItem) => {
              const isStar = item.classification === "Star";
              const isPlowhorse = item.classification === "Plowhorse";
              const isPuzzle = item.classification === "Puzzle";
              const isDog = item.classification === "Dog";

              return (
                <div
                  key={item.id}
                  className="rounded-card bg-white p-5 border border-divider shadow-card space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={cn(
                          "rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase",
                          isStar && "bg-status-free-bg text-status-free border border-status-free/30",
                          isPlowhorse && "bg-status-occupied-bg text-status-occupied border border-status-occupied/30",
                          isPuzzle && "bg-status-reserved-bg text-status-reserved border border-status-reserved/30",
                          isDog && "bg-status-danger-bg text-status-danger border border-status-danger/30"
                        )}
                      >
                        {item.classification}
                      </span>
                      <h3 className="font-header text-base font-bold text-brand-heading mt-1.5">
                        {item.dishName}
                      </h3>
                      <p className="text-[10px] text-brand-secondary">{item.category}</p>
                    </div>

                    <div className="text-right">
                      <p className="font-header font-bold text-sm text-brand-primary">
                        ETB {item.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-brand-secondary font-semibold">
                        {item.salesCount} Orders
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-divider flex items-center justify-between text-xs font-semibold">
                    <span className="text-brand-secondary">Gross Food Margin:</span>
                    <span className="text-status-free font-bold font-header text-sm">
                      {item.grossMarginPercent}%
                    </span>
                  </div>

                  <div className="rounded-card bg-bg-subtle p-2.5 border border-divider/60 text-[11px] text-brand-secondary">
                    <strong className="text-brand-primary block mb-0.5">Recommendation:</strong>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-elevated border border-divider space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="font-header text-lg font-bold text-brand-heading">
                Log Operational Expense
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Expense Description:
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
                  <label className="font-semibold text-brand-primary block mb-1">
                    Expense Category:
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-semibold"
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
                  <label className="font-semibold text-brand-primary block mb-1">
                    Amount (ETB):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={expAmount}
                    onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Accounting Date:
                </label>
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
                  className="flex-1 rounded-button bg-bg-card py-2 text-xs font-semibold text-brand-primary border border-divider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-button bg-brand-accent py-2 text-xs font-bold text-white hover:bg-brand-accentHover transition"
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
