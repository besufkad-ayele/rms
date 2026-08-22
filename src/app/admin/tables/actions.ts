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

function getSectionForTableNumber(tableNum: number): "Main Dining Hall" | "Open Terrace" | "Lounge & Bar" | "VIP Alcove" {
  if (tableNum <= 4) return "Open Terrace";
  if (tableNum <= 10) return "Main Dining Hall";
  if (tableNum <= 13) return "Lounge & Bar";
  return "VIP Alcove";
}

export async function getTablesData() {
  try {
    const supabase = await getSupabase();
    const { data: dbTables, error } = await supabase
      .from("tables")
      .select("id, table_number, unique_code, capacity, status, section_name, assigned_staff_id, current_order_id")
      .order("table_number", { ascending: true });

    if (error) {
      console.error("Error fetching tables from Supabase:", error);
    }

    if (dbTables && dbTables.length > 0) {
      const tables: TableFloorState[] = dbTables.map((t: any) => ({
        id: t.id,
        table_number: t.table_number,
        unique_code: t.unique_code,
        capacity: t.capacity || 4,
        section: (t.section_name as any) || getSectionForTableNumber(t.table_number),
        status: t.status as "free" | "occupied" | "reserved",
        assigned_staff_id: t.assigned_staff_id || undefined,
        current_order_id: t.current_order_id || undefined,
      }));
      return { tables };
    }
  } catch (err) {
    console.error("Exception fetching tables from Supabase:", err);
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
      section_name: data.section,
      status: data.status,
    };
    if (data.status === "free") {
      updatePayload.current_order_id = null;
    }
    const { error } = await supabase.from("tables").update(updatePayload).eq("id", tableId);
    if (error) {
      console.error("Failed to update table in Supabase:", error);
    }
  } catch (err) {
    console.error("Failed to update table details in Supabase:", err);
  }

  revalidatePath("/admin/tables");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/qr-codes");
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
    const { error } = await supabase.from("tables").insert([
      {
        restaurant_id: DEFAULT_RESTAURANT_ID,
        table_number: data.tableNumber,
        capacity: data.capacity,
        unique_code: code,
        section_name: data.section,
        status: "free",
      },
    ]);
    if (error) {
      console.error("Failed to create table in Supabase:", error);
      const res = await getTablesData();
      return { success: false, error: error.message, tables: res.tables };
    }
  } catch (err: any) {
    console.error("Failed to create new table in Supabase:", err);
    const res = await getTablesData();
    return { success: false, error: err.message, tables: res.tables };
  }

  revalidatePath("/admin/tables");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/qr-codes");
  const result = await getTablesData();
  return { success: true, tables: result.tables };
}

export interface DiningSection {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  display_order: number;
}

export async function getDiningSectionsAction(): Promise<DiningSection[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("dining_sections")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as DiningSection[];
    }
  } catch (err) {
    console.error("Error fetching dining sections:", err);
  }

  return [
    { id: "sec-1", restaurant_id: DEFAULT_RESTAURANT_ID, name: "Main Dining Hall", description: "Ground floor main dining hall", display_order: 1 },
    { id: "sec-2", restaurant_id: DEFAULT_RESTAURANT_ID, name: "Open Terrace", description: "Rooftop terrace view", display_order: 2 },
    { id: "sec-3", restaurant_id: DEFAULT_RESTAURANT_ID, name: "Lounge & Bar", description: "Cocktails and craft beverages", display_order: 3 },
    { id: "sec-4", restaurant_id: DEFAULT_RESTAURANT_ID, name: "VIP Alcove", description: "Private booth seating", display_order: 4 },
  ];
}
