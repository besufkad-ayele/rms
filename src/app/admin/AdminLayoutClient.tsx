"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChefHat, Grid3X3, LogOut, Menu, Search, X } from "lucide-react";
import { getCurrentSessionAction, logoutUserAction } from "@/app/rms-login/actions";
import {
  ADMIN_MODULES,
  canAccessModule,
  getModuleForPath,
  resolveModuleAccess,
} from "@/lib/modules/registry";
import { cn } from "@/lib/utils";
import AccessDeniedBanner from "@/components/ui/AccessDeniedBanner";

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-button px-3.5 py-2.5 text-xs font-semibold transition-all duration-150",
        active
          ? "border-l-4 border-brand-accent bg-bg-active text-brand-primary shadow-xs"
          : "text-brand-secondary hover:bg-bg-card/40 hover:text-brand-primary"
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-brand-accent" : "text-brand-secondary")} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isHub = pathname === "/admin/modules" || pathname === "/admin";
  const tab = searchParams.get("tab");

  const [sessionUser, setSessionUser] = useState<{
    fullName: string;
    role: string;
    permissions?: any;
  } | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close drawer on route / tab change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, tab]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      const session = await getCurrentSessionAction();
      if (cancelled) return;
      if (!session) {
        setSessionUser(null);
        router.push("/rms-login");
        return;
      }
      setSessionUser({
        fullName: session.fullName,
        role: session.role,
        permissions: session.permissions,
      });
    }
    loadSession();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const isSuperAdmin = sessionUser?.role === "admin";
  const moduleAccess = useMemo(
    () => resolveModuleAccess(sessionUser?.role, sessionUser?.permissions),
    [sessionUser]
  );

  const activeModule = useMemo(() => getModuleForPath(pathname), [pathname]);

  const isAccessDenied =
    !!activeModule &&
    !!sessionUser &&
    !canAccessModule(activeModule.id, sessionUser.role, sessionUser.permissions);

  const getInitials = (name?: string) => {
    if (!name) return "AK";
    const parts = name.split(" ");
    return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.substring(0, 2);
  };

  const signOut = async () => {
    await logoutUserAction();
    router.push("/rms-login");
  };

  const firstAllowedHref =
    ADMIN_MODULES.find((m) => moduleAccess[m.id])?.href || "/admin/modules";

  const isNavActive = (href: string) => {
    if (href === "/") return false;
    const [path, query] = href.split("?");
    if (query?.startsWith("tab=")) {
      const expected = query.replace("tab=", "");
      if (path === "/admin/dashboard") {
        const current = tab || "overview";
        return pathname.startsWith("/admin/dashboard") && current === expected;
      }
      if (path === "/admin/staff") {
        const current = tab || "overview";
        return pathname.startsWith("/admin/staff") && current === expected;
      }
      return pathname === path && tab === expected;
    }
    if (path === "/admin/shifts") return pathname.startsWith("/admin/shifts");
    if (pathname === path) return !tab;
    if (path !== "/admin/staff" && path !== "/admin/dashboard" && pathname.startsWith(path + "/")) {
      return true;
    }
    return false;
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  const sidebarContent = (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-divider p-4 sm:p-6">
          <Link href="/admin/modules" onClick={closeMobileNav} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm">
              <ChefHat className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-base font-bold leading-tight text-brand-primary">
                Keren Addis
              </h1>
              <p className="truncate text-[11px] font-medium text-brand-secondary">
                {activeModule?.shortName || "Workspace"}
              </p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-button p-2 text-brand-secondary hover:bg-bg-subtle lg:hidden"
            onClick={closeMobileNav}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          <Link
            href="/admin/modules"
            onClick={closeMobileNav}
            className="mb-2 flex items-center gap-3 rounded-button border border-divider bg-bg-subtle px-3.5 py-2.5 text-xs font-bold text-brand-primary transition hover:bg-bg-card lg:hidden"
          >
            <Grid3X3 className="h-4 w-4 text-brand-accent" />
            All Modules
          </Link>
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-secondary/70">
            {activeModule ? `${activeModule.shortName} tools` : "Navigation"}
          </div>
          {(activeModule?.nav || []).map((item) => (
            <NavLink
              key={item.name + item.href}
              href={item.href}
              label={item.name}
              icon={item.icon}
              active={isNavActive(item.href)}
              onNavigate={closeMobileNav}
            />
          ))}
        </nav>
      </div>

      <div className="border-t border-divider p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white shadow-xs">
            {getInitials(sessionUser?.fullName)}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-bold text-brand-heading">
              {sessionUser?.fullName || "…"}
            </span>
            <span className="text-[10px] font-medium capitalize text-brand-secondary">
              {isSuperAdmin ? "Super Admin" : sessionUser?.role || "Staff"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-button border border-divider bg-bg-card px-3 py-2 text-xs font-semibold text-brand-primary transition hover:border-status-danger/30 hover:bg-status-danger-bg hover:text-status-danger lg:hidden"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </>
  );

  const topBar = (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-divider bg-white/90 px-3 backdrop-blur-md sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        {!isHub && (
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex shrink-0 items-center justify-center rounded-button border border-divider bg-bg-subtle p-2 text-brand-primary transition hover:bg-bg-card lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {isHub ? (
          <Link href="/admin/modules" className="flex min-w-0 shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm">
              <ChefHat className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold leading-tight text-brand-primary">
                Keren Addis
              </p>
              <p className="hidden text-[10px] font-medium text-brand-secondary sm:block">
                Management OS
              </p>
            </div>
          </Link>
        ) : (
          <Link
            href="/admin/modules"
            className="hidden shrink-0 items-center gap-2 rounded-button border border-divider bg-bg-subtle px-3 py-2 text-xs font-bold text-brand-primary transition hover:bg-bg-card sm:inline-flex"
          >
            <Grid3X3 className="h-3.5 w-3.5 text-brand-accent" />
            <span className="hidden md:inline">All Modules</span>
            <span className="md:hidden">Modules</span>
          </Link>
        )}

        {!isHub && activeModule && (
          <span
            className="max-w-[40%] truncate rounded-pill border px-2 py-0.5 text-[10px] font-semibold sm:hidden"
            style={{
              backgroundColor: activeModule.accentBg,
              color: activeModule.accent,
              borderColor: `${activeModule.accent}33`,
            }}
          >
            {activeModule.shortName}
          </span>
        )}

        {!isHub && (
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-secondary" />
            <input
              type="text"
              placeholder={
                activeModule
                  ? `Search in ${activeModule.shortName}…`
                  : "Search staff, tables…"
              }
              className="w-full rounded-button border border-divider bg-bg-subtle py-1.5 pl-9 pr-4 text-xs text-brand-primary placeholder:text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {activeModule && !isHub && (
          <span
            className="hidden items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-semibold sm:inline-flex"
            style={{
              backgroundColor: activeModule.accentBg,
              color: activeModule.accent,
              borderColor: `${activeModule.accent}33`,
            }}
          >
            {activeModule.shortName}
          </span>
        )}
        <span className="hidden items-center gap-1.5 rounded-pill border border-status-free/20 bg-status-free-bg px-2.5 py-1 text-[10px] font-semibold text-status-free sm:inline-flex sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-status-free" />
          <span className="max-w-[5rem] truncate sm:max-w-none">
            {isSuperAdmin ? "Admin" : sessionUser?.role || "Staff"}
          </span>
        </span>
        <div className="hidden h-6 w-px bg-divider sm:block" />
        <div className="hidden items-center gap-2 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
            {getInitials(sessionUser?.fullName)}
          </div>
          <span className="max-w-[120px] truncate text-xs font-bold text-brand-heading">
            {sessionUser?.fullName || "…"}
          </span>
        </div>
        <button
          onClick={signOut}
          className="flex cursor-pointer items-center gap-1.5 rounded-button border border-divider bg-bg-card p-2 text-xs font-semibold text-brand-primary shadow-xs transition hover:border-status-danger/30 hover:bg-status-danger-bg hover:text-status-danger sm:px-3 sm:py-1.5"
          aria-label="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );

  // Module hub: no sidebar — full-bleed selection surface
  if (isHub) {
    return (
      <div className="flex min-h-screen flex-col bg-bg-main">
        {topBar}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-main">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-divider bg-white lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileNavOpen}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-200",
            mobileNavOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={closeMobileNav}
          aria-label="Close overlay"
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-divider bg-white shadow-elevated transition-transform duration-200 ease-out",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {topBar}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {isAccessDenied ? (
            <AccessDeniedBanner
              userRole={sessionUser?.role || "Staff"}
              requiredRole={activeModule?.name || "Admin"}
              redirectPath={firstAllowedHref}
            />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
