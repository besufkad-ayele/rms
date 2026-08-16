"use client";

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
  Bell,
  ChefHat,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Live Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Staff & HR (Phase 1)", href: "/admin/staff", icon: Users, badge: "Phase 1" },
  { name: "Shifts & Roster", href: "/admin/shifts", icon: CalendarDays },
  { name: "Inventory & BOM", href: "/admin/inventory", icon: Package },
  { name: "Floor & Tables", href: "/admin/tables", icon: UtensilsCrossed },
  { name: "Orders & KDS", href: "/admin/orders", icon: ShoppingBag },
  { name: "Finance & P&L", href: "/admin/finance", icon: CircleDollarSign },
  { name: "Reviews & Ratings", href: "/admin/reviews", icon: Star },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-main flex">
      {/* Editorial Sidebar */}
      <aside className="w-64 border-r border-divider bg-white flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Brand Header */}
          <div className="p-6 border-b border-divider flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-sm">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-brand-primary leading-tight">
                Admas Lounge
              </h1>
              <p className="text-[11px] font-medium text-brand-secondary">
                Management OS
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navigationItems.map((item) => {
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
                  {item.badge && (
                    <span className="rounded-pill bg-brand-accent/10 px-2 py-0.5 text-[10px] font-bold text-brand-accent">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-divider flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
              AK
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-brand-heading">
                Abebe Kebede
              </span>
              <span className="text-[10px] text-brand-secondary">
                Super Admin
              </span>
            </div>
          </div>
          <button
            onClick={async () => {
              await logoutUserAction();
              router.push("/rms-login");
            }}
            title="Sign Out to Login Portal"
            className="flex items-center gap-1 text-brand-secondary hover:text-status-danger p-1.5 rounded-button hover:bg-status-danger-bg/50 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
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
              System Online
            </span>
            <div className="h-6 w-px bg-divider" />
            <button
              onClick={async () => {
                await logoutUserAction();
                router.push("/rms-login");
              }}
              title="Sign Out to Login Portal"
              className="flex items-center gap-1.5 rounded-button bg-bg-card px-3.5 py-1.5 text-xs font-semibold text-brand-primary border border-divider hover:bg-status-danger-bg hover:text-status-danger hover:border-status-danger/30 transition shadow-xs cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
