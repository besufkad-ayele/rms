"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Staff } from "@/types/database";

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createClient();
  }
}

export async function getStaffProfilesAction(): Promise<Staff[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("full_name", { ascending: true });

    if (!error && data) {
      return data as Staff[];
    }
  } catch (err) {
    console.error("Error loading staff profiles from Supabase:", err);
  }

  return [];
}

export async function authenticateStaffByPinAction(
  staffId: string,
  enteredPin: string
): Promise<{ success: boolean; message?: string; user?: any; redirectTo?: string }> {
  const cleanPin = enteredPin.trim();
  let matched: Staff | null = null;

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("id", staffId)
      .maybeSingle();

    if (!error && data) {
      matched = data as Staff;
    }
  } catch (err) {
    console.error("Error authenticating staff by PIN:", err);
  }

  if (!matched) {
    return { success: false, message: "Staff record not found." };
  }

  // Strictly verify PIN against database record
  if (cleanPin !== matched.pin_code_hash) {
    return { success: false, message: "Incorrect PIN code for this profile." };
  }

  // Determine Destination based on role and permissions
  let targetDestination = "/staff/dashboard";
  if (matched.role === "admin") {
    targetDestination = "/admin/dashboard";
  } else if (matched.role === "manager") {
    targetDestination = matched.permissions?.can_manage_inventory && !matched.permissions?.can_view_finance && !matched.permissions?.can_manage_staff
      ? "/admin/inventory"
      : "/admin/dashboard";
  } else if (matched.role === "cook") {
    targetDestination = "/chef/dashboard";
  } else {
    targetDestination = "/staff/dashboard";
  }

  // Set session cookie (httpOnly: false so client components can read session)
  const cookieStore = await cookies();
  cookieStore.set(
    "rms_session_user",
    JSON.stringify({
      id: matched.id,
      fullName: matched.full_name,
      role: matched.role,
      email: matched.email,
      personalId: matched.personal_id_number,
      destination: targetDestination,
      permissions: matched.permissions,
      phone: matched.phone_number,
    }),
    {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  return {
    success: true,
    user: {
      id: matched.id,
      fullName: matched.full_name,
      role: matched.role,
      destination: targetDestination,
    },
    redirectTo: targetDestination,
  };
}

export async function updateStaffProfileAndPinAction(
  staffId: string,
  currentPin: string,
  newPin: string,
  newPhone: string,
  newEmergencyContact: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await getSupabase();
    const { data: staff, error } = await supabase
      .from("staff")
      .select("*")
      .eq("id", staffId)
      .maybeSingle();

    if (error || !staff) {
      return { success: false, message: "Personnel record not found." };
    }

    if (currentPin.trim() !== staff.pin_code_hash) {
      return { success: false, message: "Current PIN is incorrect." };
    }

    if (newPin && newPin.trim().length < 4) {
      return { success: false, message: "New PIN must be at least 4 digits." };
    }

    const updatePayload: any = {};
    if (newPin) updatePayload.pin_code_hash = newPin.trim();
    if (newPhone) updatePayload.phone_number = newPhone.trim();
    if (newEmergencyContact) updatePayload.emergency_contact_phone = newEmergencyContact.trim();

    await supabase.from("staff").update(updatePayload).eq("id", staffId);

    return { success: true, message: "Profile details & PIN updated successfully!" };
  } catch (err) {
    console.error("Failed to update staff profile in database:", err);
    return { success: false, message: "Failed to update profile in database." };
  }
}

