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
}

export async function getStaffLiveTablesAction(
  staffId?: string,
  onlyAssigned: boolean = false
): Promise<{ tables: StaffStationTable[]; myCount: number; totalCount: number }> {
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

      if (dbOrders) {
        dbOrders.forEach((o: any) => {
          const itemsSummary = (o.order_items || [])
            .map((it: any) => {
              const name = it.menu_item?.name || "Dish Item";
              return `${it.quantity}x ${name}`;
            })
            .join(", ");

          const elapsed = Math.max(1, Math.floor((Date.now() - new Date(o.created_at).getTime()) / (1000 * 60)));

          ordersMap[o.id] = {
            id: o.id,
            status: o.status,
            total_amount: Number(o.total_amount || 0),
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
        billTotal: activeOrder ? Math.round(activeOrder.total_amount * 1.15 * 1.1) : undefined,
        activeOrderId: activeOrder?.id,
        activeOrder: activeOrder?.itemsSummary,
        foodStatus: activeOrder?.status as any,
        assignedStaffId: t.assigned_staff_id || undefined,
      };
    });

    const myTables = staffId ? allTables.filter((t) => t.assignedStaffId === staffId) : allTables;
    const finalTables = onlyAssigned && staffId ? myTables : allTables;

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
  try {
    const supabase = await getSupabase();
    await supabase
      .from("tables")
      .update({ assigned_staff_id: staffId })
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

export async function markOrderServedAction(orderId: string) {
  try {
    const supabase = await getSupabase();
    await supabase.from("orders").update({ status: "served" }).eq("id", orderId);

    revalidatePath("/staff/dashboard");
    revalidatePath("/chef/dashboard");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/orders");

    return { success: true };
  } catch (err) {
    console.error("Error marking order served:", err);
    return { success: false };
  }
}

export async function settleTableBillAction(
  tableCode: string,
  orderId?: string,
  method: "cash" | "cbe_birr" | "telebirr" = "cash",
  amount: number = 0
) {
  try {
    const supabase = await getSupabase();
    const dbMethod = method === "cash" ? "cash" : method === "cbe_birr" ? "cbe_transfer" : "telegram";

    if (orderId) {
      // 1. Insert Payment
      await supabase.from("payments").insert([
        {
          order_id: orderId,
          method: dbMethod,
          amount: amount,
          status: "confirmed",
          created_at: new Date().toISOString(),
        },
      ]);

      // 2. Mark order paid
      await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
    }

    // 3. Clear table
    await supabase
      .from("tables")
      .update({ status: "free", current_order_id: null })
      .eq("unique_code", tableCode);

    revalidatePath("/staff/dashboard");
    revalidatePath("/chef/dashboard");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/tables");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/finance");

    return { success: true };
  } catch (err) {
    console.error("Error settling table bill:", err);
    return { success: false };
  }
}
