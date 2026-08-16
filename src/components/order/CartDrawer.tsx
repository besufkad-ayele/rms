"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  MessageSquareQuote,
  ArrowRight,
} from "lucide-react";
import { MenuItemData } from "@/data/mockMenu";
import { formatETB, cn } from "@/lib/utils";

export interface CartItem {
  item: MenuItemData;
  quantity: number;
  specialInstructions?: string;
}

interface CartDrawerProps {
  items: CartItem[];
  tableCode: string;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onUpdateInstructions: (itemId: string, instructions: string) => void;
  onRemoveItem: (itemId: string) => void;
  onPlaceOrder: () => void;
  isSubmitting?: boolean;
}

export function CartDrawer({
  items,
  tableCode,
  onUpdateQuantity,
  onUpdateInstructions,
  onRemoveItem,
  onPlaceOrder,
  isSubmitting = false,
}: CartDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingInstructionsId, setEditingInstructionsId] = useState<string | null>(null);

  const totalItemCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  if (totalItemCount === 0) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay when expanded */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 z-40 bg-brand-primary/40 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Drawer Container */}
      <div
        className={cn(
          "fixed bottom-0 inset-x-0 z-50 mx-auto max-w-2xl bg-white border-t border-divider shadow-drawer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isExpanded ? "rounded-t-[20px] max-h-[85vh] flex flex-col" : "rounded-t-card"
        )}
      >
        {/* Drag handle / header toggle */}
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
                  {formatETB(subtotal)}
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

        {/* Expanded Content */}
        {isExpanded && (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="flex items-center justify-between border-b border-divider pb-2">
              <h3 className="font-header text-lg font-bold text-brand-primary">
                Your Table Order
              </h3>
              <span className="text-xs text-brand-secondary">
                {totalItemCount} {totalItemCount === 1 ? "dish" : "dishes"}
              </span>
            </div>

            {/* Item List */}
            <div className="divide-y divide-divider/70 space-y-3">
              {items.map(({ item, quantity, specialInstructions }) => (
                <div key={item.id} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-primary truncate">
                        {item.name}
                      </p>
                      <p className="text-xs font-bold text-brand-accent">
                        {formatETB(item.price * quantity)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 rounded-pill bg-background-active px-2 py-1 border border-divider">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
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
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="min-h-[32px] min-w-[32px] flex items-center justify-center rounded-full bg-brand-accent text-white hover:bg-brand-accent-hover transition shadow-2xs"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Special instruction notes */}
                  <div className="text-xs">
                    {editingInstructionsId === item.id ? (
                      <div className="space-y-1.5 pt-1">
                        <textarea
                          defaultValue={specialInstructions || ""}
                          placeholder="e.g. Extra awaze sauce, mild spice, no onions..."
                          onBlur={(e) => {
                            onUpdateInstructions(item.id, e.target.value);
                            setEditingInstructionsId(null);
                          }}
                          autoFocus
                          rows={2}
                          className="w-full rounded-button border border-brand-accent/40 bg-background-subtle p-2 text-xs text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingInstructionsId(null)}
                          className="text-[11px] font-semibold text-brand-accent"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingInstructionsId(item.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-brand-secondary hover:text-brand-accent transition"
                      >
                        <MessageSquareQuote className="h-3.5 w-3.5" />
                        <span>
                          {specialInstructions
                            ? `Note: "${specialInstructions}" (Tap to edit)`
                            : "+ Add note for chef"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bill breakdown summary */}
            <div className="rounded-card bg-background-subtle p-3.5 space-y-2 border border-divider text-xs">
              <div className="flex justify-between text-brand-secondary">
                <span>Subtotal</span>
                <span>{formatETB(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-secondary">
                <span>Service & Table Charge</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-brand-primary border-t border-divider pt-2">
                <span>Total Amount</span>
                <span className="text-brand-accent">{formatETB(subtotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Sticky Action Bar */}
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
                <span>Place Order & Send to Kitchen ({formatETB(subtotal)})</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
