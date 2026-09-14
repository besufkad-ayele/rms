"use client";

import React, { useState, useMemo, useEffect, use } from "react";
import Link from "next/link";
import {
  Search,
  ArrowLeft,
  X,
  UserCheck,
} from "lucide-react";
import {
  MENU_ITEMS,
  MENU_CATEGORIES,
  getTableDetails,
  MenuItemData,
} from "@/data/mockMenu";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { DishCard } from "@/components/menu/DishCard";
import { DishDetailModal } from "@/components/menu/DishDetailModal";
import { CartDrawer, CartItem } from "@/components/order/CartDrawer";
import { GuestPaymentPanel } from "@/components/order/GuestPaymentPanel";
import { OrderStatusStepper, FlowOrderStatus } from "@/components/order/OrderStatusStepper";
import {
  submitOrderAction,
  submitPaymentAction,
  submitFeedbackAction,
  getOrderStatusAction,
  getTableByCodeAction,
  getActiveTableOrderAction,
  GuestActiveOrder,
} from "./actions";
import { formatKitchenNotes } from "@/lib/kitchen-notes";
import { ItemCustomization } from "@/types/order-customization";
import { getMenuItemsAction } from "@/app/admin/menu/actions";
import { RatingStep } from "@/components/order/RatingStep";
import { ActiveOrderBanner } from "@/components/order/ActiveOrderBanner";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { computeBill, formatETB } from "@/lib/utils";
import { useOfflineSync } from "@/context/OfflineSyncContext";

interface PageProps {
  params: Promise<{ tableCode: string }>;
}

function toCartItems(order: GuestActiveOrder): CartItem[] {
  return order.items.map((it, index) => ({
    cartId: `${it.menuItemId}-${index}`,
    item: {
      id: it.menuItemId,
      name: it.name,
      category: "mains",
      description: "",
      price: it.price,
      photoUrl: it.photoUrl || "",
      isAvailable: true,
      status: "available" as const,
      preparationMinutes: 15,
      ingredients: [],
    },
    quantity: it.quantity,
    lineUnitPrice: it.price,
  }));
}

function customizationKey(customization?: ItemCustomization) {
  if (!customization) return "";
  return JSON.stringify(customization);
}

function cartLineSubtotal(ci: CartItem) {
  return ci.lineUnitPrice * ci.quantity;
}

function OrderFlowContent({ tableCode }: { tableCode: string }) {
  const { toast } = useToast();
  const { enqueueAndSyncIfOnline, isOnline } = useOfflineSync();
  const [table, setTable] = useState(() => getTableDetails(tableCode));

  useEffect(() => {
    async function loadLiveTable() {
      try {
        const live = await getTableByCodeAction(tableCode);
        if (live) {
          setTable({
            code: live.uniqueCode,
            displayNumber: live.tableNumber,
            capacity: live.capacity,
            section: live.section,
            serverName: live.serverName,
          });
        }
      } catch (e) {
        console.error("Error loading live table info:", e);
      }
    }
    loadLiveTable();
  }, [tableCode]);

  const applyOpenOrder = (open: GuestActiveOrder) => {
    setActiveOrderId(open.orderId);
    setOrderNum(open.orderNumber);
    setPlacedOrderItems(toCartItems(open));
    setHasOpenOrder(true);
    setHasPendingPayment(!!open.hasPendingPayment);
    setOpenOrderSubtotal(open.foodSubtotal);
    if (
      open.status === "placed" ||
      open.status === "preparing" ||
      open.status === "ready" ||
      open.status === "served"
    ) {
      setOrderStatus(open.status);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function restoreOpenOrder() {
      const open = await getActiveTableOrderAction(tableCode);
      if (cancelled || !open) return;
      applyOpenOrder(open);
      setFlowStage((current) => (current === "feedback" ? current : "browsing"));
    }
    restoreOpenOrder();
    return () => {
      cancelled = true;
    };
  }, [tableCode]);

  const [flowStage, setFlowStage] = useState<
    "browsing" | "order_placed" | "payment" | "feedback"
  >("browsing");
  const [orderStatus, setOrderStatus] = useState<FlowOrderStatus>("placed");
  const [hasOpenOrder, setHasOpenOrder] = useState(false);
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [openOrderSubtotal, setOpenOrderSubtotal] = useState(0);

  // Menu filtering & search
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [selectedDish, setSelectedDish] = useState<MenuItemData | null>(null);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Placed Order Details
  const [placedOrderItems, setPlacedOrderItems] = useState<CartItem[]>([]);
  const [orderNum, setOrderNum] = useState<string>("");
  const [customerNote, setCustomerNote] = useState<string>("");
  const [activeOrderId, setActiveOrderId] = useState<string>("");

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
    toast({
      title: `Added ${item.name}`,
      description: `${formatETB(item.price)} added to Table ${table.displayNumber} order`,
      type: "success",
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
    toast({
      title: `Added ${item.name}`,
      description: `${formatETB(unitPrice)} added to Table ${table.displayNumber} order`,
      type: "success",
    });
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCartItems((prev) =>
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

  // Place Order Action (Database & Offline Integration)
  const handlePlaceOrder = async () => {
    setIsSubmittingOrder(true);
    setPlacedOrderItems([...cartItems]);

    const formattedItems = cartItems.map((ci) => ({
      menuItemId: ci.item.id,
      title: ci.item.name,
      price: ci.lineUnitPrice,
      quantity: ci.quantity,
      customization: ci.customization,
    }));

    if (isOnline) {
      try {
        const res = await submitOrderAction(tableCode, formattedItems, customerNote);
        if (res.success && res.orderId) {
          const open = await getActiveTableOrderAction(tableCode);
          if (open) applyOpenOrder(open);
          else {
            setActiveOrderId(res.orderId);
            setOrderNum(res.orderNumber || `#KD-${res.orderId.substring(0, 5).toUpperCase()}`);
            setHasOpenOrder(true);
            setOrderStatus("placed");
            if (typeof res.totalAmount === "number") setOpenOrderSubtotal(res.totalAmount);
          }
          await refreshOpenOrder();
          setCartItems([]);
          setFlowStage("order_placed");
          toast({
            title: res.appended ? "Added to your open order" : "Order sent to kitchen",
            description: `Order ${res.orderNumber} for Table ${table.displayNumber} stays open until the cashier clears it.`,
            type: "success",
          });
          setIsSubmittingOrder(false);
          return;
        }
      } catch (err) {
        console.warn("Direct order placement failed, falling back to offline queue:", err);
      }
    }

    const syncRes = await enqueueAndSyncIfOnline("CREATE_ORDER", {
      tableCode,
      items: formattedItems,
      customerNote,
    });

    setIsSubmittingOrder(false);

    if (syncRes.offlineQueued) {
      const offlineNum = `#OFFLINE-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderNum(offlineNum);
      setFlowStage("order_placed");
      setOrderStatus("placed");
      toast({
        title: "Order Saved Offline",
        description: "Network offline or slow. Saved to local terminal queue for auto-sync.",
        type: "info",
      });
    } else if (syncRes.success) {
      const generatedNum = orderNum || `#ORD-${Date.now().toString().slice(-4)}`;
      setOrderNum(generatedNum);
      setFlowStage("order_placed");
      setOrderStatus("placed");
      toast({
        title: "Order Saved to Database & Sent to Kitchen",
        description: `Order ${generatedNum} for Table ${table.displayNumber} is live!`,
        type: "success",
      });
    } else {
      const fallbackNum = orderNum || `#ORD-${Date.now().toString().slice(-4)}`;
      setOrderNum(fallbackNum);
      toast({
        title: "Order Saved Offline",
        description: syncRes.message || "Saved to local terminal queue.",
        type: "info",
      });
      setFlowStage("order_placed");
      setOrderStatus("placed");
    }
  };

  const handleAddMoreDishes = () => {
    setFlowStage("browsing");
  };

  const handleGuestPayment = async (
    method: "cbe_birr" | "telebirr",
    payAccount: string,
    tipAmount: number,
    phone: string,
    name: string
  ) => {
    if (!activeOrderId) return;
    setIsProcessingPayment(true);
    const subtotal =
      openOrderSubtotal ||
      placedOrderItems.reduce((sum, i) => sum + cartLineSubtotal(i), 0);
    const total = computeBill(subtotal).total + tipAmount;
    try {
      const res = await submitPaymentAction(
        activeOrderId,
        tableCode,
        method,
        total,
        payAccount,
        tipAmount,
        phone || undefined,
        name || undefined
      );
      if (res.success) {
        setHasPendingPayment(true);
        setFlowStage("order_placed");
        toast({
          title: "Payment submitted",
          description: res.message,
          type: "success",
        });
      } else {
        toast({
          title: "Payment not recorded",
          description: res.message || "Please try again.",
          type: "error",
        });
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const refreshOpenOrder = async () => {
    const open = await getActiveTableOrderAction(tableCode);
    if (open) {
      applyOpenOrder(open);
      setOpenOrderSubtotal(open.foodSubtotal);
    }
  };

  const [liveMenuItems, setLiveMenuItems] = useState<MenuItemData[]>([]);

  useEffect(() => {
    async function loadDishes() {
      const data = await getMenuItemsAction();
      if (data && data.length > 0) {
        const mapped: MenuItemData[] = data.map((d) => ({
          id: d.id,
          name: d.name,
          amharicName: d.amharic_name,
          category: (d.category.toLowerCase() as any) || "mains",
          description: d.description || "",
          price: d.price,
          photoUrl: d.image_url || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
          isAvailable: d.is_available,
          status: d.is_available ? "available" : "sold_out",
          isSpicy: d.is_spicy,
          preparationMinutes: 15,
          ingredients: [],
        }));
        setLiveMenuItems(mapped);
      } else {
        setLiveMenuItems(MENU_ITEMS);
      }
    }
    loadDishes();
  }, []);

  useEffect(() => {
    if (!activeOrderId) return;

    const tick = async () => {
      const [res, open] = await Promise.all([
        getOrderStatusAction(activeOrderId),
        getActiveTableOrderAction(tableCode),
      ]);
      if (open) {
        setHasPendingPayment(!!open.hasPendingPayment);
        setOpenOrderSubtotal(open.foodSubtotal);
        setPlacedOrderItems(toCartItems(open));
      }
      if (!res?.status) return;
      if (res.status === "paid" || res.status === "cancelled") {
        setHasOpenOrder(false);
        setActiveOrderId("");
        setHasPendingPayment(false);
        setFlowStage("feedback");
        setOrderStatus("served");
        toast({
          title: "Table cleared at cashier",
          description: "Thank you. You can rate your meal below.",
          type: "success",
        });
        return;
      }
      if (res.status === "placed" || res.status === "preparing" || res.status === "ready" || res.status === "served") {
        setOrderStatus(res.status);
      }
    };

    tick();
    const interval = setInterval(tick, 3000);
    return () => clearInterval(interval);
  }, [activeOrderId, tableCode, toast]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    const list = liveMenuItems.length > 0 ? liveMenuItems : MENU_ITEMS;
    return list.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAmharic = item.amharicName?.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        return matchesName || matchesAmharic || matchesDesc;
      }
      return true;
    });
  }, [liveMenuItems, selectedCategory, searchQuery]);

  const totalCartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const placedSubtotal = placedOrderItems.reduce((sum, i) => sum + cartLineSubtotal(i), 0);
  const foodSubtotal =
    openOrderSubtotal > 0 && placedOrderItems.length > 0 ? openOrderSubtotal : placedSubtotal;
  const bill = computeBill(foodSubtotal);
  const totalOrderAmount = bill.total;

  return (
    <div className="min-h-screen bg-background pb-32 text-brand-primary">
      {/* Sticky Mobile-First Header */}
      <header className="sticky top-0 z-40 border-b border-divider bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Left: Table Badge + Attendant */}
          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 rounded-full text-brand-secondary hover:text-brand-primary transition"
              aria-label="Back to landing"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-pill bg-background-active px-3 py-0.5 text-xs font-bold text-brand-accent border border-brand-accent/20">
                  Table {table.displayNumber.toString().padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold text-brand-primary hidden xs:inline">
                  {table.section}
                </span>
              </div>
              <p className="text-[11px] text-brand-secondary flex items-center gap-1 mt-0.5">
                <UserCheck className="h-3 w-3 text-status-available" />
                <span>Server: {table.serverName}</span>
              </p>
            </div>
          </div>

          {/* Right: Search Toggle & Flow Navigator */}
          <div className="flex items-center gap-1.5">
            {flowStage === "browsing" && (
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-brand-primary hover:bg-background-subtle transition"
                aria-label="Toggle search input"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            {hasOpenOrder && flowStage !== "browsing" && (
              <button
                type="button"
                onClick={handleAddMoreDishes}
                className="min-h-[44px] px-3 inline-flex items-center gap-1 rounded-pill bg-background-subtle text-[11px] font-semibold text-brand-secondary hover:text-brand-accent transition border border-divider"
              >
                <span>Add dishes</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Search Input in Header */}
        {searchOpen && flowStage === "browsing" && (
          <div className="px-4 pb-3 sm:px-6 animate-in slide-in-from-top-2 duration-150">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes, spices, ingredients..."
                className="w-full min-h-[40px] rounded-button border border-divider bg-background-subtle pl-9 pr-8 text-xs text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-secondary p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Flow Controller */}
      <main className="mx-auto max-w-2xl px-4 sm:px-6 pt-4 space-y-6">
        {hasOpenOrder && flowStage !== "feedback" && (
          <ActiveOrderBanner
            orderNumber={orderNum}
            status={orderStatus}
            itemCount={placedOrderItems.reduce((acc, c) => acc + c.quantity, 0)}
            amountDue={totalOrderAmount}
            hasPendingPayment={hasPendingPayment}
            onViewOrder={() => setFlowStage("order_placed")}
            onAddMore={handleAddMoreDishes}
            onPay={() => setFlowStage("payment")}
          />
        )}

        {/* ============================================================ */}
        {/* STAGE 1: BROWSING & CART SELECTION */}
        {/* ============================================================ */}
        {flowStage === "browsing" && (
          <>
            {/* Category Tabs Bar */}
            <div className="sticky top-[69px] z-30 bg-white/95 backdrop-blur-md py-1 border-b border-divider/60">
              <CategoryTabs
                categories={MENU_CATEGORIES}
                activeId={selectedCategory}
                onChange={(id) => setSelectedCategory(id)}
              />
            </div>

            {/* Vertical Dish Cards List (Mobile-First) */}
            <div className="space-y-3 pt-2">
              {filteredDishes.map((dish) => {
                const inCartQty = cartItems
                  .filter((ci) => ci.item.id === dish.id)
                  .reduce((sum, ci) => sum + ci.quantity, 0);
                return (
                  <DishCard
                    key={dish.id}
                    item={dish}
                    mode="order"
                    layout="row"
                    quantity={inCartQty}
                    onAdd={() => handleAddToCart(dish)}
                    onRemove={() => handleDishCardRemove(dish.id)}
                    onSelect={(selected) => setSelectedDish(selected)}
                  />
                );
              })}
            </div>

            {/* Sticky Bottom Cart Drawer */}
            <CartDrawer
              items={cartItems}
              tableCode={tableCode}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onUpdateCustomization={handleUpdateCustomization}
              onPlaceOrder={handlePlaceOrder}
              isSubmitting={isSubmittingOrder}
            />
          </>
        )}

        {/* ============================================================ */}
        {/* STAGE 2: LIVE ORDER TRACKING */}
        {/* ============================================================ */}
        {flowStage === "order_placed" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Live Status Stepper Component */}
            <OrderStatusStepper
              currentStatus={orderStatus}
              orderNumber={orderNum}
              tableCode={tableCode}
              serverName={table.serverName}
            />

            {/* Order Items Summary Card */}
            <div className="rounded-card border border-divider bg-white p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-divider pb-3">
                <h4 className="font-header text-sm font-bold text-brand-primary uppercase tracking-wide">
                  Dishes in this Ticket ({placedOrderItems.reduce((acc, c) => acc + c.quantity, 0)})
                </h4>
                <span className="text-xs font-bold text-brand-accent">
                  {formatETB(totalOrderAmount)}
                </span>
              </div>

              <div className="divide-y divide-divider/60 space-y-2 text-xs">
                {placedOrderItems.map(({ cartId, item, quantity, lineUnitPrice, customization }) => {
                  const notes = customization ? formatKitchenNotes(customization) : "";
                  return (
                    <div key={cartId} className="pt-2 first:pt-0 flex justify-between items-start gap-2">
                      <div>
                        <p className="font-semibold text-brand-primary">
                          {quantity}x {item.name}
                        </p>
                        {notes ? (
                          <p className="text-[11px] text-brand-secondary italic">{notes}</p>
                        ) : null}
                      </div>
                      <span className="font-bold text-brand-primary">
                        {formatETB(lineUnitPrice * quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-button bg-background-subtle p-3 space-y-1.5 text-xs border border-divider">
                <div className="flex justify-between text-brand-secondary">
                  <span>Food subtotal</span>
                  <span>{formatETB(bill.subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-secondary">
                  <span>Service charge (10%)</span>
                  <span>{formatETB(bill.serviceCharge)}</span>
                </div>
                <div className="flex justify-between text-brand-secondary">
                  <span>VAT (15%)</span>
                  <span>{formatETB(bill.vat)}</span>
                </div>
                <div className="flex justify-between font-bold text-brand-primary border-t border-divider pt-1.5">
                  <span>Amount due</span>
                  <span>{formatETB(bill.total)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddMoreDishes}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-button border border-divider bg-white px-4 py-3.5 text-sm font-semibold text-brand-primary"
              >
                Add more dishes
              </button>
              <button
                type="button"
                onClick={() => setFlowStage("payment")}
                disabled={hasPendingPayment}
                className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-button bg-brand-accent px-4 py-3.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
              >
                Pay bill
              </button>
            </div>
            {hasPendingPayment ? (
              <p className="text-center text-[11px] text-brand-accent font-semibold">
                Payment submitted — cashier will confirm and print your receipt.
              </p>
            ) : (
              <p className="text-center text-[11px] text-brand-secondary">
                Pay with CBE or Telebirr (QR on next screen). Cashier confirms before your table is cleared.
              </p>
            )}
          </div>
        )}

        {flowStage === "payment" && hasOpenOrder && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <button
              type="button"
              onClick={() => setFlowStage("order_placed")}
              className="text-xs font-semibold text-brand-accent"
            >
              ← Back to order
            </button>
            <GuestPaymentPanel
              foodSubtotal={foodSubtotal}
              tableCode={tableCode}
              serverName={table.serverName}
              onSubmit={handleGuestPayment}
              isProcessing={isProcessingPayment}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 4: STAFF & DINING FEEDBACK */}
        {/* ============================================================ */}
        {flowStage === "feedback" && (
          <div className="animate-in fade-in duration-300">
            <RatingStep
              serverName={table.serverName}
              tableCode={tableCode}
              onSubmitRating={async (data) => {
                try {
                  await submitFeedbackAction({
                    orderId: activeOrderId || undefined,
                    tableCode,
                    staffFriendliness: data.staffFriendliness,
                    staffPromptness: data.staffPromptness,
                    foodRating: data.foodRating,
                    ambienceRating: data.ambienceRating,
                    comment: data.comment,
                    redirectedToGoogle: data.redirectedToGoogle,
                    customerPhone: data.customerPhone,
                  });
                  toast({
                    title: "Feedback Recorded",
                    description: "Thank you for helping us elevate our culinary craft!",
                    type: "success",
                  });
                } catch (err) {
                  console.error("Error submitting feedback:", err);
                }
              }}
            />
          </div>
        )}
      </main>

      {/* Dish Detail Modal */}
      <DishDetailModal
        item={selectedDish}
        isOpen={!!selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToCart={handleDetailAddToCart}
        isOrderMode={flowStage === "browsing"}
      />
    </div>
  );
}

export default function OrderPage({ params }: PageProps) {
  const resolvedParams = use(params);

  return (
    <ToastProvider>
      <OrderFlowContent tableCode={resolvedParams.tableCode} />
    </ToastProvider>
  );
}
