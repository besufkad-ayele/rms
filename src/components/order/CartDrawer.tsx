"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Ban,
  PlusCircle,
  ChefHat,
  Check,
  SlidersHorizontal,
} from "lucide-react";
import { MenuItemData } from "@/data/mockMenu";
import { computeBill, formatETB, cn } from "@/lib/utils";
import {
  ItemCustomization,
  MenuExtraOption,
  MenuIngredientOption,
} from "@/types/order-customization";
import { getMenuItemOptionsAction } from "@/app/order/[tableCode]/actions";

export interface CartItem {
  cartId: string;
  item: MenuItemData;
  quantity: number;
  lineUnitPrice: number;
  customization?: ItemCustomization;
  specialInstructions?: string;
}

function lineSubtotal(ci: CartItem) {
  return ci.lineUnitPrice * ci.quantity;
}

interface CartDrawerProps {
  items: CartItem[];
  tableCode: string;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onUpdateCustomization: (
    cartId: string,
    customization: ItemCustomization,
    lineUnitPrice: number
  ) => void;
  onPlaceOrder: () => void;
  isSubmitting?: boolean;
}

/** Inline editor: ingredients + extras + custom note for one cart line. */
function CartLineCustomizer({
  item,
  current,
  onSave,
  onClose,
}: {
  item: MenuItemData;
  current?: ItemCustomization;
  onSave: (customization: ItemCustomization, lineUnitPrice: number) => void;
  onClose: () => void;
}) {
  const [ingredients, setIngredients] = useState<MenuIngredientOption[]>([]);
  const [extras, setExtras] = useState<MenuExtraOption[]>([]);
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const [selectedExtras, setSelectedExtras] = useState<MenuExtraOption[]>(
    current?.selectedExtras || []
  );
  const [chefNote, setChefNote] = useState(current?.chefNote || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await getMenuItemOptionsAction(item.id, item.name, item.ingredients);
      if (cancelled) return;
      setIngredients(res.ingredients);
      setExtras(res.extras);
      const omittedNames = new Set(current?.omittedIngredients || []);
      const nextIncluded: Record<string, boolean> = {};
      res.ingredients.forEach((ing) => {
        nextIncluded[ing.id] = !omittedNames.has(ing.name);
      });
      setIncluded(nextIncluded);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const extrasPrice = selectedExtras.reduce((s, e) => s + e.price, 0);
  const lineUnitPrice = item.price + extrasPrice;
  const omittedIngredients = ingredients
    .filter((ing) => included[ing.id] === false)
    .map((ing) => ing.name);

  const toggleExtra = (extra: MenuExtraOption) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) return prev.filter((e) => e.id !== extra.id);
      return [...prev, extra];
    });
  };

  return (
    <div className="rounded-button border border-brand-accent/30 bg-background-subtle p-3 space-y-3 text-xs">
      {loading ? (
        <p className="text-brand-secondary">Loading ingredients & extras…</p>
      ) : (
        <>
          <div>
            <p className="text-[10px] font-bold uppercase text-brand-secondary mb-1.5">
              Ingredients (uncheck to remove)
            </p>
            <div className="space-y-1.5">
              {ingredients.map((ing) => {
                const checked = included[ing.id] !== false;
                return (
                  <label
                    key={ing.id}
                    className={cn(
                      "flex items-center gap-2 rounded-button border p-2 cursor-pointer",
                      checked
                        ? "border-divider bg-white"
                        : "border-status-sold-out/40 bg-status-sold-out/5"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={ing.required}
                      onChange={() => {
                        if (ing.required) return;
                        setIncluded((prev) => ({ ...prev, [ing.id]: !checked }));
                      }}
                      className="h-3.5 w-3.5 accent-brand-accent"
                    />
                    <span className="flex-1 font-medium text-brand-primary">{ing.name}</span>
                    {ing.required ? (
                      <span className="text-[9px] font-bold text-brand-accent uppercase">
                        Required
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </div>

          {extras.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase text-brand-secondary mb-1.5">
                Extras that go with this dish
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {extras.map((extra) => {
                  const picked = selectedExtras.some((e) => e.id === extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra)}
                      className={cn(
                        "flex items-center justify-between rounded-button border p-2 text-left transition",
                        picked
                          ? "border-brand-accent bg-brand-accent/10"
                          : "border-divider bg-white"
                      )}
                    >
                      <span className="font-medium text-brand-primary">{extra.name}</span>
                      <span className="flex items-center gap-1 font-bold text-brand-accent">
                        {picked ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        {formatETB(extra.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-[10px] font-bold uppercase text-brand-secondary mb-1.5 flex items-center gap-1">
              <ChefHat className="h-3 w-3" />
              Custom note for the chef
            </p>
            <textarea
              value={chefNote}
              onChange={(e) => setChefNote(e.target.value)}
              rows={2}
              placeholder="e.g. extra spicy, no salt, separate injera…"
              className="w-full rounded-button border border-divider bg-white p-2 text-xs text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[11px] font-bold text-brand-primary">
              {formatETB(lineUnitPrice)} each
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-semibold text-brand-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  onSave(
                    {
                      omittedIngredients,
                      selectedExtras,
                      chefNote: chefNote.trim() || undefined,
                    },
                    lineUnitPrice
                  )
                }
                className="rounded-button bg-brand-accent px-3 py-1.5 text-[11px] font-bold text-white"
              >
                Save changes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function CartDrawer({
  items,
  tableCode,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateCustomization,
  onPlaceOrder,
  isSubmitting = false,
}: CartDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + lineSubtotal(curr), 0);
  const bill = computeBill(subtotal);

  if (totalItemCount === 0) {
    return null;
  }

  return (
    <>
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 z-40 bg-brand-primary/40 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      <div
        className={cn(
          "fixed bottom-0 inset-x-0 z-50 mx-auto max-w-2xl bg-white border-t border-divider shadow-drawer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isExpanded ? "rounded-t-[20px] max-h-[85vh] flex flex-col" : "rounded-t-card"
        )}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full pt-3 pb-2 px-6 flex flex-col items-center justify-center hover:bg-background-subtle/50 transition cursor-pointer select-none"
          aria-label={isExpanded ? "Collapse order summary" : "Expand order summary"}
        >
          <div className="h-1.5 w-12 rounded-full bg-divider mb-2" />

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent text-white shadow-xs">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[11px] font-bold text-white ring-2 ring-white">
                  {totalItemCount}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">
                  Table {tableCode.replace("T-", "")} Order
                </p>
                <p className="font-sans text-base font-bold text-brand-primary">
                  {formatETB(bill.total)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-brand-accent">
              <span>{isExpanded ? "Close Review" : "Review Order"}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-2">
              <h3 className="font-header text-lg font-bold text-brand-primary">Your Table Order</h3>
              <span className="text-xs text-brand-secondary">
                {totalItemCount} {totalItemCount === 1 ? "dish" : "dishes"}
              </span>
            </div>

            <div className="divide-y divide-divider/70 space-y-3">
              {items.map(({ cartId, item, quantity, lineUnitPrice, customization }) => {
                const omitted = customization?.omittedIngredients || [];
                const extras = customization?.selectedExtras || [];
                const note = customization?.chefNote || "";
                const isEditing = editingId === cartId;
                return (
                  <div key={cartId} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-brand-primary truncate">
                          {item.name}
                        </p>
                        <p className="text-xs font-bold text-brand-accent">
                          {formatETB(lineUnitPrice * quantity)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 rounded-pill bg-background-active px-2 py-1 border border-divider">
                        <button
                          type="button"
                          onClick={() =>
                            quantity === 1
                              ? onRemoveItem(cartId)
                              : onUpdateQuantity(cartId, -1)
                          }
                          className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-full bg-white text-brand-primary hover:bg-brand-accent hover:text-white transition shadow-2xs"
                          aria-label="Decrease quantity"
                        >
                          {quantity === 1 ? (
                            <Trash2 className="h-3 w-3 text-status-sold-out" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-brand-primary">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(cartId, 1)}
                          className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-full bg-brand-accent text-white hover:bg-brand-accent-hover transition shadow-2xs"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Customization summary chips */}
                    {(omitted.length > 0 || extras.length > 0) && !isEditing && (
                      <div className="flex flex-wrap gap-1.5">
                        {omitted.map((name) => (
                          <span
                            key={`omit-${name}`}
                            className="inline-flex items-center gap-1 rounded-pill bg-status-sold-out/10 text-status-sold-out px-2 py-0.5 text-[10px] font-semibold border border-status-sold-out/20"
                          >
                            <Ban className="h-2.5 w-2.5" />
                            No {name}
                          </span>
                        ))}
                        {extras.map((ex) => (
                          <span
                            key={`extra-${ex.id}`}
                            className="inline-flex items-center gap-1 rounded-pill bg-brand-accent/10 text-brand-accent px-2 py-0.5 text-[10px] font-semibold border border-brand-accent/20"
                          >
                            <PlusCircle className="h-2.5 w-2.5" />
                            {ex.name} (+{formatETB(ex.price)})
                          </span>
                        ))}
                      </div>
                    )}

                    {isEditing ? (
                      <CartLineCustomizer
                        item={item}
                        current={customization}
                        onClose={() => setEditingId(null)}
                        onSave={(next, unitPrice) => {
                          onUpdateCustomization(cartId, next, unitPrice);
                          setEditingId(null);
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingId(cartId)}
                        className="inline-flex items-center gap-1 text-[11px] text-brand-secondary hover:text-brand-accent transition"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>
                          {note
                            ? `Note: "${note}" · tap to edit ingredients & extras`
                            : "+ Customize ingredients, extras & note"}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="rounded-card bg-background-subtle p-3.5 space-y-2 border border-divider text-xs">
              <div className="flex justify-between text-brand-secondary">
                <span>Subtotal</span>
                <span>{formatETB(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-secondary">
                <span>Service charge (10%)</span>
                <span>{formatETB(bill.serviceCharge)}</span>
              </div>
              <div className="flex justify-between text-brand-secondary">
                <span>VAT (15%)</span>
                <span>{formatETB(bill.vat)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-brand-primary border-t border-divider pt-2">
                <span>Amount due</span>
                <span className="text-brand-accent">{formatETB(bill.total)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-divider bg-white p-4">
          <button
            type="button"
            disabled={isSubmitting || totalItemCount === 0}
            onClick={onPlaceOrder}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 rounded-button bg-brand-accent px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-accent-hover active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Transmitting Order to Kitchen...
              </span>
            ) : (
              <>
                <span>Place Order & Send to Kitchen ({formatETB(bill.total)})</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
