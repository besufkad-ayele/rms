"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUserAction } from "@/app/rms-login/actions";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Package,
  CalendarDays,
  ShoppingBag,
  CircleDollarSign,
  Star,
  Search,
  ChefHat,
  LogOut,
  UserCheck,
  Shield,
  RefreshCw,
  QrCode,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AccessDeniedBanner from "@/components/ui/AccessDeniedBanner";

const ALL_NAVIGATION_ITEMS = [
  { name: "Live Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, requiredPermission: "all" },
  { name: "Staff & Human Resources", href: "/admin/staff", icon: Users, requiredPermission: "can_manage_staff" },
  { name: "Shifts & Roster", href: "/admin/shifts", icon: CalendarDays, requiredPermission: "can_manage_shifts" },
  { name: "Inventory & BOM", href: "/admin/inventory", icon: Package, requiredPermission: "can_manage_inventory" },
  { name: "Menu Management", href: "/admin/menu", icon: BookOpen, requiredPermission: "all" },
  { name: "Floor & Tables", href: "/admin/tables", icon: UtensilsCrossed, requiredPermission: "all" },
  { name: "QR Code Generator", href: "/admin/qr-codes", icon: QrCode, requiredPermission: "all" },
  { name: "Orders & KDS", href: "/admin/orders", icon: ShoppingBag, requiredPermission: "all" },
  { name: "Finance & P&L", href: "/admin/finance", icon: CircleDollarSign, requiredPermission: "can_view_finance" },
  { name: "Reviews & Ratings", href: "/admin/reviews", icon: Star, requiredPermission: "all" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<{
    fullName: string;
    role: string;
    permissions?: Record<string, boolean>;
  } | null>(null);

  useEffect(() => {
    // Parse user session from document.cookie
    try {
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("rms_session_user="));
      if (match) {
        const jsonStr = decodeURIComponent(match.split("=")[1]);
        const parsed = JSON.parse(jsonStr);
        setSessionUser(parsed);
      } else {
        setSessionUser(null);
        router.push("/rms-login");
      }
    } catch (e) {
      setSessionUser(null);
      router.push("/rms-login");
    }
  }, [pathname, router]);

  const isSuperAdmin = sessionUser?.role === "admin";
  const userPermissions = sessionUser?.permissions || {};

  // Filter navigation items dynamically based on role & permissions
  const visibleNavItems = ALL_NAVIGATION_ITEMS.filter((item) => {
    if (isSuperAdmin) return true;
    if (item.requiredPermission === "all") return true;
    if (item.requiredPermission === "can_view_finance" && !userPermissions.can_view_finance) return false;
    if (item.requiredPermission === "can_manage_staff" && !userPermissions.can_manage_staff) return false;
    if (item.requiredPermission === "can_manage_shifts" && !userPermissions.can_manage_shifts) return false;
    if (item.requiredPermission === "can_manage_inventory" && !userPermissions.can_manage_inventory) return false;
    return true;
  });

  // Check if current route is allowed
  const currentNavItem = ALL_NAVIGATION_ITEMS.find((item) => pathname.startsWith(item.href));
  const isAccessDenied =
    currentNavItem &&
    !isSuperAdmin &&
    currentNavItem.requiredPermission !== "all" &&
    !userPermissions[currentNavItem.requiredPermission];

  const getInitials = (name?: string) => {
    if (!name) return "AK";
    const parts = name.split(" ");
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-bg-main flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-divider bg-white flex flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div>
          {/* Logo & Brand Header */}
          <div className="p-6 border-b border-divider flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-sm">
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display font-bold text-base text-brand-primary leading-tight">
                  Keren Addis
                </h1>
                <p className="text-[11px] font-medium text-brand-secondary">
                  Management OS
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-secondary/70">
              Role Authorized Modules ({visibleNavItems.length})
            </div>
            {visibleNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-button text-xs font-semibold transition-all duration-150",
                    isActive
                      ? "bg-bg-active text-brand-primary border-l-4 border-brand-accent shadow-xs"
                      : "text-brand-secondary hover:bg-bg-card/40 hover:text-brand-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-brand-accent" : "text-brand-secondary"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-divider space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {getInitials(sessionUser?.fullName)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-brand-heading truncate max-w-[110px]">
                  {sessionUser?.fullName || "Abebe Kebede"}
                </span>
                <span className="text-[10px] text-brand-secondary capitalize font-medium">
                  {isSuperAdmin ? "Super Admin" : sessionUser?.role || "Staff"}
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                await logoutUserAction();
                router.push("/rms-login");
              }}
              title="Sign Out to Owner / Admin Login Portal"
              className="flex items-center gap-1 text-brand-secondary hover:text-status-danger p-1.5 rounded-button hover:bg-status-danger-bg/50 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <Link
            href="/rms-login"
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-button bg-bg-subtle hover:bg-bg-card text-[11px] font-bold text-brand-primary border border-divider transition"
          >
            <UserCheck className="h-3.5 w-3.5 text-brand-accent" />
            <span>Admin Sign-In Portal</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-divider bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4 max-w-md w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
              <input
                type="text"
                placeholder="Search staff, shifts, Fayda IDs, tables..."
                className="w-full pl-9 pr-4 py-1.5 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary placeholder:text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-status-free-bg px-2.5 py-1 text-xs font-semibold text-status-free border border-status-free/20">
              <span className="h-1.5 w-1.5 rounded-full bg-status-free" />
              {isSuperAdmin ? "Super Admin Active" : `${sessionUser?.role?.toUpperCase() || "STAFF"} MODE`}
            </span>
            <div className="h-6 w-px bg-divider" />
            <button
              onClick={async () => {
                await logoutUserAction();
                router.push("/rms-login");
              }}
              title="Sign Out to Admin Login Portal"
              className="flex items-center gap-1.5 rounded-button bg-bg-card px-3.5 py-1.5 text-xs font-semibold text-brand-primary border border-divider hover:bg-status-danger-bg hover:text-status-danger hover:border-status-danger/30 transition shadow-xs cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {isAccessDenied ? (
            <AccessDeniedBanner
              userRole={sessionUser?.role || "Staff"}
              requiredRole={currentNavItem?.name || "Admin"}
              redirectPath={visibleNavItems[0]?.href || "/staff/dashboard"}
            />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
