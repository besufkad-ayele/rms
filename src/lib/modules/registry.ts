import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  CircleDollarSign,
  BookOpen,
  Megaphone,
  Sliders,
  Tag,
  Clock,
  CalendarDays,
  Palmtree,
  GraduationCap,
  ScrollText,
  UtensilsCrossed,
  QrCode,
  ShoppingBag,
  Star,
  Warehouse,
  BarChart3,
  Settings2,
} from "lucide-react";
import type { StaffPermissions, StaffRole } from "@/types/database";

export type ModuleId =
  | "live"
  | "hr"
  | "delivery"
  | "operations"
  | "sales"
  | "products"
  | "marketing";

export interface ModuleNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export interface AdminModule {
  id: ModuleId;
  name: string;
  shortName: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  accentBg: string;
  /** Path prefixes that belong to this module */
  pathPrefixes: string[];
  nav: ModuleNavItem[];
}

export const ADMIN_MODULES: AdminModule[] = [
  {
    id: "live",
    name: "Live Dashboard",
    shortName: "Live Ops",
    description:
      "Real-time floor pulse, dynamic pricing, staff enrollment shortcuts, and module permission control.",
    href: "/admin/dashboard?tab=overview",
    icon: LayoutDashboard,
    accent: "#8B4254",
    accentBg: "rgba(139, 66, 84, 0.12)",
    pathPrefixes: ["/admin/dashboard"],
    nav: [
      { name: "Command Overview", href: "/admin/dashboard?tab=overview", icon: LayoutDashboard },
      { name: "Operations Pulse", href: "/admin/dashboard?tab=operations", icon: BarChart3 },
      { name: "Dynamic Pricing", href: "/admin/dashboard?tab=menu_engineering", icon: Tag },
      { name: "HR Snapshot", href: "/admin/dashboard?tab=hr_summary", icon: Users },
      { name: "Module Permissions", href: "/admin/dashboard?tab=permissions", icon: Sliders },
    ],
  },
  {
    id: "hr",
    name: "Human Resource & Management",
    shortName: "HR",
    description:
      "Personnel profiles, attendance, clock-in approval, rostering, leave, training, and audit logs.",
    href: "/admin/staff?tab=overview",
    icon: Users,
    accent: "#0F766E",
    accentBg: "rgba(15, 118, 110, 0.12)",
    pathPrefixes: ["/admin/staff", "/admin/shifts"],
    nav: [
      { name: "HR Dashboard", href: "/admin/staff?tab=overview", icon: LayoutDashboard },
      { name: "Personnel Profiles", href: "/admin/staff?tab=profiles", icon: Users },
      { name: "Attendance & Clocking", href: "/admin/staff?tab=attendance", icon: Clock },
      { name: "Roster & Shifts", href: "/admin/shifts", icon: CalendarDays },
      { name: "Leave Management", href: "/admin/staff?tab=leave", icon: Palmtree },
      { name: "Training Checklist", href: "/admin/staff?tab=training", icon: GraduationCap },
      { name: "Activity Audit Log", href: "/admin/staff?tab=audit", icon: ScrollText },
    ],
  },
  {
    id: "delivery",
    name: "Delivery & Onboarding",
    shortName: "Floor & QR",
    description:
      "Floor tables, QR ordering onboarding, live orders, and kitchen display coordination.",
    href: "/admin/tables",
    icon: Truck,
    accent: "#C2410C",
    accentBg: "rgba(194, 65, 12, 0.12)",
    pathPrefixes: ["/admin/tables", "/admin/qr-codes", "/admin/orders"],
    nav: [
      { name: "Floor & Tables", href: "/admin/tables", icon: UtensilsCrossed },
      { name: "QR Onboarding", href: "/admin/qr-codes", icon: QrCode },
      { name: "Orders & KDS", href: "/admin/orders", icon: ShoppingBag },
    ],
  },
  {
    id: "operations",
    name: "Operation & Supply",
    shortName: "Supply",
    description:
      "Ingredient stock, BOM recipes, low-stock alerts, and kitchen supply reconciliation.",
    href: "/admin/inventory",
    icon: Package,
    accent: "#0369A1",
    accentBg: "rgba(3, 105, 161, 0.12)",
    pathPrefixes: ["/admin/inventory"],
    nav: [
      { name: "Inventory & BOM", href: "/admin/inventory", icon: Warehouse },
      { name: "Stock Alerts", href: "/admin/inventory#alerts", icon: Package },
    ],
  },
  {
    id: "sales",
    name: "Point of Sale & Sales",
    shortName: "Sales",
    description:
      "Sales performance, P&L, settlements, and sales configuration for the floor.",
    href: "/admin/finance",
    icon: CircleDollarSign,
    accent: "#15803D",
    accentBg: "rgba(21, 128, 61, 0.12)",
    pathPrefixes: ["/admin/finance"],
    nav: [
      { name: "Sales Dashboard", href: "/admin/finance", icon: BarChart3 },
      { name: "By Order", href: "/admin/finance?tab=orders", icon: ShoppingBag },
      { name: "By Menu Item", href: "/admin/finance?tab=items", icon: UtensilsCrossed },
      { name: "OPEX & Net P&L", href: "/admin/finance?tab=opex", icon: CircleDollarSign },
    ],
  },
  {
    id: "products",
    name: "Product & Category Setup",
    shortName: "Products",
    description:
      "Menu products, categories, availability, and pricing for the digital menu.",
    href: "/admin/menu",
    icon: BookOpen,
    accent: "#7C3AED",
    accentBg: "rgba(124, 58, 237, 0.1)",
    pathPrefixes: ["/admin/menu"],
    nav: [
      { name: "Products & Menu", href: "/admin/menu", icon: BookOpen },
      { name: "Category Setup", href: "/admin/menu#categories", icon: Tag },
    ],
  },
  {
    id: "marketing",
    name: "Core Marketing System",
    shortName: "Marketing",
    description:
      "Guest reviews, ratings, and public-facing brand storytelling for Keren Addis.",
    href: "/admin/reviews",
    icon: Megaphone,
    accent: "#B45309",
    accentBg: "rgba(180, 83, 9, 0.12)",
    pathPrefixes: ["/admin/reviews"],
    nav: [
      { name: "Reviews & Ratings", href: "/admin/reviews", icon: Star },
      { name: "Public Brand Site", href: "/", icon: Megaphone },
    ],
  },
];

export type ModuleAccessMap = Record<ModuleId, boolean>;

export function defaultModuleAccess(): ModuleAccessMap {
  return {
    live: false,
    hr: false,
    delivery: false,
    operations: false,
    sales: false,
    products: false,
    marketing: false,
  };
}

/** Resolve which modules a user may enter from role + permissions JSON. */
export function resolveModuleAccess(
  role: StaffRole | string | undefined,
  permissions?: StaffPermissions | null
): ModuleAccessMap {
  if (role === "admin") {
    return {
      live: true,
      hr: true,
      delivery: true,
      operations: true,
      sales: true,
      products: true,
      marketing: true,
    };
  }

  const stored = permissions?.modules;
  const hasStored =
    stored &&
    typeof stored === "object" &&
    Object.values(stored).some((v) => typeof v === "boolean");

  if (hasStored && stored) {
    return {
      live: !!stored.live,
      hr: !!stored.hr,
      delivery: !!stored.delivery,
      operations: !!stored.operations,
      sales: !!stored.sales,
      products: !!stored.products,
      marketing: !!stored.marketing,
    };
  }

  // Legacy fallback from the four classic flags
  return {
    live: true,
    hr: !!(permissions?.can_manage_staff || permissions?.can_manage_shifts),
    delivery: true,
    operations: !!permissions?.can_manage_inventory,
    sales: !!permissions?.can_view_finance,
    products: true,
    marketing: true,
  };
}

export function getModuleById(id: ModuleId): AdminModule | undefined {
  return ADMIN_MODULES.find((m) => m.id === id);
}

export function getModuleForPath(pathname: string): AdminModule | null {
  if (!pathname || pathname === "/admin/modules" || pathname === "/admin") return null;
  const clean = pathname.split("?")[0];
  for (const mod of ADMIN_MODULES) {
    if (mod.pathPrefixes.some((prefix) => clean === prefix || clean.startsWith(prefix + "/"))) {
      return mod;
    }
  }
  return null;
}

export function canAccessModule(
  moduleId: ModuleId,
  role: StaffRole | string | undefined,
  permissions?: StaffPermissions | null
): boolean {
  return !!resolveModuleAccess(role, permissions)[moduleId];
}
