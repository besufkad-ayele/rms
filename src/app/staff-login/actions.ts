"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Staff } from "@/types/database";
import { hashPin, isHashedPin, verifyPin } from "@/lib/auth/pins";
import { getVerifiedSession } from "@/lib/auth/guards";
import { SESSION_COOKIE, SessionUser, sessionCookieOptions, signSession } from "@/lib/auth/session";
import { cookies } from "next/headers";

export interface PublicStaffProfile {
  id: string;
  full_name: string;
  role: Staff["role"];
  profile_photo_url?: string | null;
  employment_status: Staff["employment_status"];
}

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createClient();
  }
}

function destinationForStaff(staff: Staff): string {
  if (staff.role === "admin") return "/admin/dashboard";
  if (staff.role === "manager") {
    return staff.permissions?.can_manage_inventory &&
      !staff.permissions?.can_view_finance &&
      !staff.permissions?.can_manage_staff
      ? "/admin/inventory"
      : "/admin/dashboard";
  }
  if (staff.role === "cook") return "/chef/dashboard";
  return "/staff/dashboard";
}

export async function getStaffProfilesAction(): Promise<PublicStaffProfile[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("staff")
      .select("id, full_name, role, profile_photo_url, employment_status")
      .eq("employment_status", "active")
      .order("full_name", { ascending: true });

    if (!error && data) {
      return data as PublicStaffProfile[];
    }
  } catch (err) {
    console.error("Error loading staff profiles from Supabase:", err);
  }

  return [];
}

export async function authenticateStaffByPinAction(
  staffId: string,
  enteredPin: string
): Promise<{ success: boolean; message?: string; user?: { id: string; fullName: string; role: Staff["role"]; destination: string }; redirectTo?: string }> {
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

  if (!verifyPin(cleanPin, matched.pin_code_hash)) {
    return { success: false, message: "Incorrect PIN code for this profile." };
  }

  if (!isHashedPin(matched.pin_code_hash)) {
    try {
      const supabase = await getSupabase();
      await supabase.from("staff").update({ pin_code_hash: hashPin(cleanPin) }).eq("id", matched.id);
    } catch (err) {
      console.error("Failed to upgrade plaintext PIN:", err);
    }
  }

  const targetDestination = destinationForStaff(matched);
  const session: SessionUser = {
    id: matched.id,
    fullName: matched.full_name,
    role: matched.role,
    email: matched.email,
    personalId: matched.personal_id_number,
    permissions: matched.permissions,
    destination: targetDestination,
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await signSession(session), sessionCookieOptions());

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
  const session = await getVerifiedSession();
  if (!session || session.id !== staffId) {
    return { success: false, message: "You can only update your own profile." };
  }

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

    if (!verifyPin(currentPin.trim(), staff.pin_code_hash)) {
      return { success: false, message: "Current PIN is incorrect." };
    }

    if (newPin && newPin.trim().length < 4) {
      return { success: false, message: "New PIN must be at least 4 digits." };
    }

    const updatePayload: Record<string, string> = {};
    if (newPin) updatePayload.pin_code_hash = hashPin(newPin.trim());
    if (newPhone) updatePayload.phone_number = newPhone.trim();
    if (newEmergencyContact) updatePayload.emergency_contact_phone = newEmergencyContact.trim();

    await supabase.from("staff").update(updatePayload).eq("id", staffId);

    return { success: true, message: "Profile details & PIN updated successfully!" };
  } catch (err) {
    console.error("Failed to update staff profile in database:", err);
    return { success: false, message: "Failed to update profile in database." };
  }
}
