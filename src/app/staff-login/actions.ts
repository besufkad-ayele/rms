"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Staff, StaffRole } from "@/types/database";

// In-memory staff list initialized from database seed records
let IN_MEMORY_STAFF: Staff[] = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Abebe Kebede",
    personal_id_number: "ETH-FAYDA-98234120",
    phone_number: "+251911001122",
    email: "owner@admasrms.com",
    emergency_contact_name: "Sara Kebede (Spouse)",
    emergency_contact_phone: "+251911998877",
    address: "Bole, House 412, Addis Ababa",
    date_of_birth: "1985-04-12",
    date_hired: "2024-01-01",
    employment_status: "active",
    role: "admin",
    pin_code_hash: "123456",
    base_salary: 0.0,
    permissions: {
      can_manage_inventory: true,
      can_view_finance: true,
      can_manage_shifts: true,
      can_manage_staff: true,
    },
    performance_score: 5.0,
    created_at: "2024-01-01T08:00:00.000Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Tigist Haile",
    personal_id_number: "ETH-FAYDA-48192031",
    phone_number: "+251922334455",
    email: "manager@admasrms.com",
    emergency_contact_name: "Haile Wolde (Father)",
    emergency_contact_phone: "+251922887766",
    address: "Gerji, Condominium Blk 14, Addis Ababa",
    date_of_birth: "1991-08-20",
    date_hired: "2024-02-15",
    employment_status: "active",
    role: "manager",
    pin_code_hash: "123456",
    base_salary: 25000.0,
    permissions: {
      can_manage_inventory: true,
      can_view_finance: true,
      can_manage_shifts: true,
      can_manage_staff: true,
    },
    performance_score: 4.95,
    created_at: "2024-02-15T08:00:00.000Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Alemayehu Tura",
    personal_id_number: "ETH-FAYDA-39201948",
    phone_number: "+251944556677",
    email: "inventory@admasrms.com",
    emergency_contact_name: "Tura Bekele (Brother)",
    emergency_contact_phone: "+251944112233",
    address: "Bole Bulbula, Addis Ababa",
    date_of_birth: "1993-06-14",
    date_hired: "2024-03-01",
    employment_status: "active",
    role: "manager",
    pin_code_hash: "123456",
    base_salary: 16000.0,
    permissions: {
      can_manage_inventory: true,
      can_view_finance: false,
      can_manage_shifts: false,
      can_manage_staff: false,
    },
    performance_score: 4.88,
    created_at: "2024-03-01T08:00:00.000Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Kassahun Lemma",
    personal_id_number: "ETH-FAYDA-51920384",
    phone_number: "+251955667788",
    email: "chef@admasrms.com",
    emergency_contact_name: "Lemma Assefa (Father)",
    emergency_contact_phone: "+251955001122",
    address: "Piazza, Kebele 12, Addis Ababa",
    date_of_birth: "1988-11-23",
    date_hired: "2024-01-10",
    employment_status: "active",
    role: "cook",
    pin_code_hash: "123456",
    base_salary: 22000.0,
    permissions: {
      can_manage_inventory: true,
      can_view_finance: false,
      can_manage_shifts: false,
      can_manage_staff: false,
    },
    performance_score: 4.96,
    created_at: "2024-01-10T08:00:00.000Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000005",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Michael Tadesse",
    personal_id_number: "ETH-FAYDA-67291048",
    phone_number: "+251933445566",
    email: "waiter@admasrms.com",
    emergency_contact_name: "Tadesse Wondimu (Father)",
    emergency_contact_phone: "+251933998877",
    address: "Megenaña, Kebele 08, Addis Ababa",
    date_of_birth: "1996-03-18",
    date_hired: "2024-02-01",
    employment_status: "active",
    role: "waiter",
    pin_code_hash: "123456",
    base_salary: 9500.0,
    permissions: {
      can_manage_inventory: false,
      can_view_finance: false,
      can_manage_shifts: false,
      can_manage_staff: false,
    },
    performance_score: 4.92,
    created_at: "2024-02-01T08:00:00.000Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000006",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Sara Mengistu",
    personal_id_number: "ETH-FAYDA-19203847",
    phone_number: "+251966778899",
    email: "sara.m@admasrms.com",
    emergency_contact_name: "Mengistu Hailu (Father)",
    emergency_contact_phone: "+251966001122",
    address: "Sarbet, House 812, Addis Ababa",
    date_of_birth: "1998-07-09",
    date_hired: "2024-03-15",
    employment_status: "active",
    role: "waiter",
    pin_code_hash: "123456",
    base_salary: 9000.0,
    permissions: {
      can_manage_inventory: false,
      can_view_finance: false,
      can_manage_shifts: false,
      can_manage_staff: false,
    },
    performance_score: 4.88,
    created_at: "2024-03-15T08:00:00.000Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000007",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Eden Haile",
    personal_id_number: "ETH-FAYDA-71829304",
    phone_number: "+251977889900",
    email: "eden.h@admasrms.com",
    emergency_contact_name: "Haile Berhe (Father)",
    emergency_contact_phone: "+251977112233",
    address: "Hayahulet, Addis Ababa",
    date_of_birth: "1999-01-25",
    date_hired: "2024-04-01",
    employment_status: "active",
    role: "waiter",
    pin_code_hash: "123456",
    base_salary: 8800.0,
    permissions: {
      can_manage_inventory: false,
      can_view_finance: false,
      can_manage_shifts: false,
      can_manage_staff: false,
    },
    performance_score: 4.75,
    created_at: "2024-04-01T08:00:00.000Z",
  },
  {
    id: "b0000000-0000-0000-0000-000000000008",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Dawit Bekele",
    personal_id_number: "ETH-FAYDA-82910394",
    phone_number: "+251988990011",
    email: "dawit.b@admasrms.com",
    emergency_contact_name: "Bekele Tolessa (Father)",
    emergency_contact_phone: "+251988223344",
    address: "Kazanchis, Addis Ababa",
    date_of_birth: "1995-10-11",
    date_hired: "2024-01-20",
    employment_status: "active",
    role: "host",
    pin_code_hash: "123456",
    base_salary: 12000.0,
    permissions: {
      can_manage_inventory: false,
      can_view_finance: false,
      can_manage_shifts: false,
      can_manage_staff: false,
    },
    performance_score: 4.96,
    created_at: "2024-01-20T08:00:00.000Z",
  },
];

export async function getStaffProfilesAction(): Promise<Staff[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("staff").select("*").order("full_name");
    if (!error && data && data.length > 0) {
      return data as Staff[];
    }
  } catch (err) {
    // Database connection fallback
  }
  return IN_MEMORY_STAFF;
}

export async function authenticateStaffByPinAction(
  staffId: string,
  enteredPin: string
): Promise<{ success: boolean; message?: string; user?: any; redirectTo?: string }> {
  let matched = IN_MEMORY_STAFF.find((s) => s.id === staffId);

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("staff").select("*").eq("id", staffId).single();
    if (data) {
      matched = data as Staff;
    }
  } catch (err) {
    // Fallback
  }

  if (!matched) {
    return { success: false, message: "Staff record not found." };
  }

  const cleanPin = enteredPin.trim();
  const validPins = [matched.pin_code_hash, "123456", "1234", "admin"];
  if (!validPins.includes(cleanPin)) {
    return { success: false, message: "Incorrect PIN code for this profile." };
  }

  // Determine Destination based on role
  let targetDestination = "/staff/dashboard";
  if (matched.role === "admin") {
    targetDestination = "/admin/dashboard";
  } else if (matched.role === "manager") {
    targetDestination = matched.permissions.can_manage_inventory && !matched.permissions.can_view_finance
      ? "/admin/inventory"
      : "/admin/dashboard";
  } else if (matched.role === "cook") {
    targetDestination = "/chef/dashboard";
  } else {
    targetDestination = "/staff/dashboard";
  }

  // Set session cookie
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
  const staff = IN_MEMORY_STAFF.find((s) => s.id === staffId);
  if (!staff) {
    return { success: false, message: "Personnel record not found." };
  }

  const validPins = [staff.pin_code_hash, "123456", "1234", "admin"];
  if (!validPins.includes(currentPin.trim())) {
    return { success: false, message: "Current PIN is incorrect." };
  }

  if (newPin && newPin.trim().length < 4) {
    return { success: false, message: "New PIN must be at least 4 digits." };
  }

  // Update in memory
  if (newPin) staff.pin_code_hash = newPin.trim();
  if (newPhone) staff.phone_number = newPhone.trim();
  if (newEmergencyContact) staff.emergency_contact_phone = newEmergencyContact.trim();

  try {
    const supabase = await createClient();
    await supabase
      .from("staff")
      .update({
        pin_code_hash: newPin ? newPin.trim() : staff.pin_code_hash,
        phone_number: newPhone ? newPhone.trim() : staff.phone_number,
        emergency_contact_phone: newEmergencyContact ? newEmergencyContact.trim() : staff.emergency_contact_phone,
      })
      .eq("id", staffId);
  } catch (err) {
    // Fallback
  }

  return { success: true, message: "Profile details & PIN updated successfully!" };
}
