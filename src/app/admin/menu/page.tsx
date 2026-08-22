"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  UtensilsCrossed,
  X,
  Flame,
  DollarSign,
} from "lucide-react";
import { MENU_ITEMS, MenuItemData } from "@/data/mockMenu";
import {
  getMenuItemsAction,
  createMenuItemAction,
  updateMenuItemAction,
  deleteMenuItemAction,
  DBMenuItem,
} from "./actions";

export default function AdminMenuPage() {
  const [isPending, startTransition] = useTransition();
  const [menuItems, setMenuItems] = useState<DBMenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<DBMenuItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    const data = await getMenuItemsAction();
    setMenuItems(data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchCat = activeCategory === "all" || item.category === activeCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.amharic_name && item.amharic_name.includes(searchQuery)) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createMenuItemAction(formData);
      if (res.success && res.item) {
        setMenuItems((prev) => [res.item, ...prev]);
        setShowAddModal(false);
        form.reset();
        showToast("New dish added to menu successfully!");
      }
    });
  };

  const handleToggleAvailability = (item: DBMenuItem) => {
    const nextState = !item.is_available;
    startTransition(async () => {
      await updateMenuItemAction(item.id, { is_available: nextState });
      setMenuItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, is_available: nextState } : m))
      );
      showToast(`${item.name} is now ${nextState ? "Available" : "86'd (Unavailable)"}`);
    });
  };

  const handleDeleteItem = (item: DBMenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) return;
    startTransition(async () => {
      await deleteMenuItemAction(item.id);
      setMenuItems((prev) => prev.filter((m) => m.id !== item.id));
      showToast(`Deleted ${item.name} from menu.`);
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-card bg-brand-primary px-4 py-3 text-white shadow-elevated transition-all animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-status-free shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-divider pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-accent">
              <BookOpen className="h-3.5 w-3.5" />
              Menu &amp; Culinary Catalog
            </span>
          </div>
          <h1 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
            Menu Items &amp; Recipe Management ({menuItems.length} Dishes)
          </h1>
          <p className="font-sans text-xs text-brand-secondary mt-0.5">
            Manage culinary offerings, prices, Amharic translations, dietary tags, and 86 availability.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-button bg-brand-accent px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-accentHover transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-card bg-white p-4 border border-divider shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {["all", "mains", "starters", "desserts", "beverages"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-button text-xs font-bold capitalize transition cursor-pointer ${
                activeCategory === cat
                  ? "bg-brand-primary text-white shadow-xs"
                  : "bg-bg-subtle text-brand-secondary hover:bg-bg-card hover:text-brand-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-secondary" />
          <input
            type="text"
            placeholder="Search dish name, Amharic title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary placeholder:text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-accent"
          />
        </div>
      </div>

      {/* Dishes Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-card border bg-white p-4 shadow-card space-y-3 relative flex flex-col justify-between transition ${
              !item.is_available ? "opacity-60 border-divider" : "border-divider hover:border-brand-accent"
            }`}
          >
            <div>
              <div className="h-44 w-full rounded-card overflow-hidden bg-bg-subtle relative mb-3">
                <img
                  src={item.image_url || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-pill bg-brand-primary/80 text-white font-bold text-[10px] uppercase backdrop-blur-xs">
                  {item.category}
                </span>
                {item.is_spicy && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-pill bg-status-danger text-white font-bold text-[10px] flex items-center gap-1">
                    <Flame className="h-3 w-3" /> Spicy
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-header text-base font-bold text-brand-heading flex items-center justify-between">
                  <span>{item.name}</span>
                  <span className="font-mono text-brand-accent text-sm">{item.price} ETB</span>
                </h3>
                {item.amharic_name && (
                  <p className="font-zibriqriq text-xs font-bold text-brand-accent mt-0.5">
                    {item.amharic_name}
                  </p>
                )}
                <p className="text-xs text-brand-secondary line-clamp-2 mt-1">
                  {item.description || "Highland Ethiopian dish prepared with traditional spices."}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-divider flex items-center justify-between gap-2 mt-3">
              <button
                onClick={() => handleToggleAvailability(item)}
                className={`px-2.5 py-1 rounded-button text-[11px] font-bold transition ${
                  item.is_available
                    ? "bg-status-free-bg text-status-free border border-status-free/20"
                    : "bg-status-danger-bg text-status-danger border border-status-danger/20"
                }`}
              >
                {item.is_available ? "In Stock (Available)" : "86'd (Unavailable)"}
              </button>

              <button
                onClick={() => handleDeleteItem(item)}
                className="p-1 rounded-button text-brand-secondary hover:text-status-danger hover:bg-status-danger-bg"
                title="Delete Dish"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Dish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-elevated border border-divider space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <h3 className="font-header text-lg font-bold text-brand-heading">
                Add New Dish to Menu
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-button text-brand-secondary hover:bg-bg-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-brand-primary block mb-1">English Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Sizzling Beef Tibs"
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                />
              </div>

              <div>
                <label className="font-bold text-brand-primary block mb-1">Amharic Title (የምግብ ስም)</label>
                <input
                  name="amharic_name"
                  placeholder="e.g. ልዩ የተጠበሰ ጥብስ"
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary font-zibriqriq font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-brand-primary block mb-1">Category *</label>
                  <select
                    name="category"
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary capitalize"
                  >
                    <option value="mains">Mains</option>
                    <option value="starters">Starters</option>
                    <option value="desserts">Desserts</option>
                    <option value="beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-brand-primary block mb-1">Price (ETB) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    placeholder="e.g. 580"
                    className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-brand-primary block mb-1">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Culinary notes and ingredient details..."
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                />
              </div>

              <div>
                <label className="font-bold text-brand-primary block mb-1">Photo Image URL</label>
                <input
                  name="image_url"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-button border border-divider bg-bg-subtle p-2 text-xs text-brand-primary"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input type="checkbox" name="is_spicy" className="rounded" />
                <span className="font-semibold text-brand-primary">Spicy Dish (Contains Berbere/Awaze)</span>
              </label>

              <div className="flex items-center gap-2 pt-3 border-t border-divider">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-button bg-bg-card py-2 text-xs font-semibold text-brand-primary border border-divider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-button bg-brand-accent py-2 text-xs font-bold text-white hover:bg-brand-accentHover transition"
                >
                  {isPending ? "Saving..." : "Save Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
