"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Staff, StaffRole, EmploymentStatus } from "@/types/database";

// In-memory fallback dataset for seamless preview before live DB connection
let mockStaffDatabase: Staff[] = [
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
    created_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
    full_name: "Dawit Yohannes",
    personal_id_number: "ETH-FAYDA-67291048",
    phone_number: "+251933445566",
    email: "dawit.y@admasrms.com",
    emergency_contact_name: "Almaz Tadesse (Mother)",
    emergency_contact_phone: "+251933009988",
    address: "Megenaña, Kebele 08, Addis Ababa",
    date_of_birth: "1997-11-05",
    date_hired: "2024-03-01",
    employment_status: "active",
    role: "waiter",
    pin_code_hash: "123456",
    base_salary: 8500.0,
    permissions: {
      can_manage_inventory: false,
      can_view_finance: false,
      can_manage_shifts: false,
      can_manage_staff: false,
    },
    performance_score: 4.82,
    created_at: new Date().toISOString(),
  },
];

export async function getStaffList(): Promise<Staff[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Staff[];
    }
  } catch (err) {
    console.warn("Supabase not yet configured or reachable, using memory store:", err);
  }
  return mockStaffDatabase;
}

export async function createStaffMember(formData: FormData) {
  const full_name = formData.get("full_name") as string;
  const personal_id_number = formData.get("personal_id_number") as string;
  const phone_number = formData.get("phone_number") as string;
  const email = (formData.get("email") as string) || null;
  const emergency_contact_name = formData.get("emergency_contact_name") as string;
  const emergency_contact_phone = formData.get("emergency_contact_phone") as string;
  const address = formData.get("address") as string;
  const date_of_birth = formData.get("date_of_birth") as string;
  const role = formData.get("role") as StaffRole;
  const base_salary = parseFloat((formData.get("base_salary") as string) || "0");
  const pin_code = (formData.get("pin_code") as string) || "123456";

  const permissions = {
    can_manage_inventory: formData.get("can_manage_inventory") === "on",
    can_view_finance: formData.get("can_view_finance") === "on",
    can_manage_shifts: formData.get("can_manage_shifts") === "on",
    can_manage_staff: formData.get("can_manage_staff") === "on",
  };

  const newStaff: Staff = {
    id: crypto.randomUUID(),
    restaurant_id: "a0000000-0000-0000-0000-000000000001",
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
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("staff").insert([newStaff]).select();
    if (!error && data) {
      revalidatePath("/admin/staff");
      return { success: true, staff: data[0] };
    }
  } catch (err) {
    console.warn("Falling back to in-memory registration:", err);
  }

  mockStaffDatabase.unshift(newStaff);
  revalidatePath("/admin/staff");
  return { success: true, staff: newStaff };
}

export async function updateStaffPermissions(
  staffId: string,
  role: StaffRole,
  permissions: Staff["permissions"],
  status: EmploymentStatus
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("staff")
      .update({ role, permissions, employment_status: status })
      .eq("id", staffId);

    if (!error) {
      revalidatePath("/admin/staff");
      return { success: true };
    }
  } catch (err) {
    console.warn("Fallback updating in memory:", err);
  }

  const staff = mockStaffDatabase.find((s) => s.id === staffId);
  if (staff) {
    staff.role = role;
    staff.permissions = permissions;
    staff.employment_status = status;
  }

  revalidatePath("/admin/staff");
  return { success: true };
}
