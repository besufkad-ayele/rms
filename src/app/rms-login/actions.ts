"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { Staff, StaffRole } from "@/types/database";
import { hashPin, isHashedPin, verifyPin } from "@/lib/auth/pins";
import { getVerifiedSession } from "@/lib/auth/guards";
import {
  SESSION_COOKIE,
  SessionUser,
  sessionCookieOptions,
  signSession,
} from "@/lib/auth/session";

export interface LoginResult {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    fullName: string;
    email?: string | null;
    role: StaffRole;
    personalId: string;
    destination: string;
  };
  redirectTo?: string;
}

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createServerClient();
  }
}

function destinationForStaff(staff: Staff): string {
  if (staff.role === "admin") return "/admin/dashboard";
  if (staff.role === "manager") {
    if (
      staff.permissions?.can_manage_inventory &&
      !staff.permissions?.can_view_finance &&
      !staff.permissions?.can_manage_staff
    ) {
      return "/admin/inventory";
    }
    return "/admin/dashboard";
  }
  if (staff.role === "cook") return "/chef/dashboard";
  if (staff.role === "cashier" || staff.role === "host") return "/cashier";
  return "/staff/dashboard";
}

async function persistSession(staff: Staff, destination: string) {
  const session: SessionUser = {
    id: staff.id,
    fullName: staff.full_name,
    role: staff.role,
    email: staff.email,
    personalId: staff.personal_id_number,
    permissions: staff.permissions,
    destination,
  };
  const token = await signSession(session);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function authenticateStaffAction(
  identifier: string,
  secretPin: string
): Promise<LoginResult> {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPin = secretPin.trim();

  if (!cleanId || !cleanPin) {
    return {
      success: false,
      message: "Please enter your Email/Fayda ID and Password/PIN.",
    };
  }

  let matchedStaff: Staff | null = null;

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .or(`email.ilike.${cleanId},phone_number.eq.${cleanId},personal_id_number.ilike.${cleanId}`)
      .maybeSingle();

    if (!error && data) {
      matchedStaff = data as Staff;
    }
  } catch (err) {
    console.error("Database authentication query error:", err);
  }

  if (!matchedStaff) {
    return {
      success: false,
      message: "No staff or owner record matches the provided identifier.",
    };
  }

  if (!verifyPin(cleanPin, matchedStaff.pin_code_hash)) {
    return {
      success: false,
      message: "Incorrect Password or PIN for this personnel record.",
    };
  }

  if (!isHashedPin(matchedStaff.pin_code_hash)) {
    try {
      const supabase = await getSupabase();
      await supabase
        .from("staff")
        .update({ pin_code_hash: hashPin(cleanPin) })
        .eq("id", matchedStaff.id);
    } catch (err) {
      console.error("Failed to upgrade plaintext PIN:", err);
    }
  }

  const targetDestination = destinationForStaff(matchedStaff);
  await persistSession(matchedStaff, targetDestination);

  return {
    success: true,
    user: {
      id: matchedStaff.id,
      fullName: matchedStaff.full_name,
      email: matchedStaff.email,
      role: matchedStaff.role,
      personalId: matchedStaff.personal_id_number,
      destination: targetDestination,
    },
    redirectTo: targetDestination,
  };
}

export async function getCurrentSessionAction(): Promise<SessionUser | null> {
  return getVerifiedSession();
}

export async function logoutUserAction() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(0),
    expires: new Date(0),
  });
  cookieStore.delete(SESSION_COOKIE);
  return { success: true };
}
