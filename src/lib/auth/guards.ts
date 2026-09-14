import { cookies } from "next/headers";
import { StaffPermissions, StaffRole } from "@/types/database";
import { SESSION_COOKIE, SessionUser, verifySessionToken } from "./session";

const ADMIN_PORTAL_ROLES: StaffRole[] = ["admin", "manager"];
const KITCHEN_ROLES: StaffRole[] = ["cook", "admin", "manager"];
const FLOOR_ROLES: StaffRole[] = ["waiter", "host", "manager", "admin"];
const CASHIER_ROLES: StaffRole[] = ["host", "manager", "admin"];
const STAFF_TERMINAL_ROLES: StaffRole[] = ["waiter", "host", "cook", "cleaner", "manager", "admin"];

export async function getVerifiedSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireSession(): Promise<SessionUser | null> {
  return getVerifiedSession();
}

export async function requireRole(roles: StaffRole[]): Promise<SessionUser | null> {
  const session = await getVerifiedSession();
  if (!session) return null;
  if (!roles.includes(session.role)) return null;
  return session;
}

export async function requireAdminPortal(): Promise<SessionUser | null> {
  return requireRole(ADMIN_PORTAL_ROLES);
}

export async function requireKitchen(): Promise<SessionUser | null> {
  return requireRole(KITCHEN_ROLES);
}

export async function requireFloorStaff(): Promise<SessionUser | null> {
  return requireRole(FLOOR_ROLES);
}

export async function requireCashier(): Promise<SessionUser | null> {
  return requireRole(CASHIER_ROLES);
}

export async function requireStaffTerminal(): Promise<SessionUser | null> {
  return requireRole(STAFF_TERMINAL_ROLES);
}

export async function requirePermission(
  permission: keyof StaffPermissions
): Promise<SessionUser | null> {
  const session = await requireAdminPortal();
  if (!session) return null;
  if (session.role === "admin") return session;
  if (session.permissions?.[permission]) return session;
  return null;
}

export const UNAUTHORIZED = { success: false as const, message: "Unauthorized" };
