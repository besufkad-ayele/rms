"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { Staff, StaffRole, EmploymentStatus, StaffPermissions } from "@/types/database";
import { hashPin } from "@/lib/auth/pins";
import { requirePermission, getVerifiedSession, UNAUTHORIZED } from "@/lib/auth/guards";

const DEFAULT_RESTAURANT_ID = "00000000-0000-0000-0000-000000000001";

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createServerClient();
  }
}

async function writeActivityLog(input: {
  actorStaffId?: string | null;
  actorName?: string | null;
  moduleId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase.from("activity_logs").insert([
      {
        restaurant_id: DEFAULT_RESTAURANT_ID,
        actor_staff_id: input.actorStaffId || null,
        actor_name: input.actorName || null,
        module_id: input.moduleId,
        action: input.action,
        entity_type: input.entityType || null,
        entity_id: input.entityId || null,
        details: input.details || {},
      },
    ]);
    if (error) {
      // Table may not exist until migration is applied — non-blocking
      console.warn("activity_logs insert skipped:", error.message);
    }
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}

export async function getStaffList(): Promise<Staff[]> {
  const session = await requirePermission("can_manage_staff");
  if (!session) return [];

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return (data as Staff[]).map((staff) => ({ ...staff, pin_code_hash: "" }));
    }
  } catch (err) {
    console.error("Error fetching staff list from Supabase:", err);
  }
  return [];
}

export async function createStaffMember(formData: FormData) {
  const session = await requirePermission("can_manage_staff");
  if (!session) return UNAUTHORIZED;

  const full_name = (formData.get("full_name") as string) || "Staff Personnel";
  const personal_id_number =
    (formData.get("personal_id_number") as string) ||
    `ETH-FAYDA-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const phone_number = (formData.get("phone_number") as string) || "+251900000000";
  const email = (formData.get("email") as string) || null;
  const emergency_contact_name =
    (formData.get("emergency_contact_name") as string) || "Family Contact";
  const emergency_contact_phone =
    (formData.get("emergency_contact_phone") as string) || "+251900000000";
  const address = (formData.get("address") as string) || "Addis Ababa";
  const date_of_birth = (formData.get("date_of_birth") as string) || "1995-01-01";
  const role = (formData.get("role") as StaffRole) || "waiter";
  const base_salary = parseFloat((formData.get("base_salary") as string) || "0");
  const pin_code = (formData.get("pin_code") as string) || "123456";

  const modules = {
    live: formData.get("module_live") === "on",
    hr: formData.get("module_hr") === "on",
    delivery: formData.get("module_delivery") === "on",
    operations: formData.get("module_operations") === "on",
    sales: formData.get("module_sales") === "on",
    products: formData.get("module_products") === "on",
    marketing: formData.get("module_marketing") === "on",
  };

  const permissions: StaffPermissions = {
    can_manage_inventory: formData.get("can_manage_inventory") === "on" || modules.operations,
    can_view_finance: formData.get("can_view_finance") === "on" || modules.sales,
    can_manage_shifts: formData.get("can_manage_shifts") === "on" || modules.hr,
    can_manage_staff: formData.get("can_manage_staff") === "on" || modules.hr,
    modules,
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
    pin_code_hash: hashPin(pin_code),
    base_salary,
    permissions,
    performance_score: 5.0,
  };

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase.from("staff").insert([newStaff]).select();
    if (!error && data) {
      await writeActivityLog({
        actorStaffId: session.id,
        actorName: session.fullName,
        moduleId: "hr",
        action: "staff.create",
        entityType: "staff",
        entityId: data[0].id,
        details: { full_name, role },
      });
      revalidatePath("/admin/staff");
      return { success: true, staff: { ...data[0], pin_code_hash: "" } };
    } else if (error) {
      console.error("Supabase staff creation error:", error.message);
      return { success: false, message: error.message };
    }
  } catch (err) {
    console.error("Failed to create staff in Supabase:", err);
  }

  return { success: false, message: "Failed to create staff member." };
}

export async function updateStaffMemberAction(
  staffId: string,
  payload: {
    full_name: string;
    personal_id_number: string;
    phone_number: string;
    email?: string | null;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    address: string;
    date_of_birth: string;
    role: StaffRole;
    employment_status: EmploymentStatus;
    base_salary: number;
    permissions: StaffPermissions;
    newPinCode?: string;
  }
) {
  const session = await requirePermission("can_manage_staff");
  if (!session) return UNAUTHORIZED;

  try {
    const supabase = await getSupabase();
    const updatePayload: Record<string, unknown> = {
      full_name: payload.full_name,
      personal_id_number: payload.personal_id_number,
      phone_number: payload.phone_number,
      email: payload.email || null,
      emergency_contact_name: payload.emergency_contact_name,
      emergency_contact_phone: payload.emergency_contact_phone,
      address: payload.address,
      date_of_birth: payload.date_of_birth,
      role: payload.role,
      employment_status: payload.employment_status,
      base_salary: payload.base_salary,
      permissions: {
        ...payload.permissions,
        can_manage_inventory:
          !!payload.permissions.can_manage_inventory || !!payload.permissions.modules?.operations,
        can_view_finance:
          !!payload.permissions.can_view_finance || !!payload.permissions.modules?.sales,
        can_manage_shifts:
          !!payload.permissions.can_manage_shifts || !!payload.permissions.modules?.hr,
        can_manage_staff:
          !!payload.permissions.can_manage_staff || !!payload.permissions.modules?.hr,
      },
    };

    if (payload.newPinCode && payload.newPinCode.trim()) {
      updatePayload.pin_code_hash = hashPin(payload.newPinCode.trim());
    }

    const { error } = await supabase.from("staff").update(updatePayload).eq("id", staffId);

    if (!error) {
      await writeActivityLog({
        actorStaffId: session.id,
        actorName: session.fullName,
        moduleId: "hr",
        action: "staff.update",
        entityType: "staff",
        entityId: staffId,
        details: { role: payload.role, employment_status: payload.employment_status },
      });
      revalidatePath("/admin/staff");
      revalidatePath("/staff-login");
      return { success: true };
    }
    return { success: false, message: error.message };
  } catch (err) {
    console.error("Failed to update staff in Supabase:", err);
    return { success: false, message: "Update failed." };
  }
}

export async function deleteStaffMemberAction(staffId: string) {
  const session = await requirePermission("can_manage_staff");
  if (!session) return UNAUTHORIZED;

  try {
    const supabase = await getSupabase();
    // Soft-delete via terminated status to preserve FK history
    const { error } = await supabase
      .from("staff")
      .update({ employment_status: "terminated" })
      .eq("id", staffId);

    if (!error) {
      await writeActivityLog({
        actorStaffId: session.id,
        actorName: session.fullName,
        moduleId: "hr",
        action: "staff.terminate",
        entityType: "staff",
        entityId: staffId,
      });
      revalidatePath("/admin/staff");
      revalidatePath("/staff-login");
      return { success: true };
    }
    return { success: false, message: error.message };
  } catch (err) {
    console.error("Failed to delete staff:", err);
    return { success: false, message: "Delete failed." };
  }
}

/** @deprecated Prefer updateStaffMemberAction for full CRUD */
export async function updateStaffPermissions(
  staffId: string,
  role: StaffRole,
  permissions: Staff["permissions"],
  status: EmploymentStatus,
  newPinCode?: string
) {
  const session = await requirePermission("can_manage_staff");
  if (!session) return UNAUTHORIZED;

  try {
    const supabase = await getSupabase();
    const updatePayload: any = { role, permissions, employment_status: status };
    if (newPinCode && newPinCode.trim()) {
      updatePayload.pin_code_hash = hashPin(newPinCode.trim());
    }

    const { error } = await supabase.from("staff").update(updatePayload).eq("id", staffId);

    if (!error) {
      await writeActivityLog({
        actorStaffId: session.id,
        actorName: session.fullName,
        moduleId: "hr",
        action: "staff.permissions_update",
        entityType: "staff",
        entityId: staffId,
      });
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

/** Normalize clock log status → approval + punctuality (works without new columns). */
function parseClockStatuses(rawStatus: string | null | undefined) {
  const s = (rawStatus || "on_time").toLowerCase();
  if (s === "pending") return { approvalStatus: "pending" as const, status: "pending" };
  if (s === "rejected") return { approvalStatus: "rejected" as const, status: "rejected" };
  if (s.startsWith("pending:")) {
    return { approvalStatus: "pending" as const, status: s.replace("pending:", "") || "on_time" };
  }
  if (s === "late" || s === "early" || s === "on_time") {
    return { approvalStatus: "approved" as const, status: s };
  }
  return { approvalStatus: "approved" as const, status: s };
}

export async function getAttendanceLogsAction() {
  const session = await requirePermission("can_manage_staff");
  if (!session) return [];

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("clock_in_logs")
      .select(
        `
        id,
        clock_in_time,
        clock_out_time,
        status,
        created_at,
        staff:staff_id (full_name, role)
      `
      )
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => {
        const parsed = parseClockStatuses(d.status);
        return {
          id: d.id,
          staffName: d.staff?.full_name || "Staff Member",
          role: d.staff?.role || "Staff",
          clockIn: new Date(d.clock_in_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          clockOut: d.clock_out_time
            ? new Date(d.clock_out_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
          status: parsed.status,
          approvalStatus: parsed.approvalStatus,
          notes: "",
          date: new Date(d.created_at).toLocaleDateString(),
        };
      });
    }
  } catch (err) {
    console.error("Error fetching attendance logs from Supabase:", err);
  }
  return [];
}

export async function reviewClockInAction(
  logId: string,
  decision: "approved" | "rejected"
) {
  const session = await requirePermission("can_manage_staff");
  if (!session) return UNAUTHORIZED;

  try {
    const supabase = await getSupabase();
    const { data: log } = await supabase
      .from("clock_in_logs")
      .select("*")
      .eq("id", logId)
      .maybeSingle();

    if (!log) return { success: false, message: "Clock-in record not found." };

    const parsed = parseClockStatuses(log.status);
    const nextStatus =
      decision === "rejected"
        ? "rejected"
        : parsed.status === "pending"
          ? "on_time"
          : parsed.status === "late"
            ? "late"
            : parsed.status || "on_time";

    await supabase.from("clock_in_logs").update({ status: nextStatus }).eq("id", logId);

    // Best-effort: attach to today's shift for this staff if any
    if (decision === "approved") {
      const day = new Date(log.clock_in_time).toISOString().split("T")[0];
      const { data: shift } = await supabase
        .from("shifts")
        .select("id")
        .eq("staff_id", log.staff_id)
        .eq("shift_date", day)
        .in("status", ["scheduled", "late"])
        .limit(1)
        .maybeSingle();

      if (shift?.id) {
        await supabase
          .from("shifts")
          .update({
            status: nextStatus === "late" ? "late" : "checked_in",
            actual_clock_in: log.clock_in_time,
          })
          .eq("id", shift.id);
      }
    }

    await writeActivityLog({
      actorStaffId: session.id,
      actorName: session.fullName,
      moduleId: "hr",
      action: decision === "approved" ? "clock_in.approve" : "clock_in.reject",
      entityType: "clock_in_logs",
      entityId: logId,
    });

    revalidatePath("/admin/staff");
    revalidatePath("/admin/shifts");
    return { success: true };
  } catch (err) {
    console.error("Failed to review clock-in:", err);
    return { success: false, message: "Review failed." };
  }
}

export async function getLeaveRequestsAction() {
  const session = await requirePermission("can_manage_staff");
  if (!session) return [];

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("leave_requests")
      .select(
        `
        id,
        leave_type,
        start_date,
        end_date,
        reason,
        status,
        created_at,
        staff:staff_id (full_name)
      `
      )
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
  const session = await requirePermission("can_manage_staff");
  if (!session) return UNAUTHORIZED;

  try {
    const supabase = await getSupabase();
    await supabase.from("leave_requests").update({ status: newStatus }).eq("id", id);
    await writeActivityLog({
      actorStaffId: session.id,
      actorName: session.fullName,
      moduleId: "hr",
      action: `leave.${newStatus}`,
      entityType: "leave_requests",
      entityId: id,
    });
    revalidatePath("/admin/staff");
    return { success: true };
  } catch (err) {
    console.error("Failed to update leave request status:", err);
    return { success: false };
  }
}

export async function getTrainingChecklistAction() {
  const session = await requirePermission("can_manage_staff");
  if (!session) return [];

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("training_checklist")
      .select(
        `
        id,
        staff_id,
        item_name,
        category,
        completed,
        completed_at,
        staff:staff_id (full_name, role)
      `
      )
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
  const session = await requirePermission("can_manage_staff");
  if (!session) return UNAUTHORIZED;

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
  const session = await requirePermission("can_manage_staff");
  if (!session) return UNAUTHORIZED;

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

export async function getActivityLogsAction() {
  const session = await requirePermission("can_manage_staff");
  if (!session) return [];

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      return data.map((d: any) => ({
        id: d.id,
        actorName: d.actor_name || "System",
        moduleId: d.module_id,
        action: d.action,
        entityType: d.entity_type,
        entityId: d.entity_id,
        details: d.details,
        createdAt: new Date(d.created_at).toLocaleString(),
      }));
    }
  } catch (err) {
    console.error("Error fetching activity logs:", err);
  }
  return [];
}

// ---------------------------------------------------------------------------
// Staff-facing clock-in + leave (any authenticated staff)
// ---------------------------------------------------------------------------

export async function requestClockInAction(shiftCode?: string) {
  const session = await getVerifiedSession();
  if (!session) return { success: false, message: "Not signed in." };

  try {
    const supabase = await getSupabase();
    const today = new Date().toISOString().split("T")[0];

    let shift: any = null;
    if (shiftCode?.trim()) {
      const { data } = await supabase
        .from("shifts")
        .select("*")
        .eq("staff_id", session.id)
        .eq("clock_in_code", shiftCode.trim())
        .eq("shift_date", today)
        .maybeSingle();
      shift = data;
      if (!shift) {
        return { success: false, message: "Invalid shift code for today's roster." };
      }
    } else {
      const { data } = await supabase
        .from("shifts")
        .select("*")
        .eq("staff_id", session.id)
        .eq("shift_date", today)
        .in("status", ["scheduled", "late"])
        .order("scheduled_start", { ascending: true })
        .limit(1)
        .maybeSingle();
      shift = data;
    }

    // Prevent duplicate open pending/approved clock-ins today
    const { data: existingRows } = await supabase
      .from("clock_in_logs")
      .select("id, status")
      .eq("staff_id", session.id)
      .gte("created_at", `${today}T00:00:00`)
      .is("clock_out_time", null)
      .limit(5);

    const open = (existingRows || []).find((row: any) => {
      const p = parseClockStatuses(row.status);
      return p.approvalStatus === "pending" || p.approvalStatus === "approved";
    });

    if (open) {
      const p = parseClockStatuses(open.status);
      return {
        success: false,
        message:
          p.approvalStatus === "pending"
            ? "Clock-in already waiting for admin approval."
            : "You are already clocked in.",
      };
    }

    const now = new Date();
    let punctuality = "on_time";
    if (shift?.scheduled_start) {
      const start = new Date(shift.scheduled_start);
      const diffMin = (now.getTime() - start.getTime()) / 60000;
      if (diffMin > 10) punctuality = "late";
      else if (diffMin < -30) punctuality = "early";
    }

    // Encode pending + punctuality in existing status TEXT column
    const pendingStatus = `pending:${punctuality}`;

    const { data, error } = await supabase
      .from("clock_in_logs")
      .insert([
        {
          restaurant_id: DEFAULT_RESTAURANT_ID,
          staff_id: session.id,
          clock_in_time: now.toISOString(),
          status: pendingStatus,
        },
      ])
      .select()
      .maybeSingle();

    if (error || !data) {
      return { success: false, message: error?.message || "Could not submit clock-in." };
    }

    await writeActivityLog({
      actorStaffId: session.id,
      actorName: session.fullName,
      moduleId: "hr",
      action: "clock_in.request",
      entityType: "clock_in_logs",
      entityId: data.id,
      details: { punctuality, shiftId: shift?.id },
    });

    revalidatePath("/admin/staff");
    revalidatePath("/staff/dashboard");
    return {
      success: true,
      message: "Clock-in submitted. Waiting for admin approval.",
      logId: data.id,
      status: "pending",
    };
  } catch (err) {
    console.error("requestClockInAction error:", err);
    return { success: false, message: "Clock-in failed." };
  }
}

export async function requestClockOutAction() {
  const session = await getVerifiedSession();
  if (!session) return { success: false, message: "Not signed in." };

  try {
    const supabase = await getSupabase();
    const today = new Date().toISOString().split("T")[0];
    const { data: rows } = await supabase
      .from("clock_in_logs")
      .select("*")
      .eq("staff_id", session.id)
      .gte("created_at", `${today}T00:00:00`)
      .is("clock_out_time", null)
      .order("created_at", { ascending: false })
      .limit(5);

    const openLog = (rows || []).find((row: any) => {
      const p = parseClockStatuses(row.status);
      return p.approvalStatus === "approved";
    });

    if (!openLog) {
      return { success: false, message: "No active approved clock-in to close." };
    }

    const nowIso = new Date().toISOString();
    await supabase
      .from("clock_in_logs")
      .update({ clock_out_time: nowIso })
      .eq("id", openLog.id);

    const { data: shift } = await supabase
      .from("shifts")
      .select("id")
      .eq("staff_id", session.id)
      .eq("shift_date", today)
      .in("status", ["checked_in", "late"])
      .limit(1)
      .maybeSingle();

    if (shift?.id) {
      await supabase
        .from("shifts")
        .update({ status: "completed", actual_clock_out: nowIso })
        .eq("id", shift.id);
    }

    await writeActivityLog({
      actorStaffId: session.id,
      actorName: session.fullName,
      moduleId: "hr",
      action: "clock_out",
      entityType: "clock_in_logs",
      entityId: openLog.id,
    });

    revalidatePath("/admin/staff");
    revalidatePath("/staff/dashboard");
    return { success: true, message: "Clocked out successfully." };
  } catch (err) {
    console.error("requestClockOutAction error:", err);
    return { success: false, message: "Clock-out failed." };
  }
}

export async function getMyClockStatusAction() {
  const session = await getVerifiedSession();
  if (!session) return null;

  try {
    const supabase = await getSupabase();
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("clock_in_logs")
      .select("*")
      .eq("staff_id", session.id)
      .gte("created_at", `${today}T00:00:00`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return { state: "idle" as const };

    const parsed = parseClockStatuses(data.status);
    if (data.clock_out_time) return { state: "clocked_out" as const, log: data };
    if (parsed.approvalStatus === "pending") return { state: "pending" as const, log: data };
    if (parsed.approvalStatus === "rejected") return { state: "rejected" as const, log: data };
    if (parsed.approvalStatus === "approved") return { state: "clocked_in" as const, log: data };
    return { state: "idle" as const };
  } catch {
    return { state: "idle" as const };
  }
}

export async function submitLeaveRequestAction(input: {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  const session = await getVerifiedSession();
  if (!session) return { success: false, message: "Not signed in." };

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("leave_requests")
      .insert([
        {
          restaurant_id: DEFAULT_RESTAURANT_ID,
          staff_id: session.id,
          leave_type: input.leaveType || "Annual Leave",
          start_date: input.startDate,
          end_date: input.endDate,
          reason: input.reason || null,
          status: "pending",
        },
      ])
      .select()
      .maybeSingle();

    if (error || !data) {
      return { success: false, message: error?.message || "Could not submit leave." };
    }

    await writeActivityLog({
      actorStaffId: session.id,
      actorName: session.fullName,
      moduleId: "hr",
      action: "leave.submit",
      entityType: "leave_requests",
      entityId: data.id,
    });

    revalidatePath("/admin/staff");
    revalidatePath("/staff/dashboard");
    return { success: true, message: "Leave request submitted.", request: data };
  } catch (err) {
    console.error("submitLeaveRequestAction error:", err);
    return { success: false, message: "Leave submit failed." };
  }
}

export async function getMyLeaveRequestsAction() {
  const session = await getVerifiedSession();
  if (!session) return [];

  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from("leave_requests")
      .select("*")
      .eq("staff_id", session.id)
      .order("created_at", { ascending: false });

    return (data || []).map((d: any) => ({
      id: d.id,
      type: d.leave_type,
      startDate: d.start_date,
      endDate: d.end_date,
      reason: d.reason || "",
      status: d.status,
    }));
  } catch {
    return [];
  }
}
