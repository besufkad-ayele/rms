"use client";

import React from "react";
import { Check, Clock, ChefHat, Sparkles, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlowOrderStatus = "placed" | "preparing" | "ready" | "served";

interface OrderStatusStepperProps {
  currentStatus: FlowOrderStatus;
  orderNumber?: string;
  tableCode: string;
  serverName?: string;
  placedAt?: string;
}

const STEPS: { status: FlowOrderStatus; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    status: "placed",
    label: "Order Placed",
    description: "Received by order engine",
    icon: UtensilsCrossed,
  },
  {
    status: "preparing",
    label: "Kitchen Preparing",
    description: "Hearth fire & chef assembly",
    icon: ChefHat,
  },
  {
    status: "ready",
    label: "Order Ready",
    description: "Plated & expediting to table",
    icon: Sparkles,
  },
  {
    status: "served",
    label: "Served at Table",
    description: "Delivered to your party",
    icon: Check,
  },
];

export function OrderStatusStepper({
  currentStatus,
  orderNumber = "ORD-408",
  tableCode,
  serverName = "Michael Tadesse",
  placedAt = "Just now",
}: OrderStatusStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <div className="rounded-card border border-divider bg-white p-5 sm:p-6 shadow-card space-y-6">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-header text-lg font-bold text-brand-primary">
              Order {orderNumber}
            </span>
            <span className="rounded-pill bg-background-active px-2.5 py-0.5 text-xs font-semibold text-brand-accent">
              Table {tableCode.replace("T-", "")}
            </span>
          </div>
          <p className="text-xs text-brand-secondary mt-0.5">
            Placed {placedAt} • Attendant: <span className="font-medium text-brand-primary">{serverName}</span>
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2">
          {currentStatus === "preparing" && (
            <span className="flex items-center gap-1.5 rounded-pill bg-status-preparing-bg px-3 py-1 text-xs font-bold text-status-preparing">
              <Clock className="h-3.5 w-3.5 animate-spin" />
              Est. 12-15 mins
            </span>
          )}
          {currentStatus === "served" && (
            <span className="flex items-center gap-1.5 rounded-pill bg-status-available-bg px-3 py-1 text-xs font-bold text-status-available">
              <Check className="h-3.5 w-3.5" />
              Enjoy Your Meal!
            </span>
          )}
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="relative">
        <div className="space-y-6">
          {STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;
            const Icon = step.icon;

            return (
              <div key={step.status} className="relative flex items-start gap-4">
                {/* Connecting Line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "absolute left-4 top-9 -bottom-4 w-[2px] -translate-x-1/2 transition-colors duration-300",
                      index < currentIndex ? "bg-status-available" : "bg-divider"
                    )}
                  />
                )}

                {/* Node Icon */}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                    isCompleted && "bg-status-available text-white shadow-xs",
                    isCurrent &&
                      (step.status === "preparing"
                        ? "bg-status-preparing text-white ring-4 ring-status-preparing-bg animate-pulse-subtle"
                        : "bg-brand-accent text-white ring-4 ring-background-active"),
                    isPending && "bg-background-card text-brand-secondary"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                {/* Step Text */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "text-sm font-semibold leading-none",
                        isCurrent
                          ? "text-brand-primary font-bold"
                          : isCompleted
                          ? "text-brand-primary"
                          : "text-brand-secondary"
                      )}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <span className="text-[11px] font-bold text-brand-accent uppercase tracking-wider">
                        Current State
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-brand-secondary">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
