"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { TableFloorState } from "@/data/mockDashboard";

const DEFAULT_RESTAURANT_ID = "00000000-0000-0000-0000-000000000001";

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createServerClient();
  }
}

function getSectionForTableNumber(tableNum: number): "Main Dining Hall" | "Terrace Garden" | "Lounge & Bar" | "VIP Alcove" {
  if (tableNum <= 4) return "Terrace Garden";
  if (tableNum <= 16) return "Main Dining Hall";
  if (tableNum <= 19) return "Lounge & Bar";
  return "VIP Alcove";
}

export async function getTablesData() {
  try {
    const supabase = await getSupabase();
    const { data: dbTables, error } = await supabase
      .from("tables")
      .select(`
        id,
        table_number,
        unique_code,
        capacity,
        status,
        assigned_staff_id,
        current_order_id,
        staff:assigned_staff_id (full_name, role),
        order:current_order_id (id, total_amount, created_at)
      `)
      .order("table_number", { ascending: true });

    if (!error && dbTables && dbTables.length > 0) {
      const tables: TableFloorState[] = dbTables.map((t: any) => ({
        id: t.id,
        table_number: t.table_number,
        unique_code: t.unique_code,
        capacity: t.capacity || 4,
        section: getSectionForTableNumber(t.table_number),
        status: t.status as "free" | "occupied" | "reserved",
        assigned_staff_id: t.assigned_staff_id || undefined,
        assigned_staff_name: t.staff?.full_name || undefined,
        assigned_staff_role: t.staff?.role || undefined,
        current_order_id: t.current_order_id || undefined,
        current_order_total: t.order?.total_amount ? Number(t.order.total_amount) : undefined,
        occupied_since_minutes: t.order?.created_at
          ? Math.max(1, Math.floor((Date.now() - new Date(t.order.created_at).getTime()) / (1000 * 60)))
          : undefined,
        active_guest_count: t.status === "occupied" ? Math.min(t.capacity || 4, 4) : undefined,
      }));
      return { tables };
    }
  } catch (err) {
    console.error("Error fetching tables from Supabase:", err);
  }

  return { tables: [] };
}

export async function updateTableDetailsAction(
  tableId: string,
  data: {
    capacity: number;
    section: TableFloorState["section"];
    assignedStaffName: string;
    status: "free" | "occupied" | "reserved";
  }
) {
  try {
    const supabase = await getSupabase();
    const updatePayload: any = {
      capacity: data.capacity,
      status: data.status,
    };
    if (data.status === "free") {
      updatePayload.current_order_id = null;
    }
    await supabase.from("tables").update(updatePayload).eq("id", tableId);
  } catch (err) {
    console.error("Failed to update table details in Supabase:", err);
  }

  revalidatePath("/admin/tables");
  revalidatePath("/admin/dashboard");
  const result = await getTablesData();
  return { success: true, tables: result.tables };
}

export async function createNewTableAction(data: {
  tableNumber: number;
  capacity: number;
  section: TableFloorState["section"];
  assignedStaffName: string;
}) {
  const code = `T-${data.tableNumber.toString().padStart(2, "0")}`;

  try {
    const supabase = await getSupabase();
    await supabase.from("tables").insert([
      {
        restaurant_id: DEFAULT_RESTAURANT_ID,
        table_number: data.tableNumber,
        capacity: data.capacity,
        unique_code: code,
        status: "free",
      },
    ]);
  } catch (err) {
    console.error("Failed to create new table in Supabase:", err);
  }

  revalidatePath("/admin/tables");
  revalidatePath("/admin/dashboard");
  const result = await getTablesData();
  return { success: true, tables: result.tables };
}
