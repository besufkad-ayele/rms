"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { Staff, StaffRole } from "@/types/database";

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

  // Query Supabase staff table for matching email, phone, or Fayda ID
  try {
    let supabase;
    try {
      supabase = createAdminClient();
    } catch {
      supabase = await createServerClient();
    }

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

  // Verify PIN / Password against database record
  if (cleanPin !== matchedStaff.pin_code_hash) {
    return {
      success: false,
      message: "Incorrect Password or PIN for this personnel record.",
    };
  }

  // Determine Destination route based on role & permissions
  let targetDestination = "/admin/dashboard";

  if (matchedStaff.role === "admin") {
    targetDestination = "/admin/dashboard";
  } else if (matchedStaff.role === "manager") {
    if (matchedStaff.permissions?.can_manage_inventory && !matchedStaff.permissions?.can_view_finance && !matchedStaff.permissions?.can_manage_staff) {
      targetDestination = "/admin/inventory";
    } else {
      targetDestination = "/admin/dashboard";
    }
  } else if (matchedStaff.role === "cook") {
    targetDestination = "/chef/dashboard";
  } else {
    targetDestination = "/staff/dashboard";
  }

  // Store session cookie (httpOnly: false so client layouts can read session)
  const cookieStore = await cookies();
  cookieStore.set(
    "rms_session_user",
    JSON.stringify({
      id: matchedStaff.id,
      fullName: matchedStaff.full_name,
      role: matchedStaff.role,
      email: matchedStaff.email,
      personalId: matchedStaff.personal_id_number,
      permissions: matchedStaff.permissions,
      destination: targetDestination,
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

export async function logoutUserAction() {
  const cookieStore = await cookies();
  cookieStore.set("rms_session_user", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0,
  });
  cookieStore.delete("rms_session_user");
  return { success: true };
}

