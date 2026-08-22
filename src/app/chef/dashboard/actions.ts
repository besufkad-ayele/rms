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

export async function getKitchenOrdersAction() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        status,
        order_type,
        special_instructions,
        created_at,
        table:table_id (unique_code),
        items:order_items (
          id,
          title,
          quantity,
          unit_price
        )
      `)
      .in("status", ["placed", "preparing", "ready"])
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      const tickets = data.map((ord: any) => {
        const elapsedMinutes = Math.max(
          1,
          Math.floor((Date.now() - new Date(ord.created_at).getTime()) / (1000 * 60))
        );

        return {
          id: ord.id,
          orderNumber: `#KD-${ord.id.substring(0, 5).toUpperCase()}`,
          tableCode: ord.table?.unique_code || "T-01",
          channel: ord.order_type || "dine_in",
          status: ord.status as "placed" | "preparing" | "ready",
          elapsedMinutes,
          attendant: "Floor Waiter",
          customerNote: ord.special_instructions || undefined,
          items: (ord.items || []).map((it: any) => ({
            name: it.title,
            qty: it.quantity || 1,
            station: "grill" as const,
            recipeBOM: [
              { ingredient: "Highland Spices", amount: "15g" },
              { ingredient: "Niter Kibbeh", amount: "30g" },
            ],
          })),
        };
      });

      return { tickets };
    }
  } catch (err) {
    console.error("Error fetching kitchen orders from Supabase:", err);
  }

  return { tickets: [] };
}

export async function updateKitchenOrderStatusAction(
  orderId: string,
  newStatus: "placed" | "preparing" | "ready" | "served"
) {
  try {
    const supabase = await getSupabase();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);

    revalidatePath("/chef/dashboard");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/tables");

    return { success: true };
  } catch (err) {
    console.error("Failed to update kitchen order status:", err);
    return { success: false };
  }
}
