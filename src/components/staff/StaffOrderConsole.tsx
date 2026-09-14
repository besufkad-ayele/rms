"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, UtensilsCrossed } from "lucide-react";
import { MENU_CATEGORIES, MENU_ITEMS, MenuItemData } from "@/data/mockMenu";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { DishCard } from "@/components/menu/DishCard";
import { DishDetailModal } from "@/components/menu/DishDetailModal";
import { CartDrawer, CartItem } from "@/components/order/CartDrawer";
import { getMenuItemsAction } from "@/app/admin/menu/actions";
import {
  getActiveTableOrderAction,
  getTableByCodeAction,
  submitStaffOrderForTableAction,
} from "@/app/order/[tableCode]/actions";
import { ItemCustomization } from "@/types/order-customization";
import { formatETB } from "@/lib/utils";
import { ToastProvider, useToast } from "@/components/ui/Toast";

function customizationKey(customization?: ItemCustomization) {
  if (!customization) return "";
  return JSON.stringify(customization);
}

interface StaffOrderConsoleProps {
  tableCode: string;
  backHref: string;
  backLabel?: string;
}

function StaffOrderConsoleInner({
  tableCode,
  backHref,
  backLabel = "Back to floor",
}: StaffOrderConsoleProps) {
  const { toast } = useToast();
  const cleanCode = tableCode.trim().toUpperCase();

  const [tableLabel, setTableLabel] = useState(cleanCode);
  const [section, setSection] = useState("");
  const [hasOpenOrder, setHasOpenOrder] = useState(false);
  const [openOrderSummary, setOpenOrderSummary] = useState("");
  const [openOrderTotal, setOpenOrderTotal] = useState(0);

  const [liveMenuItems, setLiveMenuItems] = useState<MenuItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDish, setSelectedDish] = useState<MenuItemData | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerNote, setCustomerNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const [table, open, menu] = await Promise.all([
        getTableByCodeAction(cleanCode),
        getActiveTableOrderAction(cleanCode),
        getMenuItemsAction(),
      ]);
      if (cancelled) return;

      if (table) {
        setTableLabel(table.uniqueCode);
        setSection(table.section);
      }

      if (open) {
        setHasOpenOrder(true);
        setOpenOrderTotal(open.foodSubtotal || 0);
        setOpenOrderSummary(
          open.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")
        );
      }

      if (menu && menu.length > 0) {
        setLiveMenuItems(
          menu.map((d) => ({
            id: d.id,
            name: d.name,
            amharicName: d.amharic_name,
            category: (d.category.toLowerCase() as MenuItemData["category"]) || "mains",
            description: d.description || "",
            price: d.price,
            photoUrl:
              d.image_url ||
              "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
            isAvailable: d.is_available,
            status: d.is_available ? "available" : "sold_out",
            isSpicy: d.is_spicy,
            preparationMinutes: 15,
            ingredients: [],
          }))
        );
      } else {
        setLiveMenuItems(MENU_ITEMS);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, [cleanCode]);

  const filteredDishes = useMemo(() => {
    const list = liveMenuItems.length > 0 ? liveMenuItems : MENU_ITEMS;
    return list.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          (item.amharicName || "").toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [liveMenuItems, selectedCategory, searchQuery]);

  const cartQtyById = useMemo(() => {
    const map: Record<string, number> = {};
    cartItems.forEach((ci) => {
      map[ci.item.id] = (map[ci.item.id] || 0) + ci.quantity;
    });
    return map;
  }, [cartItems]);

  const handleAddToCart = (item: MenuItemData) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (ci) => ci.item.id === item.id && customizationKey(ci.customization) === ""
      );
      if (existing) {
        return prev.map((ci) =>
          ci.cartId === existing.cartId ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [
        ...prev,
        {
          cartId: `${item.id}-${Date.now()}`,
          item,
          quantity: 1,
          lineUnitPrice: item.price,
        },
      ];
    });
  };

  const handleDetailAddToCart = (
    item: MenuItemData,
    customization?: ItemCustomization,
    lineTotal?: number
  ) => {
    const unitPrice = lineTotal ?? item.price;
    const key = customizationKey(customization);
    setCartItems((prev) => {
      const existing = prev.find(
        (ci) => ci.item.id === item.id && customizationKey(ci.customization) === key
      );
      if (existing) {
        return prev.map((ci) =>
          ci.cartId === existing.cartId ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [
        ...prev,
        {
          cartId: `${item.id}-${Date.now()}`,
          item,
          quantity: 1,
          lineUnitPrice: unitPrice,
          customization,
        },
      ];
    });
    setSelectedDish(null);
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCartItems(
      (prev) =>
        prev
          .map((ci) => {
            if (ci.cartId !== cartId) return ci;
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
          })
          .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (cartId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.cartId !== cartId));
  };

  const handleUpdateCustomization = (
    cartId: string,
    customization: ItemCustomization,
    lineUnitPrice: number
  ) => {
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.cartId === cartId ? { ...ci, customization, lineUnitPrice } : ci
      )
    );
  };

  const handleDishCardRemove = (itemId: string) => {
    setCartItems((prev) => {
      const idx = [...prev].reverse().findIndex((ci) => ci.item.id === itemId);
      if (idx < 0) return prev;
      const realIdx = prev.length - 1 - idx;
      const target = prev[realIdx];
      if (target.quantity <= 1) return prev.filter((_, i) => i !== realIdx);
      return prev.map((ci, i) =>
        i === realIdx ? { ...ci, quantity: ci.quantity - 1 } : ci
      );
    });
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    const formattedItems = cartItems.map((ci) => ({
      menuItemId: ci.item.id,
      title: ci.item.name,
      price: ci.lineUnitPrice,
      quantity: ci.quantity,
      customization: ci.customization,
    }));

    const res = await submitStaffOrderForTableAction(
      cleanCode,
      formattedItems,
      customerNote.trim() || undefined
    );
    setIsSubmitting(false);

    if (!res.success) {
      toast({
        title: "Could not place order",
        description: res.message || "Please try again.",
        type: "error",
      });
      return;
    }

    setCartItems([]);
    setCustomerNote("");
    setHasOpenOrder(true);
    if (typeof res.totalAmount === "number") setOpenOrderTotal(res.totalAmount);
    setOpenOrderSummary(
      formattedItems.map((i) => `${i.quantity}× ${i.title}`).join(", ")
    );

    toast({
      title: res.appended ? "Items added to ticket" : "Order sent to kitchen",
      description: res.message || `Table ${tableLabel} · ${res.orderNumber}`,
      type: "success",
    });
  };

  return (
    <div className="space-y-5 pb-36">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-secondary hover:text-brand-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-header text-xl font-bold text-brand-heading">
                Order · Table {tableLabel}
              </h1>
              <p className="text-xs text-brand-secondary">
                {section || "Dining floor"} · Staff-initiated ticket
              </p>
            </div>
          </div>
        </div>

        {hasOpenOrder && (
          <div className="rounded-card border border-status-occupied/30 bg-status-occupied/5 px-4 py-3 max-w-md">
            <p className="text-[10px] font-bold uppercase text-status-occupied">Open ticket</p>
            <p className="text-xs text-brand-secondary line-clamp-2 mt-0.5">
              {openOrderSummary || "Active order on this table"}
            </p>
            <p className="font-header text-sm font-bold mt-1">
              ETB {openOrderTotal.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-card border border-divider bg-white p-4 shadow-card space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu…"
            className="w-full pl-9 pr-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs"
          />
        </div>
        <CategoryTabs
          categories={MENU_CATEGORIES}
          activeId={selectedCategory}
          onChange={setSelectedCategory}
        />
        <div>
          <label className="text-[10px] font-bold uppercase text-brand-secondary">
            Table / kitchen note (optional)
          </label>
          <input
            type="text"
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="e.g. Allergic to peanuts · rush for guests"
            className="w-full mt-1 px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredDishes.map((item) => (
          <DishCard
            key={item.id}
            item={item}
            quantity={cartQtyById[item.id] || 0}
            onAdd={handleAddToCart}
            onRemove={(dish) => handleDishCardRemove(dish.id)}
            onSelect={setSelectedDish}
            layout="grid"
          />
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <div className="rounded-card border border-dashed border-divider bg-white p-8 text-center text-xs text-brand-secondary">
          No dishes match this filter.
        </div>
      )}

      <DishDetailModal
        item={selectedDish}
        isOpen={!!selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToCart={handleDetailAddToCart}
        isOrderMode
      />

      <CartDrawer
        items={cartItems}
        tableCode={tableLabel}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onUpdateCustomization={handleUpdateCustomization}
        onPlaceOrder={handlePlaceOrder}
        isSubmitting={isSubmitting}
      />

      {cartItems.length === 0 && hasOpenOrder && (
        <p className="text-center text-[11px] text-brand-secondary">
          Add dishes above to append to the open ticket · current bill{" "}
          <strong>{formatETB(openOrderTotal)}</strong>
        </p>
      )}
    </div>
  );
}

export function StaffOrderConsole(props: StaffOrderConsoleProps) {
  return (
    <ToastProvider>
      <StaffOrderConsoleInner {...props} />
    </ToastProvider>
  );
}
