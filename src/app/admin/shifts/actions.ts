"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

const DEFAULT_RESTAURANT_ID = "00000000-0000-0000-0000-000000000001";

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createServerClient();
  }
}

export interface MockShiftItem {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  avatarUrl?: string;
  shiftDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualClockIn?: string | null;
  actualClockOut?: string | null;
  clockInCode: string;
  status: "scheduled" | "checked_in" | "late" | "completed" | "missed";
  assignedTables: string[];
  notes?: string;
}

export async function getShiftsData() {
  try {
    const supabase = await getSupabase();
    const { data: dbShifts, error } = await supabase
      .from("shifts")
      .select(`
        id,
        staff_id,
        shift_date,
        scheduled_start,
        scheduled_end,
        actual_clock_in,
        actual_clock_out,
        clock_in_code,
        status,
        assigned_tables,
        notes,
        staff:staff_id (full_name, role)
      `)
      .order("shift_date", { ascending: false });

    if (!error && dbShifts && dbShifts.length > 0) {
      const shifts: MockShiftItem[] = dbShifts.map((s: any) => ({
        id: s.id,
        staffId: s.staff_id,
        staffName: s.staff?.full_name || "Staff Personnel",
        staffRole: s.staff?.role || "waiter",
        shiftDate: s.shift_date,
        scheduledStart: new Date(s.scheduled_start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        scheduledEnd: new Date(s.scheduled_end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actualClockIn: s.actual_clock_in ? new Date(s.actual_clock_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null,
        actualClockOut: s.actual_clock_out ? new Date(s.actual_clock_out).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null,
        clockInCode: s.clock_in_code,
        status: s.status as any,
        assignedTables: s.assigned_tables || [],
        notes: s.notes || undefined,
      }));
      return { shifts };
    }
  } catch (err) {
    console.error("Error fetching shifts from Supabase:", err);
  }

  return { shifts: [] };
}

export async function createShiftAction(data: {
  staffId: string;
  staffName: string;
  staffRole: string;
  shiftDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  assignedTables: string[];
  notes?: string;
}) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const startIso = new Date(`${data.shiftDate} ${data.scheduledStart}`).toISOString();
  const endIso = new Date(`${data.shiftDate} ${data.scheduledEnd}`).toISOString();

  try {
    const supabase = await getSupabase();
    await supabase.from("shifts").insert([
      {
        restaurant_id: DEFAULT_RESTAURANT_ID,
        staff_id: data.staffId,
        shift_date: data.shiftDate,
        scheduled_start: startIso,
        scheduled_end: endIso,
        clock_in_code: code,
        status: "scheduled",
        assigned_tables: data.assignedTables,
        notes: data.notes || null,
      },
    ]);
  } catch (err) {
    console.error("Failed to create shift in Supabase:", err);
  }

  revalidatePath("/admin/shifts");
  const result = await getShiftsData();
  return { success: true, shifts: result.shifts };
}

export async function updateShiftStatusAction(
  shiftId: string,
  status: "scheduled" | "checked_in" | "late" | "completed" | "missed"
) {
  try {
    const supabase = await getSupabase();
    const updatePayload: any = { status };
    const nowIso = new Date().toISOString();

    if (status === "checked_in" || status === "late") {
      updatePayload.actual_clock_in = nowIso;
    } else if (status === "completed") {
      updatePayload.actual_clock_out = nowIso;
    }

    await supabase.from("shifts").update(updatePayload).eq("id", shiftId);
  } catch (err) {
    console.error("Failed to update shift status in Supabase:", err);
  }

  revalidatePath("/admin/shifts");
  const result = await getShiftsData();
  return { success: true, shifts: result.shifts };
}

export async function regenerateShiftCodeAction(shiftId: string) {
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    const supabase = await getSupabase();
    await supabase.from("shifts").update({ clock_in_code: newCode }).eq("id", shiftId);
  } catch (err) {
    console.error("Failed to regenerate clock in code in Supabase:", err);
  }

  revalidatePath("/admin/shifts");
  return { success: true, newCode };
}
