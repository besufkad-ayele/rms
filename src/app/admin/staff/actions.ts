"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { Staff, StaffRole, EmploymentStatus } from "@/types/database";

const DEFAULT_RESTAURANT_ID = "00000000-0000-0000-0000-000000000001";

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createServerClient();
  }
}

export async function getStaffList(): Promise<Staff[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data as Staff[];
    }
  } catch (err) {
    console.error("Error fetching staff list from Supabase:", err);
  }
  return [];
}

export async function createStaffMember(formData: FormData) {
  const full_name = (formData.get("full_name") as string) || "Staff Personnel";
  const personal_id_number = (formData.get("personal_id_number") as string) || `ETH-FAYDA-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const phone_number = (formData.get("phone_number") as string) || "+251900000000";
  const email = (formData.get("email") as string) || null;
  const emergency_contact_name = (formData.get("emergency_contact_name") as string) || "Family Contact";
  const emergency_contact_phone = (formData.get("emergency_contact_phone") as string) || "+251900000000";
  const address = (formData.get("address") as string) || "Addis Ababa";
  const date_of_birth = (formData.get("date_of_birth") as string) || "1995-01-01";
  const role = (formData.get("role") as StaffRole) || "waiter";
  const base_salary = parseFloat((formData.get("base_salary") as string) || "0");
  const pin_code = (formData.get("pin_code") as string) || "123456";

  const permissions = {
    can_manage_inventory: formData.get("can_manage_inventory") === "on",
    can_view_finance: formData.get("can_view_finance") === "on",
    can_manage_shifts: formData.get("can_manage_shifts") === "on",
    can_manage_staff: formData.get("can_manage_staff") === "on",
  };

  const newStaff = {
    restaurant_id: DEFAULT_RESTAURANT_ID,
    full_name,
    personal_id_number,
    phone_number,
    email,
    emergency_contact_name,
    emergency_contact_phone,
    address,
    date_of_birth,
    date_hired: new Date().toISOString().split("T")[0],
    employment_status: "active",
    role,
    pin_code_hash: pin_code,
    base_salary,
    permissions,
    performance_score: 5.0,
  };

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from("staff").insert([newStaff]).select();
    if (!error && data) {
      revalidatePath("/admin/staff");
      return { success: true, staff: data[0] };
    } else if (error) {
      console.error("Supabase staff creation error:", error.message);
    }
  } catch (err) {
    console.error("Failed to create staff in Supabase:", err);
  }

  revalidatePath("/admin/staff");
  return { success: true };
}

export async function updateStaffPermissions(
  staffId: string,
  role: StaffRole,
  permissions: Staff["permissions"],
  status: EmploymentStatus,
  newPinCode?: string
) {
  try {
    const supabase = await getSupabase();
    const updatePayload: any = { role, permissions, employment_status: status };
    if (newPinCode && newPinCode.trim()) {
      updatePayload.pin_code_hash = newPinCode.trim();
    }

    const { error } = await supabase
      .from("staff")
      .update(updatePayload)
      .eq("id", staffId);

    if (!error) {
      revalidatePath("/admin/staff");
      revalidatePath("/staff-login");
      return { success: true };
    }
  } catch (err) {
    console.error("Failed to update staff in Supabase:", err);
  }

  revalidatePath("/admin/staff");
  revalidatePath("/staff-login");
  return { success: true };
}

// =====================================================================
// ATTENDANCE, LEAVE & TRAINING ACTIONS
// =====================================================================

export async function getAttendanceLogsAction() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("clock_in_logs")
      .select(`
        id,
        clock_in_time,
        clock_out_time,
        status,
        created_at,
        staff:staff_id (full_name, role)
      `)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        staffName: d.staff?.full_name || "Staff Member",
        role: d.staff?.role || "Staff",
        clockIn: new Date(d.clock_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        clockOut: d.clock_out_time
          ? new Date(d.clock_out_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "Shift Active",
        status: d.status || "on_time",
        date: new Date(d.created_at).toLocaleDateString(),
      }));
    }
  } catch (err) {
    console.error("Error fetching attendance logs from Supabase:", err);
  }
  return [];
}

export async function getLeaveRequestsAction() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("leave_requests")
      .select(`
        id,
        leave_type,
        start_date,
        end_date,
        reason,
        status,
        created_at,
        staff:staff_id (full_name)
      `)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        staffName: d.staff?.full_name || "Staff Member",
        type: d.leave_type,
        startDate: d.start_date,
        endDate: d.end_date,
        reason: d.reason || "No reason provided",
        status: d.status,
      }));
    }
  } catch (err) {
    console.error("Error fetching leave requests from Supabase:", err);
  }
  return [];
}

export async function updateLeaveRequestAction(id: string, newStatus: string) {
  try {
    const supabase = await getSupabase();
    await supabase.from("leave_requests").update({ status: newStatus }).eq("id", id);
    revalidatePath("/admin/staff");
    return { success: true };
  } catch (err) {
    console.error("Failed to update leave request status:", err);
    return { success: false };
  }
}

export async function getTrainingChecklistAction() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("training_checklist")
      .select(`
        id,
        staff_id,
        item_name,
        category,
        completed,
        completed_at,
        staff:staff_id (full_name, role)
      `)
      .order("id", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        staffId: d.staff_id,
        staffName: d.staff?.full_name || "Staff Member",
        staffRole: d.staff?.role || "Staff",
        title: d.item_name,
        category: d.category || "General",
        completed: d.completed || false,
        completedAt: d.completed_at,
      }));
    }
  } catch (err) {
    console.error("Error fetching training checklist from Supabase:", err);
  }
  return [];
}

export async function addTrainingChecklistItemAction(
  staffId: string,
  itemName: string,
  category: string
) {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("training_checklist")
      .insert([
        {
          staff_id: staffId,
          item_name: itemName,
          category: category || "General",
          completed: false,
        },
      ])
      .select();

    if (!error && data) {
      revalidatePath("/admin/staff");
      return { success: true, item: data[0] };
    }
  } catch (err) {
    console.error("Failed to add training checklist item:", err);
  }
  return { success: false };
}

export async function toggleTrainingChecklistAction(id: string, completed: boolean) {
  try {
    const supabase = await getSupabase();
    await supabase
      .from("training_checklist")
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq("id", id);
    revalidatePath("/admin/staff");
    return { success: true };
  } catch (err) {
    console.error("Failed to toggle training checklist item:", err);
    return { success: false };
  }
}
