"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  DollarSign,
  Layers,
  UtensilsCrossed,
  FileSpreadsheet,
  X,
  ChevronRight,
  TrendingUp,
  Scale,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getInventoryData,
  addIngredientAction,
  restockIngredientAction,
  submitStockAuditAction,
  MockIngredientItem,
  MockRecipeData,
  MockReconciliationAudit,
} from "./actions";

export default function InventoryManagementPage() {
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"stock" | "recipes" | "audit">("stock");

  const [ingredients, setIngredients] = useState<MockIngredientItem[]>([]);
  const [recipes, setRecipes] = useState<MockRecipeData[]>([]);
  const [audits, setAudits] = useState<MockReconciliationAudit[]>([]);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showRestockModal, setShowRestockModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);

  const [selectedRestockItem, setSelectedRestockItem] = useState<MockIngredientItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // New Ingredient Form State
  const [newIngName, setNewIngName] = useState<string>("");
  const [newIngCategory, setNewIngCategory] = useState<MockIngredientItem["category"]>("Meat & Poultry");
  const [newIngUnit, setNewIngUnit] = useState<MockIngredientItem["unit"]>("kg");
  const [newIngStock, setNewIngStock] = useState<number>(10);
  const [newIngThreshold, setNewIngThreshold] = useState<number>(5);
  const [newIngCost, setNewIngCost] = useState<number>(350);

  // Audit Form State
  const [auditIngredientId, setAuditIngredientId] = useState<string>("");
  const [auditPhysicalCount, setAuditPhysicalCount] = useState<number>(0);
  const [auditReason, setAuditReason] = useState<MockReconciliationAudit["reason"]>("portioning_error");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    const data = await getInventoryData();
    setIngredients(data.ingredients);
    setRecipes(data.recipes);
    setAudits(data.audits);
    if (data.ingredients.length > 0 && !auditIngredientId) {
      setAuditIngredientId(data.ingredients[0].id);
      setAuditPhysicalCount(data.ingredients[0].stockQty);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Ingredients
  const filteredIngredients = ingredients.filter((ing) => {
    const matchCategory = categoryFilter === "all" || ing.category === categoryFilter;
    const matchSearch =
      searchQuery === "" ||
      ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Calculate High-level Valuation & Metrics
  const totalValuation = ingredients.reduce((sum, i) => sum + i.stockQty * i.costPerUnit, 0);
  const lowStockCount = ingredients.filter((i) => i.stockQty <= i.lowStockThreshold).length;
  const avgFoodCostPercent =
    recipes.length > 0
      ? (recipes.reduce((sum, r) => sum + r.foodCostMarginPercent, 0) / recipes.length).toFixed(1)
      : "32.0";

  const handleRestockSubmit = () => {
    if (!selectedRestockItem) return;
    startTransition(async () => {
      const res = await restockIngredientAction(selectedRestockItem.id, restockAmount);
      if (res.success) {
        setIngredients(res.ingredients);
        setShowRestockModal(false);
        showToast(`Replenished +${restockAmount} ${selectedRestockItem.unit} of ${selectedRestockItem.name}`);
        loadData();
      }
    });
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await addIngredientAction({
        name: newIngName,
        category: newIngCategory,
        unit: newIngUnit,
        stockQty: newIngStock,
        lowStockThreshold: newIngThreshold,
        costPerUnit: newIngCost,
      });

      if (res.success) {
        setShowAddModal(false);
        setNewIngName("");
        showToast(`Ingredient ${res.ingredient.name} created!`);
        loadData();
      }
    });
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitStockAuditAction({
        ingredientId: auditIngredientId,
        physicalCount: auditPhysicalCount,
        reason: auditReason,
      });

      if (res.success) {
        setShowAuditModal(false);
        showToast(`Physical audit recorded. Stock reconciled!`);
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
              <Package className="h-3 w-3" />
              Module 02: Stock &amp; Recipes
            </span>
            <span className="text-[12px] text-brand-secondary">
              • Auto-deduction BOM &amp; Periodic Variance Reconciliation
            </span>
          </div>
          <h1 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
            Inventory Control &amp; Recipe BOM Engine
          </h1>
          <p className="font-sans text-xs text-brand-secondary mt-0.5">
            Atomic ingredient reductions on order placement, real-time COGS calculations, and physical audit reconciliation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-button bg-brand-accent px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-accentHover transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Raw Ingredient</span>
          </button>

          <button
            onClick={() => setShowAuditModal(true)}
            className="flex items-center gap-2 rounded-button bg-white px-3.5 py-2 text-xs font-bold text-brand-primary border border-divider shadow-sm hover:bg-bg-active transition"
          >
            <Scale className="h-4 w-4 text-brand-accent" />
            <span>Perform Audit</span>
          </button>
        </div>
      </div>

      {/* 4 Inventory Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Total Stock Valuation
            </p>
            <p className="font-header text-xl font-bold text-brand-heading mt-1">
              ETB {Math.round(totalValuation).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-status-free-bg p-2.5 text-status-free">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Low Stock Warnings
            </p>
            <p className="font-header text-xl font-bold text-status-danger mt-1">
              {lowStockCount} Items Low
            </p>
          </div>
          <div className="rounded-xl bg-status-danger-bg p-2.5 text-status-danger">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Avg Food Cost Margin
            </p>
            <p className="font-header text-xl font-bold text-status-free mt-1">
              {avgFoodCostPercent}%
            </p>
          </div>
          <div className="rounded-xl bg-bg-card p-2.5 text-brand-primary">
            <TrendingUp className="h-5 w-5 text-brand-accent" />
          </div>
        </div>

        <div className="rounded-card bg-white p-4 border border-divider shadow-card flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-brand-secondary">
              Active Recipe BOMs
            </p>
            <p className="font-header text-xl font-bold text-brand-primary mt-1">
              {recipes.length} Dishes
            </p>
          </div>
          <div className="rounded-xl bg-bg-subtle p-2.5 text-brand-secondary">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Module Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-divider pb-2">
        {[
          { id: "stock", label: "Live Ingredients & Stock", icon: Package, count: ingredients.length },
          { id: "recipes", label: "Recipe Bill of Materials (BOM)", icon: UtensilsCrossed, count: recipes.length },
          { id: "audit", label: "Stock Reconciliation & Audit", icon: Scale, count: audits.length },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-button text-xs font-bold transition",
                activeTab === tab.id
                  ? "bg-brand-primary text-white shadow-xs"
                  : "bg-white text-brand-secondary border border-divider hover:text-brand-primary hover:bg-bg-subtle"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-pill px-1.5 py-0.2 text-[10px]",
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-bg-card text-brand-secondary"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Live Ingredients & Stock */}
      {activeTab === "stock" && (
        <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-3 border-b border-divider">
            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All Categories" },
                { id: "Meat & Poultry", label: "Meat & Poultry" },
                { id: "Dairy & Fats", label: "Dairy & Fats" },
                { id: "Spices & Grains", label: "Spices & Grains" },
                { id: "Beverages & Honey", label: "Beverages & Honey" },
                { id: "Produce & Veggies", label: "Produce" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={cn(
                    "rounded-pill px-3 py-1 text-xs font-semibold transition",
                    categoryFilter === cat.id
                      ? "bg-brand-primary text-white"
                      : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-secondary" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary placeholder:text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-divider text-brand-secondary uppercase font-semibold text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Ingredient</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Unit</th>
                  <th className="pb-3">Stock Balance</th>
                  <th className="pb-3">Threshold</th>
                  <th className="pb-3">Cost / Unit</th>
                  <th className="pb-3">Total Value</th>
                  <th className="pb-3">Last Restocked</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {filteredIngredients.map((ing) => {
                  const isLow = ing.stockQty <= ing.lowStockThreshold;
                  return (
                    <tr key={ing.id} className="hover:bg-bg-subtle/50 transition">
                      <td className="py-3.5 pl-2 font-bold text-brand-primary">
                        <div className="flex items-center gap-2">
                          <span>{ing.name}</span>
                          {isLow && (
                            <span className="rounded-pill bg-status-danger-bg px-1.5 py-0.5 text-[9px] font-bold text-status-danger border border-status-danger/30">
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 text-brand-secondary font-medium">
                        {ing.category}
                      </td>

                      <td className="py-3.5 font-mono text-brand-primary uppercase text-[11px]">
                        {ing.unit}
                      </td>

                      <td className="py-3.5">
                        <span
                          className={cn(
                            "font-bold",
                            isLow ? "text-status-danger" : "text-status-free"
                          )}
                        >
                          {ing.stockQty} {ing.unit}
                        </span>
                      </td>

                      <td className="py-3.5 text-brand-secondary">
                        {ing.lowStockThreshold} {ing.unit}
                      </td>

                      <td className="py-3.5 font-semibold text-brand-primary">
                        ETB {ing.costPerUnit.toFixed(2)}
                      </td>

                      <td className="py-3.5 font-bold text-brand-heading">
                        ETB {Math.round(ing.stockQty * ing.costPerUnit).toLocaleString()}
                      </td>

                      <td className="py-3.5 text-brand-secondary text-[11px]">
                        {ing.lastRestocked}
                      </td>

                      <td className="py-3.5 pr-2 text-right">
                        <button
                          onClick={() => {
                            setSelectedRestockItem(ing);
                            setRestockAmount(10);
                            setShowRestockModal(true);
                          }}
                          className="rounded-button bg-bg-card px-2.5 py-1 text-[11px] font-bold text-brand-accent border border-divider hover:bg-bg-active transition"
                        >
                          Restock +
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Recipe Bill of Materials (BOM) */}
      {activeTab === "recipes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((rcp) => (
              <div
                key={rcp.id}
                className="rounded-card bg-white p-5 border border-divider shadow-card space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-pill bg-bg-card px-2 py-0.5 text-[10px] font-bold text-brand-primary border border-divider">
                      {rcp.category}
                    </span>
                    <h3 className="font-header text-base font-bold text-brand-heading mt-1">
                      {rcp.dishName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <p className="font-header text-base font-bold text-brand-primary">
                      ETB {rcp.sellingPrice.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-status-free font-bold">
                      {rcp.foodCostMarginPercent}% Food Cost
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-divider">
                  <p className="text-[11px] font-semibold uppercase text-brand-secondary mb-2">
                    Ingredient Breakdown (Per Serving):
                  </p>
                  <div className="space-y-1.5 text-xs">
                    {rcp.ingredients.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-button bg-bg-subtle p-2 border border-divider/60 text-[11px]"
                      >
                        <span className="font-semibold text-brand-primary">
                          {item.name} ({item.qty} {item.unit})
                        </span>
                        <span className="font-mono text-brand-secondary font-medium">
                          ETB {item.costContribution.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-divider flex items-center justify-between text-xs">
                  <span className="text-brand-secondary">
                    Total Recipe COGS: <strong className="text-brand-primary font-bold">ETB {rcp.calculatedCogs.toFixed(2)}</strong>
                  </span>
                  <span className="text-status-free font-bold">
                    Gross Margin: ETB {(rcp.sellingPrice - rcp.calculatedCogs).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Periodic Stock Reconciliation & Audit */}
      {activeTab === "audit" && (
        <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-divider pb-4">
            <div>
              <h3 className="font-header text-base font-bold text-brand-heading">
                Physical Inventory Audit Log &amp; Discrepancy Tracking
              </h3>
              <p className="font-sans text-xs text-brand-secondary mt-0.5">
                Compare physical shelf counts against recipe-deducted theoretical stock to detect kitchen waste, over-portioning, or unrecorded use.
              </p>
            </div>
            <button
              onClick={() => setShowAuditModal(true)}
              className="flex items-center gap-1.5 rounded-button bg-brand-accent px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-brand-accentHover transition"
            >
              <Plus className="h-4 w-4" />
              <span>Log Count</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-divider text-brand-secondary uppercase font-semibold text-[10px] tracking-wider">
                  <th className="pb-3 pl-2">Ingredient</th>
                  <th className="pb-3">Audit Date</th>
                  <th className="pb-3">Expected Stock</th>
                  <th className="pb-3">Physical Count</th>
                  <th className="pb-3">Variance</th>
                  <th className="pb-3">Loss Amount</th>
                  <th className="pb-3">Cause / Reason</th>
                  <th className="pb-3 pr-2 text-right">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {audits.map((aud) => (
                  <tr key={aud.id} className="hover:bg-bg-subtle/50 transition">
                    <td className="py-3.5 pl-2 font-bold text-brand-primary">
                      {aud.ingredientName}
                    </td>
                    <td className="py-3.5 text-brand-secondary">
                      {aud.auditDate}
                    </td>
                    <td className="py-3.5 font-semibold text-brand-primary">
                      {aud.expectedStock} {aud.unit}
                    </td>
                    <td className="py-3.5 font-bold text-brand-heading">
                      {aud.physicalCount} {aud.unit}
                    </td>
                    <td className="py-3.5 font-bold">
                      <span
                        className={cn(
                          aud.variance < 0 ? "text-status-danger" : "text-status-free"
                        )}
                      >
                        {aud.variance > 0 ? `+${aud.variance}` : aud.variance} {aud.unit}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-status-danger">
                      {aud.lossAmountETB > 0 ? `ETB ${aud.lossAmountETB.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-3.5">
                      <span className="rounded-pill bg-bg-card px-2 py-0.5 text-[10px] font-bold text-brand-primary capitalize border border-divider">
                        {aud.reason?.replace("_", " ") || "Portioning Variance"}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right text-brand-secondary text-[11px]">
                      {aud.loggedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Add Raw Ingredient */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-elevated border border-divider space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="font-header text-lg font-bold text-brand-heading">
                Add Raw Ingredient
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddIngredient} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Ingredient Name:
                </label>
                <input
                  type="text"
                  required
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  placeholder="e.g. Cardamom Pods"
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-brand-primary block mb-1">
                    Category:
                  </label>
                  <select
                    value={newIngCategory}
                    onChange={(e) => setNewIngCategory(e.target.value as any)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                  >
                    <option value="Meat & Poultry">Meat &amp; Poultry</option>
                    <option value="Dairy & Fats">Dairy &amp; Fats</option>
                    <option value="Spices & Grains">Spices &amp; Grains</option>
                    <option value="Beverages & Honey">Beverages &amp; Honey</option>
                    <option value="Produce & Veggies">Produce &amp; Veggies</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-brand-primary block mb-1">
                    Measurement Unit:
                  </label>
                  <select
                    value={newIngUnit}
                    onChange={(e) => setNewIngUnit(e.target.value as any)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="gram">gram</option>
                    <option value="liter">liter</option>
                    <option value="ml">ml (Milliliter)</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-brand-primary block mb-1">
                    Initial Stock:
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newIngStock}
                    onChange={(e) => setNewIngStock(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                  />
                </div>
                <div>
                  <label className="font-semibold text-brand-primary block mb-1">
                    Threshold:
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newIngThreshold}
                    onChange={(e) => setNewIngThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                  />
                </div>
                <div>
                  <label className="font-semibold text-brand-primary block mb-1">
                    Cost / Unit (ETB):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newIngCost}
                    onChange={(e) => setNewIngCost(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                  />
                </div>
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
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Quick Restock */}
      {showRestockModal && selectedRestockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-elevated border border-divider space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="font-header text-lg font-bold text-brand-heading">
                Restock Ingredient
              </h3>
              <button
                onClick={() => setShowRestockModal(false)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-brand-primary">
                Item: <strong>{selectedRestockItem.name}</strong> ({selectedRestockItem.category})
              </p>
              <p className="text-brand-secondary">
                Current Balance: <strong>{selectedRestockItem.stockQty} {selectedRestockItem.unit}</strong>
              </p>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Add Quantity ({selectedRestockItem.unit}):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowRestockModal(false)}
                className="flex-1 rounded-button bg-bg-card py-2 text-xs font-semibold text-brand-primary border border-divider"
              >
                Cancel
              </button>
              <button
                onClick={handleRestockSubmit}
                className="flex-1 rounded-button bg-status-free py-2 text-xs font-bold text-white hover:opacity-90 transition"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Log Physical Count Audit */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-elevated border border-divider space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="font-header text-lg font-bold text-brand-heading">
                Physical Inventory Audit Count
              </h3>
              <button
                onClick={() => setShowAuditModal(false)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAuditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Select Ingredient:
                </label>
                <select
                  value={auditIngredientId}
                  onChange={(e) => {
                    setAuditIngredientId(e.target.value);
                    const target = ingredients.find((i) => i.id === e.target.value);
                    if (target) setAuditPhysicalCount(target.stockQty);
                  }}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-semibold"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} (Theoretical: {ing.stockQty} {ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Actual Physical Count:
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={auditPhysicalCount}
                  onChange={(e) => setAuditPhysicalCount(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-brand-primary block mb-1">
                  Variance Reason (if count differs):
                </label>
                <select
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value as any)}
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                >
                  <option value="portioning_error">Kitchen Over-Portioning</option>
                  <option value="kitchen_waste">Food Prep Spoilage / Trimming Waste</option>
                  <option value="unrecorded_use">Unrecorded Staff Meal / Tasting</option>
                  <option value="spoilage">Storage Spoilage</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="flex-1 rounded-button bg-bg-card py-2 text-xs font-semibold text-brand-primary border border-divider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-button bg-brand-accent py-2 text-xs font-bold text-white hover:bg-brand-accentHover transition"
                >
                  Reconcile Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
