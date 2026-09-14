"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { requireFloorStaff, requireStaffTerminal, UNAUTHORIZED } from "@/lib/auth/guards";
import { computeBill } from "@/lib/utils";
import { issueReceiptNumber, loadReceiptForOrder } from "@/lib/receipts-server";
import {
  loadTableServiceHistory,
  logTableServiceEvent,
  TableServiceHistory,
} from "@/lib/table-service-analytics";

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createServerClient();
  }
}

export interface StaffStationTable {
  id: string;
  code: string;
  tableNumber: number;
  section: string;
  status: "free" | "occupied" | "reserved";
  capacity: number;
  guests?: number;
  elapsedMinutes?: number;
  billTotal?: number;
  activeOrderId?: string;
  activeOrder?: string;
  foodStatus?: "placed" | "preparing" | "ready" | "served";
  assignedStaffId?: string;
  pendingPayMethod?: "cbe_birr" | "telebirr" | "cash";
  pendingPayAccount?: string;
}

export async function getStaffLiveTablesAction(
  staffId?: string,
  onlyAssigned: boolean = false
): Promise<{ tables: StaffStationTable[]; myCount: number; totalCount: number }> {
  const session = await requireStaffTerminal();
  if (!session) return { tables: [], myCount: 0, totalCount: 0 };
  const scopedStaffId = staffId && staffId === session.id ? staffId : session.id;

  try {
    const supabase = await getSupabase();

    // 1. Fetch tables
    const { data: dbTables, error: tableErr } = await supabase
      .from("tables")
      .select("id, table_number, unique_code, capacity, status, section_name, assigned_staff_id, current_order_id")
      .order("table_number", { ascending: true });

    if (tableErr) {
      console.error("Staff tables fetch error:", tableErr.message);
      return { tables: [], myCount: 0, totalCount: 0 };
    }

    // 2. Fetch active orders
    const activeOrderIds = (dbTables || [])
      .map((t: any) => t.current_order_id)
      .filter(Boolean);

    let ordersMap: Record<string, any> = {};
    if (activeOrderIds.length > 0) {
      const { data: dbOrders } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          total_amount,
          created_at,
          order_items (
            quantity,
            menu_item:menu_item_id (name)
          )
        `)
        .in("id", activeOrderIds);

      const { data: pendingPayments } = await supabase
        .from("payments")
        .select("order_id, amount, status, method, transaction_reference")
        .in("order_id", activeOrderIds)
        .eq("status", "pending");

      const pendingByOrder = new Map<
        string,
        { amount: number; method?: string; account?: string }
      >();
      (pendingPayments || []).forEach((p: any) => {
        const dbMethod = p.method as string;
        const guestMethod =
          dbMethod === "cbe_transfer"
            ? "cbe_birr"
            : dbMethod === "telegram"
              ? "telebirr"
              : "cash";
        pendingByOrder.set(p.order_id, {
          amount: Number(p.amount || 0),
          method: guestMethod,
          account: p.transaction_reference || undefined,
        });
      });

      if (dbOrders) {
        dbOrders.forEach((o: any) => {
          const itemsSummary = (o.order_items || [])
            .map((it: any) => {
              const name = it.menu_item?.name || "Dish Item";
              return `${it.quantity}x ${name}`;
            })
            .join(", ");

          const elapsed = Math.max(1, Math.floor((Date.now() - new Date(o.created_at).getTime()) / (1000 * 60)));
          const pending = pendingByOrder.get(o.id);
          const billTotal =
            pending?.amount && pending.amount > 0
              ? pending.amount
              : computeBill(Number(o.total_amount || 0)).total;

          ordersMap[o.id] = {
            id: o.id,
            status: o.status,
            total_amount: Number(o.total_amount || 0),
            billTotal,
            pendingPayMethod: pending?.method,
            pendingPayAccount: pending?.account,
            itemsSummary: itemsSummary || "Standard Serving",
            elapsedMinutes: elapsed,
          };
        });
      }
    }

    const allTables: StaffStationTable[] = (dbTables || []).map((t: any) => {
      const activeOrder = t.current_order_id ? ordersMap[t.current_order_id] : null;

      return {
        id: t.id,
        code: t.unique_code,
        tableNumber: t.table_number,
        section: t.section_name || "Main Dining Hall",
        status: t.status as "free" | "occupied" | "reserved",
        capacity: t.capacity || 4,
        guests: t.status === "occupied" ? Math.min(t.capacity || 4, 4) : undefined,
        elapsedMinutes: activeOrder?.elapsedMinutes,
        billTotal: activeOrder?.billTotal,
        activeOrderId: activeOrder?.id,
        activeOrder: activeOrder?.itemsSummary,
        foodStatus: activeOrder?.status as any,
        assignedStaffId: t.assigned_staff_id || undefined,
        pendingPayMethod: activeOrder?.pendingPayMethod,
        pendingPayAccount: activeOrder?.pendingPayAccount,
      };
    });

    const myTables = allTables.filter((t) => t.assignedStaffId === scopedStaffId);
    const finalTables = onlyAssigned ? myTables : allTables;

    return {
      tables: finalTables,
      myCount: myTables.length,
      totalCount: allTables.length,
    };
  } catch (err) {
    console.error("Staff dashboard fetch exception:", err);
    return { tables: [], myCount: 0, totalCount: 0 };
  }
}

export async function claimTableAction(tableCode: string, staffId: string) {
  const session = await requireFloorStaff();
  if (!session) return UNAUTHORIZED;
  if (staffId && staffId !== session.id) return UNAUTHORIZED;

  try {
    const supabase = await getSupabase();
    await supabase
      .from("tables")
      .update({ assigned_staff_id: session.id })
      .eq("unique_code", tableCode);

    revalidatePath("/staff/dashboard");
    revalidatePath("/admin/tables");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Error claiming table:", err);
    return { success: false };
  }
}

const NEXT_FOOD_STATUS: Record<string, "preparing" | "ready" | "served"> = {
  placed: "preparing",
  preparing: "ready",
  ready: "served",
};

function revalidateFloor() {
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/cashier");
  revalidatePath("/cashier");
  revalidatePath("/chef/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/tables");
}

export async function markOrderServedAction(orderId: string) {
  return advanceOrderStatusAction(orderId, "served");
}

export async function advanceOrderStatusAction(
  orderId: string,
  forceStatus?: "preparing" | "ready" | "served"
) {
  const session = await requireFloorStaff();
  if (!session) return UNAUTHORIZED;

  try {
    const supabase = await getSupabase();
    const { data: order } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) return { success: false, message: "Order not found." };
    if (order.status === "paid" || order.status === "cancelled") {
      return { success: false, message: "This order is already closed." };
    }

    const nextStatus = forceStatus || NEXT_FOOD_STATUS[order.status];
    if (!nextStatus) {
      return { success: false, message: "Ask the cashier to settle this table." };
    }

    await supabase.from("orders").update({ status: nextStatus }).eq("id", orderId);
    revalidateFloor();
    return { success: true, status: nextStatus };
  } catch (err) {
    console.error("Error advancing order status:", err);
    return { success: false };
  }
}

export async function settleTableBillAction(
  tableCode: string,
  orderId?: string,
  method: "cash" | "cbe_birr" | "telebirr" = "cash",
  _amount: number = 0,
  transactionReference?: string
) {
  const session = await requireFloorStaff();
  if (!session) return UNAUTHORIZED;

  try {
    const supabase = await getSupabase();
    const dbMethod = method === "cash" ? "cash" : method === "cbe_birr" ? "cbe_transfer" : "telegram";

    if (orderId) {
      const { data: order } = await supabase
        .from("orders")
        .select("id, total_amount, status")
        .eq("id", orderId)
        .maybeSingle();

      if (!order) return { success: false, message: "Order not found." };

      const { data: pending } = await supabase
        .from("payments")
        .select("id, amount, tip_amount, transaction_reference")
        .eq("order_id", orderId)
        .eq("status", "pending")
        .maybeSingle();

      let paymentId = pending?.id;
      if (paymentId) {
        await supabase
          .from("payments")
          .update({
            status: "confirmed",
            confirmed_by: session.id,
            confirmed_at: new Date().toISOString(),
            method: dbMethod,
            transaction_reference:
              transactionReference?.trim() || pending.transaction_reference || null,
          })
          .eq("id", paymentId);
      } else {
        const billTotal = computeBill(Number(order.total_amount)).total;
        const { data: inserted } = await supabase
          .from("payments")
          .insert([
            {
              order_id: orderId,
              method: dbMethod,
              amount: billTotal,
              status: "confirmed",
              confirmed_by: session.id,
              confirmed_at: new Date().toISOString(),
              transaction_reference: transactionReference || null,
            },
          ])
          .select("id")
          .single();
        paymentId = inserted?.id;
      }

      if (paymentId) {
        await issueReceiptNumber(supabase, paymentId);
      }

      await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
    }

    const { data: clearedTable } = await supabase
      .from("tables")
      .select("id, assigned_staff_id")
      .eq("unique_code", tableCode)
      .maybeSingle();

    await supabase
      .from("tables")
      .update({ status: "free", current_order_id: null })
      .eq("unique_code", tableCode);

    if (clearedTable?.id) {
      await logTableServiceEvent(supabase, {
        tableId: clearedTable.id,
        staffId: session.id,
        orderId: orderId || null,
        eventType: "table_cleared",
        notes: `Settled via ${method}`,
      });
    }

    revalidateFloor();
    revalidatePath("/admin/finance");

    const receipt = orderId ? await loadReceiptForOrder(supabase, orderId) : null;
    return { success: true, receipt };
  } catch (err) {
    console.error("Error settling table bill:", err);
    return { success: false };
  }
}

export type { TableServiceHistory };

export interface OrderTicketItem {
  name: string;
  qty: number;
  omittedIngredients: string[];
  extras: { name: string; price: number }[];
  chefNote?: string;
}

export interface OrderTicketDetail {
  orderId: string;
  status: string;
  customerNote?: string;
  items: OrderTicketItem[];
}

/** Full order detail (with per-item customization) for the waiter "Check order" popup. */
export async function getOrderTicketAction(
  orderId: string
): Promise<OrderTicketDetail | null> {
  const session = await requireStaffTerminal();
  if (!session) return null;

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        customer_notes,
        order_items (
          quantity,
          kitchen_notes,
          customization,
          menu_item:menu_item_id (name)
        )
      `)
      .eq("id", orderId)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error("getOrderTicketAction:", error.message);
      return null;
    }

    return {
      orderId: data.id,
      status: data.status,
      customerNote: data.customer_notes || undefined,
      items: (data.order_items || []).map((it: any) => {
        const menuData = Array.isArray(it.menu_item) ? it.menu_item[0] : it.menu_item;
        const custom = it.customization || null;
        return {
          name: menuData?.name || "Dish Item",
          qty: it.quantity || 1,
          omittedIngredients: custom?.omittedIngredients || [],
          extras: (custom?.selectedExtras || []).map((e: any) => ({
            name: e.name,
            price: Number(e.price || 0),
          })),
          chefNote: custom?.chefNote || it.kitchen_notes || undefined,
        };
      }),
    };
  } catch (err) {
    console.error("getOrderTicketAction exception:", err);
    return null;
  }
}

/** Staff-only analytics for dashboards and future gamification — not exposed to guests. */
export async function getStaffTableServiceHistoryAction(
  tableCode: string
): Promise<TableServiceHistory | null> {
  const session = await requireFloorStaff();
  if (!session) return null;

  try {
    const supabase = await getSupabase();
    return await loadTableServiceHistory(supabase, tableCode);
  } catch (err) {
    console.error("getStaffTableServiceHistoryAction:", err);
    return null;
  }
}
