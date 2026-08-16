"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createServerClient();
  }
}

export interface MockAdminOrder {
  id: string;
  orderNumber: string;
  tableCode: string;
  channel: "dine_in" | "takeout" | "delivery";
  status: "placed" | "preparing" | "ready" | "served" | "paid" | "disputed" | "cancelled";
  waiterName: string;
  totalAmount: number;
  calculatedCogs: number;
  createdAt: string;
  customerNotes?: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
  }[];
}

function formatTimeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export async function getOrdersData() {
  try {
    const supabase = await getSupabase();
    const { data: dbOrders, error } = await supabase
      .from("orders")
      .select(`
        id,
        channel,
        status,
        total_amount,
        calculated_cogs,
        customer_notes,
        created_at,
        table:table_id (table_number, unique_code),
        staff:staff_id (full_name),
        order_items (
          quantity,
          unit_price,
          subtotal,
          menu_item:menu_item_id (name)
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && dbOrders && dbOrders.length > 0) {
      const orders: MockAdminOrder[] = dbOrders.map((o: any) => {
        const items = Array.isArray(o.order_items)
          ? o.order_items.map((item: any) => ({
              name: item.menu_item?.name || "Dish Item",
              quantity: item.quantity || 1,
              unitPrice: Number(item.unit_price || 0),
              subtotal: Number(item.subtotal || 0),
            }))
          : [];

        return {
          id: o.id,
          orderNumber: `#KD-${o.id.slice(0, 4).toUpperCase()}`,
          tableCode: o.table?.unique_code || "Takeout",
          channel: (o.channel || "dine_in") as any,
          status: o.status as any,
          waiterName: o.staff?.full_name || "House Attendant",
          totalAmount: Number(o.total_amount || 0),
          calculatedCogs: Number(o.calculated_cogs || 0),
          createdAt: formatTimeAgo(o.created_at),
          customerNotes: o.customer_notes || undefined,
          items: items.length > 0 ? items : [{ name: "Standard Meal Item", quantity: 1, unitPrice: Number(o.total_amount || 0), subtotal: Number(o.total_amount || 0) }],
        };
      });
      return { orders };
    }
  } catch (err) {
    console.error("Error fetching orders from Supabase:", err);
  }

  return { orders: [] };
}

export async function advanceOrderStatusAction(
  orderId: string,
  newStatus: MockAdminOrder["status"]
) {
  try {
    const supabase = await getSupabase();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
  } catch (err) {
    console.error("Failed to advance order status in Supabase:", err);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  const res = await getOrdersData();
  return { success: true, orders: res.orders };
}

export async function disputeOrderAction(orderId: string, reason: string) {
  try {
    const supabase = await getSupabase();
    await supabase
      .from("orders")
      .update({ status: "disputed", customer_notes: `Disputed: ${reason}` })
      .eq("id", orderId);
  } catch (err) {
    console.error("Failed to dispute order in Supabase:", err);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  const res = await getOrdersData();
  return { success: true, orders: res.orders };
}
