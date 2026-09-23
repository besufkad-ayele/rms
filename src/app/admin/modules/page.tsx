"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChefHat, Grid3X3, Sparkles } from "lucide-react";
import { getCurrentSessionAction } from "@/app/rms-login/actions";
import {
  ADMIN_MODULES,
  resolveModuleAccess,
  type ModuleId,
} from "@/lib/modules/registry";
import { cn } from "@/lib/utils";

export default function AdminModulesHubPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<{
    fullName: string;
    role: string;
    permissions?: any;
  } | null>(null);
  const [hovered, setHovered] = useState<ModuleId | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const session = await getCurrentSessionAction();
      if (cancelled) return;
      if (!session) {
        router.push("/rms-login");
        return;
      }
      setSessionUser({
        fullName: session.fullName,
        role: session.role,
        permissions: session.permissions,
      });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const access = useMemo(
    () => resolveModuleAccess(sessionUser?.role, sessionUser?.permissions),
    [sessionUser]
  );

  const modules = ADMIN_MODULES.filter((m) => access[m.id]);

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(139,66,84,0.14), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(15,118,110,0.1), transparent 50%), radial-gradient(ellipse 50% 30% at 50% 100%, rgba(194,65,12,0.08), transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B4254' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="mx-auto max-w-6xl space-y-10 pb-12">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-pill border border-divider bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-accent shadow-xs backdrop-blur">
            <Grid3X3 className="h-3.5 w-3.5" />
            Module Command Center
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-brand-heading sm:text-4xl lg:text-5xl">
            Keren Addis
          </h1>
          <p className="max-w-xl text-xs leading-relaxed text-brand-secondary sm:text-sm">
            Choose a module to open its workspace. Tools live in the sidebar once you are inside —
            use <strong className="text-brand-primary">All Modules</strong> in the top bar to return here.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-primary px-3 py-1.5 font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
            {modules.length} modules available
          </span>
          <span className="w-full text-brand-secondary sm:w-auto">
            Access is granted per module by the restaurant owner.
          </span>
        </div>

        {modules.length === 0 ? (
          <div className="rounded-card border border-dashed border-divider bg-white/70 p-8 text-center sm:p-12">
            <ChefHat className="mx-auto h-10 w-10 text-brand-secondary opacity-50" />
            <p className="mt-3 font-header text-lg font-bold text-brand-heading">
              No modules assigned
            </p>
            <p className="mt-1 text-xs text-brand-secondary">
              Ask a super admin to grant module access on your staff record.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((mod, index) => {
              const Icon = mod.icon;
              const isHot = hovered === mod.id;
              return (
                <Link
                  key={mod.id}
                  href={mod.href}
                  onMouseEnter={() => setHovered(mod.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    "group relative overflow-hidden rounded-card border border-divider bg-white/95 p-5 shadow-card transition-all duration-300 sm:p-6",
                    "active:scale-[0.99] hover:-translate-y-1 hover:shadow-elevated"
                  )}
                  style={{
                    animationDelay: `${index * 40}ms`,
                    borderColor: isHot ? mod.accent : undefined,
                  }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                    style={{ backgroundColor: mod.accent }}
                  />
                  <div
                    className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                    style={{ backgroundColor: mod.accentBg }}
                  />

                  <div className="relative flex items-start justify-between gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: mod.accentBg, color: mod.accent }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-pill border border-divider bg-bg-subtle px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-secondary">
                      {mod.shortName}
                    </span>
                  </div>

                  <h2 className="relative mt-5 font-header text-xl font-bold text-brand-heading">
                    {mod.name}
                  </h2>
                  <p className="relative mt-2 text-xs leading-relaxed text-brand-secondary">
                    {mod.description}
                  </p>

                  <div className="relative mt-5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-brand-secondary">
                      {mod.nav.length} workspace tools
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold transition-all group-hover:gap-2.5"
                      style={{ color: mod.accent }}
                    >
                      Enter module
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
