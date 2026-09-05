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
        channel,
        customer_notes,
        created_at,
        table:table_id (unique_code, table_number),
        items:order_items (
          id,
          quantity,
          unit_price,
          menu_item:menu_item_id (
            name,
            category
          )
        )
      `)
      .in("status", ["placed", "preparing", "ready"])
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching kitchen orders from Supabase:", error.message);
    }

    if (data) {
      const tickets = data.map((ord: any) => {
        const elapsedMinutes = Math.max(
          1,
          Math.floor((Date.now() - new Date(ord.created_at).getTime()) / (1000 * 60))
        );

        const tableData = Array.isArray(ord.table) ? ord.table[0] : ord.table;

        return {
          id: ord.id,
          orderNumber: `#KD-${ord.id.substring(0, 5).toUpperCase()}`,
          tableCode: tableData?.unique_code || (tableData?.table_number ? `T-${tableData.table_number.toString().padStart(2, "0")}` : "T-01"),
          channel: (ord.channel || "dine_in") as "dine_in" | "takeout" | "delivery",
          status: ord.status as "placed" | "preparing" | "ready",
          elapsedMinutes,
          attendant: "Floor Waiter",
          customerNote: ord.customer_notes || undefined,
          items: (ord.items || []).map((it: any) => {
            const menuData = Array.isArray(it.menu_item) ? it.menu_item[0] : it.menu_item;
            const dishName = menuData?.name || "Artisan Dish";
            const cat = menuData?.category || "main";
            let station: "grill" | "stew" | "starter" | "bar" = "grill";
            if (cat === "starter") station = "starter";
            else if (cat === "drink") station = "bar";
            else if (dishName.toLowerCase().includes("wot") || dishName.toLowerCase().includes("shiro")) station = "stew";

            return {
              name: dishName,
              qty: it.quantity || 1,
              station: station,
              recipeBOM: [
                { ingredient: "Highland Seasoning", amount: "15g" },
                { ingredient: "Niter Kibbeh / Spices", amount: "25g" },
              ],
            };
          }),
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
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/tables");
    revalidatePath("/staff/dashboard");

    return { success: true };
  } catch (err) {
    console.error("Failed to update kitchen order status:", err);
    return { success: false };
  }
}
