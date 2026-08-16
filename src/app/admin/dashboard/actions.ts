"use server";

import { revalidatePath } from "next/cache";
import {
  INITIAL_DASHBOARD_KPIS,
  INITIAL_FLOOR_TABLES,
  INITIAL_KITCHEN_TICKETS,
  INITIAL_LOW_STOCK_ALERTS,
  INITIAL_PENDING_SETTLEMENTS,
  INITIAL_RECENT_REVIEWS,
  TableFloorState,
  LiveKitchenTicket,
  LowStockAlertItem,
  PendingSettlementItem,
  RecentReviewItem,
  DashboardKPIs,
} from "@/data/mockDashboard";

// In-memory persistent states for live session interaction
let currentKPIs: DashboardKPIs = { ...INITIAL_DASHBOARD_KPIS };
let currentTables: TableFloorState[] = [...INITIAL_FLOOR_TABLES];
let currentTickets: LiveKitchenTicket[] = [...INITIAL_KITCHEN_TICKETS];
let currentAlerts: LowStockAlertItem[] = [...INITIAL_LOW_STOCK_ALERTS];
let currentSettlements: PendingSettlementItem[] = [...INITIAL_PENDING_SETTLEMENTS];
let currentReviews: RecentReviewItem[] = [...INITIAL_RECENT_REVIEWS];

export async function getDashboardData() {
  // Re-calculate live table statistics
  const occupiedCount = currentTables.filter((t) => t.status === "occupied").length;
  const freeCount = currentTables.filter((t) => t.status === "free").length;
  const reservedCount = currentTables.filter((t) => t.status === "reserved").length;

  currentKPIs = {
    ...currentKPIs,
    occupiedTables: occupiedCount,
    freeTables: freeCount,
    reservedTables: reservedCount,
    activeOrderCount: currentTickets.filter((t) => t.status !== "served" && t.status !== "disputed").length,
  };

  return {
    kpis: currentKPIs,
    tables: currentTables,
    tickets: currentTickets,
    alerts: currentAlerts,
    settlements: currentSettlements,
    reviews: currentReviews,
  };
}

export async function updateTableStatusAction(
  tableId: string,
  newStatus: "free" | "occupied" | "reserved",
  guestCount?: number,
  assignedStaffName?: string
) {
  currentTables = currentTables.map((table) => {
    if (table.id === tableId) {
      if (newStatus === "free") {
        return {
          ...table,
          status: "free",
          current_order_id: undefined,
          current_order_total: undefined,
          occupied_since_minutes: undefined,
          active_guest_count: undefined,
        };
      }
      if (newStatus === "occupied") {
        return {
          ...table,
          status: "occupied",
          occupied_since_minutes: 1,
          active_guest_count: guestCount || table.active_guest_count || 2,
          assigned_staff_name: assignedStaffName || table.assigned_staff_name || "Michael Tadesse",
        };
      }
      return {
        ...table,
        status: newStatus,
      };
    }
    return table;
  });

  revalidatePath("/admin/dashboard");
  return { success: true, tables: currentTables };
}

export async function updateTicketStatusAction(
  ticketId: string,
  newStatus: "placed" | "preparing" | "ready" | "served" | "disputed"
) {
  currentTickets = currentTickets.map((ticket) => {
    if (ticket.id === ticketId) {
      return { ...ticket, status: newStatus };
    }
    return ticket;
  });

  revalidatePath("/admin/dashboard");
  return { success: true, tickets: currentTickets };
}

export async function confirmSettlementAction(settlementId: string) {
  const target = currentSettlements.find((s) => s.id === settlementId);
  if (target) {
    // Free the corresponding table
    currentTables = currentTables.map((table) => {
      if (table.unique_code === target.tableCode) {
        return {
          ...table,
          status: "free",
          current_order_id: undefined,
          current_order_total: undefined,
          occupied_since_minutes: undefined,
          active_guest_count: undefined,
        };
      }
      return table;
    });

    // Add to revenue
    currentKPIs.todayRevenue += target.amount;
    currentKPIs.grossProfit += target.amount * 0.67; // average food margin

    // Remove from pending
    currentSettlements = currentSettlements.filter((s) => s.id !== settlementId);
  }

  revalidatePath("/admin/dashboard");
  return { success: true, settlements: currentSettlements };
}

export async function quickRestockIngredientAction(ingredientId: string, addQty: number) {
  currentAlerts = currentAlerts.map((alert) => {
    if (alert.id === ingredientId) {
      const newQty = alert.stockQty + addQty;
      return {
        ...alert,
        stockQty: newQty,
        severity: newQty <= alert.threshold ? "warning" : ("critical" as const),
      };
    }
    return alert;
  });

  // Filter out any items that are now well above threshold
  currentAlerts = currentAlerts.filter((a) => a.stockQty < a.threshold * 1.5);

  revalidatePath("/admin/dashboard");
  return { success: true, alerts: currentAlerts };
}
