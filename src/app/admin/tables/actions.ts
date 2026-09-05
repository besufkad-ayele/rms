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

function getSectionForTableNumber(tableNum: number): string {
  if (tableNum <= 4) return "Open Terrace";
  if (tableNum <= 10) return "Main Dining Hall";
  if (tableNum <= 13) return "Lounge & Bar";
  return "VIP Alcove";
}

export interface AvailableStaff {
  id: string;
  fullName: string;
  role: string;
  phone?: string;
}

export async function getAvailableWaitersAction(): Promise<AvailableStaff[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("staff")
      .select("id, full_name, role, phone_number")
      .eq("role", "waiter")
      .eq("employment_status", "active")
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error fetching available staff from Supabase:", error.message);
      return [];
    }

    if (data) {
      return data.map((s: any) => ({
        id: s.id,
        fullName: s.full_name,
        role: s.role,
        phone: s.phone_number,
      }));
    }
  } catch (err) {
    console.error("Exception fetching available staff:", err);
  }
  return [];
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
        section_name,
        assigned_staff_id,
        current_order_id,
        staff:assigned_staff_id (id, full_name, role)
      `)
      .order("table_number", { ascending: true });

    if (error) {
      console.error("Error fetching tables from Supabase:", error);
    }

    if (dbTables && dbTables.length > 0) {
      const tables: TableFloorState[] = dbTables.map((t: any) => {
        const staffObj = Array.isArray(t.staff) ? t.staff[0] : t.staff;
        return {
          id: t.id,
          table_number: t.table_number,
          unique_code: t.unique_code,
          capacity: t.capacity || 4,
          section: (t.section_name as any) || getSectionForTableNumber(t.table_number),
          status: t.status as "free" | "occupied" | "reserved",
          assigned_staff_id: t.assigned_staff_id || undefined,
          assigned_staff_name: staffObj?.full_name || undefined,
          assigned_staff_role: staffObj?.role || undefined,
          current_order_id: t.current_order_id || undefined,
        };
      });
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
    section: string;
    assignedStaffId?: string | null;
    status: "free" | "occupied" | "reserved";
  }
) {
  try {
    const supabase = await getSupabase();
    const updatePayload: any = {
      capacity: data.capacity,
      section_name: data.section,
      status: data.status,
      assigned_staff_id: data.assignedStaffId || null,
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
  revalidatePath("/staff/dashboard");
  const result = await getTablesData();
  return { success: true, tables: result.tables };
}

export async function createNewTableAction(data: {
  tableNumber: number;
  capacity: number;
  section: string;
  assignedStaffId?: string | null;
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
        assigned_staff_id: data.assignedStaffId || null,
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
  revalidatePath("/staff/dashboard");
  const result = await getTablesData();
  return { success: true, tables: result.tables };
}

export async function deleteTableAction(tableId: string) {
  try {
    const supabase = await getSupabase();
    await supabase.from("tables").delete().eq("id", tableId);
  } catch (err) {
    console.error("Failed to delete table in Supabase:", err);
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

export async function createDiningSectionAction(name: string, description?: string) {
  try {
    const supabase = await getSupabase();
    const existing = await getDiningSectionsAction();
    const displayOrder = existing.length + 1;

    const { error } = await supabase.from("dining_sections").insert([
      {
        restaurant_id: DEFAULT_RESTAURANT_ID,
        name,
        description: description || null,
        display_order: displayOrder,
      },
    ]);
    if (error) {
      return { success: false, message: error.message, sections: await getDiningSectionsAction() };
    }
  } catch (err: any) {
    console.error("Failed to create dining section:", err);
    return { success: false, message: err.message, sections: await getDiningSectionsAction() };
  }

  revalidatePath("/admin/tables");
  return { success: true, message: `Section "${name}" created successfully!`, sections: await getDiningSectionsAction() };
}

export async function updateDiningSectionAction(id: string, name: string, description?: string) {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase.from("dining_sections").update({ name, description }).eq("id", id);
    if (error) {
      return { success: false, message: error.message, sections: await getDiningSectionsAction() };
    }
  } catch (err: any) {
    console.error("Failed to update dining section:", err);
    return { success: false, message: err.message, sections: await getDiningSectionsAction() };
  }

  revalidatePath("/admin/tables");
  return { success: true, message: `Section "${name}" updated successfully!`, sections: await getDiningSectionsAction() };
}

export async function deleteDiningSectionAction(id: string) {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase.from("dining_sections").delete().eq("id", id);
    if (error) {
      return { success: false, message: error.message, sections: await getDiningSectionsAction() };
    }
  } catch (err: any) {
    console.error("Failed to delete dining section:", err);
    return { success: false, message: err.message, sections: await getDiningSectionsAction() };
  }

  revalidatePath("/admin/tables");
  return { success: true, message: "Section deleted successfully!", sections: await getDiningSectionsAction() };
}
