"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { requirePermission, UNAUTHORIZED } from "@/lib/auth/guards";

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
  const session = await requirePermission("can_manage_shifts");
  if (!session) return { shifts: [] };

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

export async function getStaffOptionsForRosterAction() {
  const session = await requirePermission("can_manage_shifts");
  if (!session) return [];

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("staff")
      .select("id, full_name, role, employment_status")
      .eq("employment_status", "active")
      .order("full_name", { ascending: true });

    if (!error && data) return data;
  } catch (err) {
    console.error("Error loading staff options for roster:", err);
  }
  return [];
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
  const session = await requirePermission("can_manage_shifts");
  if (!session) return UNAUTHORIZED;

  if (!data.staffId || data.staffId.startsWith("stf-")) {
    return { success: false as const, message: "Select a real staff member from the roster.", shifts: [] as MockShiftItem[] };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const parseLocal = (date: string, time: string) => {
    const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) {
      // Fallback: treat as HH:MM 24h
      return new Date(`${date}T${time}:00`);
    }
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    return new Date(`${date}T${hh}:${mm}:00`);
  };

  const startDate = parseLocal(data.shiftDate, data.scheduledStart);
  const endDate = parseLocal(data.shiftDate, data.scheduledEnd);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { success: false as const, message: "Invalid shift date/time.", shifts: [] as MockShiftItem[] };
  }

  try {
    const supabase = await getSupabase();
    const { error } = await supabase.from("shifts").insert([
      {
        restaurant_id: DEFAULT_RESTAURANT_ID,
        staff_id: data.staffId,
        shift_date: data.shiftDate,
        scheduled_start: startDate.toISOString(),
        scheduled_end: endDate.toISOString(),
        clock_in_code: code,
        status: "scheduled",
        assigned_tables: data.assignedTables,
        notes: data.notes || null,
        created_by: session.id,
      },
    ]);
    if (error) {
      console.error("Failed to create shift in Supabase:", error.message);
      return { success: false as const, message: error.message, shifts: [] as MockShiftItem[] };
    }
  } catch (err) {
    console.error("Failed to create shift in Supabase:", err);
    return { success: false as const, message: "Shift create failed.", shifts: [] as MockShiftItem[] };
  }

  revalidatePath("/admin/shifts");
  revalidatePath("/admin/staff");
  const result = await getShiftsData();
  return { success: true as const, shifts: result.shifts, message: `Shift created. Clock-in code: ${code}` };
}

export async function updateShiftStatusAction(
  shiftId: string,
  status: "scheduled" | "checked_in" | "late" | "completed" | "missed"
) {
  const session = await requirePermission("can_manage_shifts");
  if (!session) return UNAUTHORIZED;

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
  const session = await requirePermission("can_manage_shifts");
  if (!session) return UNAUTHORIZED;

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
