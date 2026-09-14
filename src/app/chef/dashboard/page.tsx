"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Clock,
  AlertTriangle,
  UtensilsCrossed,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChefTicketItem {
  name: string;
  qty: number;
  notes?: string;
  omittedIngredients?: string[];
  extras?: string[];
  chefNote?: string;
  station: "grill" | "stew" | "starter" | "bar";
  recipeBOM: { ingredient: string; amount: string }[];
}

interface ChefTicket {
  id: string;
  orderNumber: string;
  tableCode: string;
  channel: "dine_in" | "takeout" | "delivery";
  status: "placed" | "preparing" | "ready";
  elapsedMinutes: number;
  attendant: string;
  items: ChefTicketItem[];
  customerNote?: string;
}

import { getKitchenOrdersAction } from "./actions";

export default function ChefDashboardPage() {
  const [tickets, setTickets] = useState<ChefTicket[]>([]);
  const [activeStation, setActiveStation] = useState<string>("all");
  const fetchLiveTickets = async () => {
    const res = await getKitchenOrdersAction();
    if (res.tickets) {
      setTickets(res.tickets as any);
    }
  };

  useEffect(() => {
    fetchLiveTickets();
    const interval = setInterval(fetchLiveTickets, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredTickets = tickets.filter((t) => {
    if (activeStation === "all") return true;
    return t.items.some((item) => item.station === activeStation);
  });

  const placedCount = tickets.filter((t) => t.status === "placed").length;
  const prepCount = tickets.filter((t) => t.status === "preparing").length;
  const readyCount = tickets.filter((t) => t.status === "ready").length;

  return (
    <div className="space-y-6 pb-16 select-none">
      <div className="rounded-card border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80">
        Kitchen TV is view-only. Waiters start cooking, mark ready, and mark served from the floor console.
      </div>

      {/* Ribbon Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-card bg-[#231F20] p-4 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#92898A]">Active Orders</p>
            <p className="font-header text-2xl font-bold text-white mt-0.5">{tickets.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2.5 text-white">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-card bg-[#231F20] p-4 border border-status-danger/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-status-danger">Needs Cooking (Placed)</p>
            <p className="font-header text-2xl font-bold text-status-danger mt-0.5">{placedCount}</p>
          </div>
          <div className="rounded-xl bg-status-danger-bg p-2.5 text-status-danger">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-card bg-[#231F20] p-4 border border-status-occupied/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-status-occupied">On Hearth (Preparing)</p>
            <p className="font-header text-2xl font-bold text-status-occupied mt-0.5">{prepCount}</p>
          </div>
          <div className="rounded-xl bg-status-occupied-bg p-2.5 text-status-occupied">
            <Flame className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-card bg-[#231F20] p-4 border border-status-free/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-status-free">Ready for Waiter</p>
            <p className="font-header text-2xl font-bold text-status-free mt-0.5">{readyCount}</p>
          </div>
          <div className="rounded-xl bg-status-free-bg p-2.5 text-status-free">
            <Bell className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Station Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Stations" },
            { id: "grill", label: "Hearth Grill (Tibs & Kitfo)" },
            { id: "stew", label: "Stews (Doro Wat & Shiro)" },
            { id: "starter", label: "Starters & Desserts" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStation(st.id)}
              className={cn(
                "rounded-pill px-3.5 py-1.5 text-xs font-bold transition",
                activeStation === st.id
                  ? "bg-brand-accent text-white shadow-sm"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              )}
            >
              {st.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-[#92898A] font-mono">
          Auto-Refreshing Live KDS Stream (Supabase Realtime)
        </p>
      </div>

      {/* KDS Active Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTickets.map((ticket) => {
          const isPlaced = ticket.status === "placed";
          const isPreparing = ticket.status === "preparing";
          const isReady = ticket.status === "ready";

          const isOverdue = ticket.elapsedMinutes > 15;
          const isUrgent = ticket.elapsedMinutes >= 10 && ticket.elapsedMinutes <= 15;

          return (
            <div
              key={ticket.id}
              className={cn(
                "rounded-card bg-[#231F20] border p-5 flex flex-col justify-between space-y-4 shadow-elevated pointer-events-none",
                isPlaced && "border-status-danger/40 bg-gradient-to-b from-[#2a1c20] to-[#231F20]",
                isPreparing && "border-status-occupied/40 bg-gradient-to-b from-[#2a241c] to-[#231F20]",
                isReady && "border-status-free/40 bg-gradient-to-b from-[#1c2a20] to-[#231F20]"
              )}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-header text-xl font-bold text-white">
                        Table {ticket.tableCode}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-pill bg-white/10 text-white/80 border border-white/10">
                        {ticket.orderNumber}
                      </span>
                    </div>
                    <p className="text-xs text-[#92898A] mt-0.5">
                      Attendant: <strong className="text-white">{ticket.attendant}</strong>
                    </p>
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-bold font-mono",
                      isOverdue && "bg-status-danger text-white animate-pulse",
                      isUrgent && "bg-status-occupied text-white",
                      !isOverdue && !isUrgent && "bg-white/10 text-white/80"
                    )}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>{ticket.elapsedMinutes}m ago</span>
                  </div>
                </div>

                {/* Customer Notes */}
                {ticket.customerNote && (
                  <div className="mt-3 rounded-button bg-status-occupied/10 border border-status-occupied/30 p-2.5 text-xs text-status-occupied font-semibold">
                    &ldquo;{ticket.customerNote}&rdquo;
                  </div>
                )}

                {/* Items List */}
                <div className="mt-4 space-y-2.5 divide-y divide-white/10">
                  {ticket.items.map((item, idx) => (
                    <div key={idx} className="pt-2 flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-pill bg-brand-accent text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {item.qty}x
                          </span>
                          <span className="font-bold text-sm text-white">{item.name}</span>
                        </div>

                        {/* Omitted ingredients (86 / no-X) */}
                        {item.omittedIngredients && item.omittedIngredients.length > 0 && (
                          <div className="mt-1.5 pl-8 flex flex-wrap gap-1">
                            {item.omittedIngredients.map((ing, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-pill bg-status-danger/15 border border-status-danger/40 px-2 py-0.5 text-[10px] font-bold text-status-danger uppercase"
                              >
                                No {ing}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Extras / add-ons */}
                        {item.extras && item.extras.length > 0 && (
                          <div className="mt-1.5 pl-8 flex flex-wrap gap-1">
                            {item.extras.map((ex, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-pill bg-status-free/15 border border-status-free/40 px-2 py-0.5 text-[10px] font-bold text-status-free uppercase"
                              >
                                + {ex}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Chef note for this item */}
                        {item.chefNote && (
                          <p className="mt-1.5 pl-8 text-xs text-status-occupied font-semibold">
                            &ldquo;{item.chefNote}&rdquo;
                          </p>
                        )}

                        {item.notes && !item.chefNote && (
                          <p className="text-xs text-status-occupied pl-8">{item.notes}</p>
                        )}
                      </div>

                      <span className="text-[10px] text-[#92898A] font-semibold mt-1 uppercase shrink-0 ml-2">
                        {item.station}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-button py-2.5 text-xs font-bold",
                    isPlaced && "bg-status-danger/90 text-white",
                    isPreparing && "bg-status-occupied/90 text-white",
                    isReady && "bg-status-free/90 text-white"
                  )}
                >
                  {isPlaced && "Waiting — waiter will start cooking"}
                  {isPreparing && "On the hearth — waiter marks ready"}
                  {isReady && "Ready — waiter will serve and clear"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
