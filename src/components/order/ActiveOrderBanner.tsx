"use client";

import { Clock, CreditCard, Plus, UtensilsCrossed } from "lucide-react";
import { FlowOrderStatus } from "@/components/order/OrderStatusStepper";
import { formatETB, cn } from "@/lib/utils";

const STATUS_LABEL: Record<FlowOrderStatus, string> = {
  placed: "Sent to kitchen",
  preparing: "Kitchen preparing",
  ready: "Ready — waiter bringing it",
  served: "Served — ready to pay",
};

export function ActiveOrderBanner({
  orderNumber,
  status,
  itemCount,
  amountDue,
  hasPendingPayment,
  onViewOrder,
  onAddMore,
  onPay,
}: {
  orderNumber: string;
  status: FlowOrderStatus;
  itemCount: number;
  amountDue: number;
  hasPendingPayment?: boolean;
  onViewOrder: () => void;
  onAddMore: () => void;
  onPay: () => void;
}) {
  return (
    <div className="sticky top-[69px] z-35 rounded-card border border-brand-accent/30 bg-background-active p-3 shadow-card space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-accent">
            {hasPendingPayment ? "Payment sent — cashier confirming" : "Open order"}
          </p>
          <p className="font-header text-sm font-bold text-brand-primary truncate">{orderNumber}</p>
          <p className="text-[11px] text-brand-secondary flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" />
            {STATUS_LABEL[status]}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase text-brand-secondary">{itemCount} items</p>
          <p className="font-header text-sm font-bold text-brand-accent">{formatETB(amountDue)}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onViewOrder}
          className={cn(
            "min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-button border border-divider bg-white text-xs font-bold text-brand-primary"
          )}
        >
          <UtensilsCrossed className="h-3.5 w-3.5" />
          Ticket
        </button>
        <button
          type="button"
          onClick={onAddMore}
          className="min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-button bg-brand-primary text-xs font-bold text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
        <button
          type="button"
          onClick={onPay}
          disabled={hasPendingPayment}
          className="min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-button bg-brand-accent text-xs font-bold text-white disabled:opacity-60"
        >
          <CreditCard className="h-3.5 w-3.5" />
          Pay
        </button>
      </div>
    </div>
  );
}
