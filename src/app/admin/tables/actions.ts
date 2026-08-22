"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { TableFloorState } from "@/data/mockDashboard";

const DEFAULT_RESTAURANT_ID = "00000000-0000-0000-0000-000000000001";

export interface DiningSection {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  display_order: number;
  created_at?: string;
}

const DEFAULT_SECTIONS: DiningSection[] = [
  { id: "d1", restaurant_id: DEFAULT_RESTAURANT_ID, name: "Main Dining Hall", description: "Primary indoor dining hall", display_order: 1 },
  { id: "d2", restaurant_id: DEFAULT_RESTAURANT_ID, name: "Terrace Garden", description: "Outdoor garden dining patio", display_order: 2 },
  { id: "d3", restaurant_id: DEFAULT_RESTAURANT_ID, name: "Lounge & Bar", description: "Highland coffee & cocktail lounge", display_order: 3 },
  { id: "d4", restaurant_id: DEFAULT_RESTAURANT_ID, name: "VIP Alcove", description: "Exclusive private dining rooms", display_order: 4 },
];

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createServerClient();
  }
}

function getSectionForTableNumber(tableNum: number): string {
  if (tableNum <= 4) return "Terrace Garden";
  if (tableNum <= 16) return "Main Dining Hall";
  if (tableNum <= 19) return "Lounge & Bar";
  return "VIP Alcove";
}

// =====================================================================
// DINING SECTIONS CRUD ACTIONS
// =====================================================================

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
    console.error("Error fetching dining sections from Supabase:", err);
  }
  return DEFAULT_SECTIONS;
}

export async function createDiningSectionAction(name: string, description?: string) {
  const cleanName = name.trim();
  if (!cleanName) return { success: false, message: "Section name is required." };

  try {
    const supabase = await getSupabase();
    const { data: existing } = await supabase
      .from("dining_sections")
      .select("id")
      .eq("name", cleanName)
      .maybeSingle();

    if (existing) {
      return { success: false, message: "A section with this name already exists." };
    }

    const { data, error } = await supabase
      .from("dining_sections")
      .insert([
        {
          restaurant_id: DEFAULT_RESTAURANT_ID,
          name: cleanName,
          description: description?.trim() || null,
          display_order: 10,
        },
      ])
      .select();

    if (!error && data) {
      revalidatePath("/admin/tables");
      revalidatePath("/admin/dashboard");
      return { success: true, section: data[0] };
    }
  } catch (err) {
    console.error("Failed to create dining section:", err);
  }

  return { success: false, message: "Failed to create section in database." };
}

export async function updateDiningSectionAction(sectionId: string, name: string, description?: string) {
  const cleanName = name.trim();
  if (!cleanName) return { success: false, message: "Section name cannot be empty." };

  try {
    const supabase = await getSupabase();
    const { error } = await supabase
      .from("dining_sections")
      .update({ name: cleanName, description: description?.trim() || null })
      .eq("id", sectionId);

    if (!error) {
      revalidatePath("/admin/tables");
      revalidatePath("/admin/dashboard");
      return { success: true };
    }
  } catch (err) {
    console.error("Failed to update dining section:", err);
  }

  return { success: false, message: "Failed to update section in database." };
}

export async function deleteDiningSectionAction(sectionId: string) {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase.from("dining_sections").delete().eq("id", sectionId);
    if (!error) {
      revalidatePath("/admin/tables");
      revalidatePath("/admin/dashboard");
      return { success: true };
    }
  } catch (err) {
    console.error("Failed to delete dining section:", err);
  }

  return { success: false, message: "Failed to delete section from database." };
}

// =====================================================================
// TABLES CRUD ACTIONS
// =====================================================================

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
        section_name,
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
        section: (t.section_name || getSectionForTableNumber(t.table_number)) as any,
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
    section: string;
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
  section: string;
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
        section_name: data.section,
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

export async function deleteTableAction(tableId: string) {
  try {
    const supabase = await getSupabase();
    await supabase.from("tables").delete().eq("id", tableId);
  } catch (err) {
    console.error("Failed to delete table from Supabase:", err);
  }

  revalidatePath("/admin/tables");
  revalidatePath("/admin/dashboard");
  const result = await getTablesData();
  return { success: true, tables: result.tables };
}
