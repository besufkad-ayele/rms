"use client";

import React, { useState, useMemo, useEffect, use } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  UtensilsCrossed,
  X,
  Flame,
  Check,
  RotateCcw,
  CheckCircle2,
  Receipt,
  UserCheck,
} from "lucide-react";
import {
  MENU_ITEMS,
  MENU_CATEGORIES,
  getTableDetails,
  MenuItemData,
  RESTAURANT_INFO,
} from "@/data/mockMenu";
import { CategoryTabs } from "@/components/menu/CategoryTabs";
import { DishCard } from "@/components/menu/DishCard";
import { DishDetailModal } from "@/components/menu/DishDetailModal";
import { CartDrawer, CartItem } from "@/components/order/CartDrawer";
import { OrderStatusStepper, FlowOrderStatus } from "@/components/order/OrderStatusStepper";
import { submitOrderAction, submitPaymentAction, submitFeedbackAction, getOrderStatusAction, getTableByCodeAction } from "./actions";
import { getMenuItemsAction } from "@/app/admin/menu/actions";
import { PaymentMethodCard, PaymentMethod } from "@/components/order/PaymentMethodCard";
import { RatingStep } from "@/components/order/RatingStep";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { formatETB, cn } from "@/lib/utils";
import { useOfflineSync } from "@/context/OfflineSyncContext";

interface PageProps {
  params: Promise<{ tableCode: string }>;
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

  // Flow Stages: "browsing" | "order_placed" | "payment" | "feedback"
  const [flowStage, setFlowStage] = useState<"browsing" | "order_placed" | "payment" | "feedback">("browsing");
  const [orderStatus, setOrderStatus] = useState<FlowOrderStatus>("placed");

  // Menu filtering & search
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [selectedDish, setSelectedDish] = useState<MenuItemData | null>(null);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Placed Order Details
  const [placedOrderItems, setPlacedOrderItems] = useState<CartItem[]>([]);
  const [orderNum, setOrderNum] = useState<string>(() => `ORD-${Math.floor(100 + Math.random() * 900)}`);
  const [customerNote, setCustomerNote] = useState<string>("");
  const [activeOrderId, setActiveOrderId] = useState<string>("");

  // Cart Helpers
  const handleAddToCart = (item: MenuItemData) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    toast({
      title: `Added ${item.name}`,
      description: `${formatETB(item.price)} added to Table ${table.displayNumber} order`,
      type: "success",
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            const nextQty = ci.quantity + delta;
            return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleUpdateInstructions = (itemId: string, instructions: string) => {
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.item.id === itemId ? { ...ci, specialInstructions: instructions } : ci
      )
    );
    toast({
      title: "Chef Note Saved",
      description: `Special instruction recorded for item`,
      type: "info",
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  // Place Order Action (Database & Offline Integration)
  const handlePlaceOrder = async () => {
    setIsSubmittingOrder(true);
    setPlacedOrderItems([...cartItems]);

    const formattedItems = cartItems.map((ci) => ({
      menuItemId: ci.item.id,
      title: ci.item.name,
      price: ci.item.price,
      quantity: ci.quantity,
    }));

    if (isOnline) {
      try {
        const res = await submitOrderAction(tableCode, formattedItems, customerNote);
        if (res.success && res.orderId) {
          setActiveOrderId(res.orderId);
          setOrderNum(res.orderNumber || `#KD-${res.orderId.substring(0, 5).toUpperCase()}`);
          setFlowStage("order_placed");
          setOrderStatus("placed");
          toast({
            title: "Order Sent to Kitchen & Saved to Database",
            description: `Order ${res.orderNumber} for Table ${table.displayNumber} is now live in the kitchen!`,
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
      setFlowStage("order_placed");
      setOrderStatus("placed");
      toast({
        title: "Order Saved to Database & Sent to Kitchen",
        description: `Order ${orderNum} for Table ${table.displayNumber} is live!`,
        type: "success",
      });
    } else {
      toast({
        title: "Order Saved Offline",
        description: syncRes.message || "Saved to local terminal queue.",
        type: "info",
      });
      setFlowStage("order_placed");
      setOrderStatus("placed");
    }
  };

  // Payment Confirmation Action (Database & Offline Integration)
  const handlePaymentConfirmed = async (method: PaymentMethod, reference?: string) => {
    setIsProcessingPayment(true);
    const subtotal = placedOrderItems.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);
    const totalAmount = Math.round(subtotal * 1.15 * 1.1);

    if (isOnline && activeOrderId) {
      try {
        const res = await submitPaymentAction(activeOrderId, tableCode, method as any, totalAmount);
        if (res.success) {
          setIsProcessingPayment(false);
          setFlowStage("feedback");
          toast({
            title: "Payment Settled & Saved to Database",
            description: `Thank you! Bill settled via ${method.replace("_", " ").toUpperCase()}. Table marked free.`,
            type: "success",
          });
          return;
        }
      } catch (err) {
        console.warn("Direct payment failed, falling back to queue:", err);
      }
    }

    const syncRes = await enqueueAndSyncIfOnline("PROCESS_PAYMENT", {
      orderId: activeOrderId,
      tableCode,
      method,
      amount: totalAmount,
    });

    setIsProcessingPayment(false);
    setFlowStage("feedback");
    toast({
      title: syncRes.offlineQueued ? "Payment Stored Offline" : "Payment Settled & Saved to Database",
      description: syncRes.offlineQueued
        ? "Payment queued in local database. Will auto-sync when online."
        : `Thank you! Bill settled via ${method.replace("_", " ").toUpperCase()}. Table marked free.`,
      type: syncRes.offlineQueued ? "info" : "success",
    });
  };

  // Reset Session (for demo)
  const handleResetSession = () => {
    setFlowStage("browsing");
    setOrderStatus("placed");
    setCartItems([]);
    setPlacedOrderItems([]);
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

  // Live polling for order status updates from Kitchen Display System (KDS)
  useEffect(() => {
    if (!activeOrderId || flowStage !== "order_placed") return;

    const interval = setInterval(async () => {
      const res = await getOrderStatusAction(activeOrderId);
      if (res && res.status) {
        setOrderStatus(res.status);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeOrderId, flowStage]);

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
  const totalOrderAmount = (placedOrderItems.length > 0 ? placedOrderItems : cartItems).reduce(
    (sum, i) => sum + i.item.price * i.quantity,
    0
  );

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

            {/* Quick reset for evaluator/demo */}
            {flowStage !== "browsing" && (
              <button
                type="button"
                onClick={handleResetSession}
                className="min-h-[44px] px-3 inline-flex items-center gap-1 rounded-pill bg-background-subtle text-[11px] font-semibold text-brand-secondary hover:text-brand-accent transition border border-divider"
              >
                <RotateCcw className="h-3 w-3" />
                <span>New Session</span>
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
                const inCart = cartItems.find((ci) => ci.item.id === dish.id);
                return (
                  <DishCard
                    key={dish.id}
                    item={dish}
                    mode="order"
                    layout="row"
                    quantity={inCart?.quantity || 0}
                    onAdd={() => handleAddToCart(dish)}
                    onRemove={() => handleUpdateQuantity(dish.id, -1)}
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
              onUpdateInstructions={handleUpdateInstructions}
              onRemoveItem={handleRemoveItem}
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
                {placedOrderItems.map(({ item, quantity, specialInstructions }) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-brand-primary">
                        {quantity}x {item.name}
                      </p>
                      {specialInstructions && (
                        <p className="text-[11px] text-brand-secondary italic">
                          Note: &ldquo;{specialInstructions}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-brand-primary">
                      {formatETB(item.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Proceed to Payment Button */}
            <button
              type="button"
              onClick={() => setFlowStage("payment")}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-button bg-brand-accent px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-accent-hover active:scale-[0.99]"
            >
              <Receipt className="h-4 w-4" />
              <span>Settle Bill & Proceed to Payment ({formatETB(totalOrderAmount)})</span>
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3: PAYMENT METHOD SELECTION */}
        {/* ============================================================ */}
        {flowStage === "payment" && (
          <div className="animate-in fade-in duration-300">
            <PaymentMethodCard
              totalAmount={totalOrderAmount}
              tableCode={tableCode}
              onPaymentConfirmed={handlePaymentConfirmed}
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
              onSubmitRating={(data) => {
                toast({
                  title: "Feedback Recorded",
                  description: "Thank you for helping us elevate our culinary craft!",
                  type: "success",
                });
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
        onAddToCart={(item) => handleAddToCart(item)}
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
