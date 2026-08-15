import {
  UtensilsCrossed,
  LayoutDashboard,
  QrCode,
  ChefHat,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Plus,
  ArrowRight,
  ShieldCheck,
  Package,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-main">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-divider bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-brand-primary">
                RMS Operating System
              </span>
              <span className="ml-2.5 rounded-pill bg-bg-active px-2.5 py-0.5 text-xs font-semibold text-brand-accent">
                Design System v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-pill bg-status-free-bg px-3 py-1 text-xs font-semibold text-status-free">
              <span className="h-2 w-2 rounded-full bg-status-free animate-pulse" />
              Engine Online
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-12">
        {/* Hero Section */}
        <section className="rounded-card border border-divider bg-bg-subtle p-8 lg:p-10 shadow-card">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-pill bg-bg-active px-3 py-1 text-xs font-semibold text-brand-accent">
              <ShieldCheck className="h-3.5 w-3.5" />
              Editorial • Soft Neutral Mauve-Grey • Data-First
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-brand-primary lg:text-5xl">
              Restaurant Management System
            </h1>
            <p className="text-base leading-relaxed text-brand-secondary font-sans">
              Configured with Next.js 16 App Router, Tailwind CSS v4, Lato & Montserrat typography,
              and a custom soft mauve-grey token system for high-density restaurant operations.
            </p>
          </div>
        </section>

        {/* Color Tokens Matrix */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-brand-primary">
            Design Tokens & Palette
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-card border border-divider bg-white p-4 shadow-card">
              <div className="h-12 w-full rounded-button bg-bg-main border border-divider" />
              <div className="mt-3">
                <p className="text-xs font-semibold text-brand-primary">Canvas Main</p>
                <p className="text-[11px] text-brand-secondary font-mono">#FFFFFF</p>
              </div>
            </div>

            <div className="rounded-card border border-divider bg-white p-4 shadow-card">
              <div className="h-12 w-full rounded-button bg-bg-card" />
              <div className="mt-3">
                <p className="text-xs font-semibold text-brand-primary">Card Surface</p>
                <p className="text-[11px] text-brand-secondary font-mono">#E4DEE4</p>
              </div>
            </div>

            <div className="rounded-card border border-divider bg-white p-4 shadow-card">
              <div className="h-12 w-full rounded-button bg-bg-active" />
              <div className="mt-3">
                <p className="text-xs font-semibold text-brand-primary">Active Pill</p>
                <p className="text-[11px] text-brand-secondary font-mono">#EDE3E4</p>
              </div>
            </div>

            <div className="rounded-card border border-divider bg-white p-4 shadow-card">
              <div className="h-12 w-full rounded-button bg-brand-primary" />
              <div className="mt-3">
                <p className="text-xs font-semibold text-brand-primary">Brand Primary</p>
                <p className="text-[11px] text-brand-secondary font-mono">#231F20</p>
              </div>
            </div>

            <div className="rounded-card border border-divider bg-white p-4 shadow-card">
              <div className="h-12 w-full rounded-button bg-brand-secondary" />
              <div className="mt-3">
                <p className="text-xs font-semibold text-brand-primary">Brand Secondary</p>
                <p className="text-[11px] text-brand-secondary font-mono">#92898A</p>
              </div>
            </div>

            <div className="rounded-card border border-divider bg-white p-4 shadow-card">
              <div className="h-12 w-full rounded-button bg-brand-accent" />
              <div className="mt-3">
                <p className="text-xs font-semibold text-brand-primary">Rose Accent (CTA)</p>
                <p className="text-[11px] text-brand-secondary font-mono">#8B4254</p>
              </div>
            </div>
          </div>
        </section>

        {/* Operational Status Badges */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-brand-primary">
            Operational Status Matrix
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="flex items-center gap-3 rounded-card border border-divider bg-status-free-bg p-3.5">
              <CheckCircle2 className="h-5 w-5 text-status-free" />
              <div>
                <p className="text-xs font-bold text-status-free">Free / Healthy</p>
                <p className="text-[11px] text-brand-secondary font-mono">#16A34A</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-card border border-divider bg-status-occupied-bg p-3.5">
              <Clock className="h-5 w-5 text-status-occupied" />
              <div>
                <p className="text-xs font-bold text-status-occupied">Occupied</p>
                <p className="text-[11px] text-brand-secondary font-mono">#D97706</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-card border border-divider bg-status-reserved-bg p-3.5">
              <TrendingUp className="h-5 w-5 text-status-reserved" />
              <div>
                <p className="text-xs font-bold text-status-reserved">Reserved</p>
                <p className="text-[11px] text-brand-secondary font-mono">#4F46E5</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-card border border-divider bg-status-prep-bg p-3.5">
              <ChefHat className="h-5 w-5 text-status-prep" />
              <div>
                <p className="text-xs font-bold text-status-prep">Kitchen Prep</p>
                <p className="text-[11px] text-brand-secondary font-mono">#0284C7</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-card border border-divider bg-status-danger-bg p-3.5">
              <AlertTriangle className="h-5 w-5 text-status-danger" />
              <div>
                <p className="text-xs font-bold text-status-danger">Danger / Out</p>
                <p className="text-[11px] text-brand-secondary font-mono">#E11D48</p>
              </div>
            </div>
          </div>
        </section>

        {/* Live UI Component Previews */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-brand-primary">
              Portal Previews & Interaction Cards
            </h2>
            <span className="text-xs text-brand-secondary font-medium">Live Render</span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* 1. Admin Floor Card */}
            <div className="rounded-card border border-divider bg-white p-6 shadow-card transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-secondary">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Floor Node
                </span>
                <span className="rounded-pill bg-status-occupied-bg px-2.5 py-0.5 text-xs font-bold text-status-occupied">
                  Occupied (42m)
                </span>
              </div>
              <div className="mt-4">
                <p className="font-display text-2xl font-bold text-brand-primary">Table 04</p>
                <p className="text-xs text-brand-secondary">Attendant: Michael T. • 4 Guests</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-divider pt-3 text-xs">
                <span className="font-medium text-brand-secondary">Current Bill</span>
                <span className="font-bold text-brand-primary">1,450.00 ETB</span>
              </div>
            </div>

            {/* 2. Customer QR Menu Card */}
            <div className="rounded-card border border-divider bg-white p-6 shadow-card transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-secondary">
                  <QrCode className="h-4 w-4" />
                  Customer QR Card
                </span>
                <span className="inline-flex items-center gap-1 rounded-pill bg-bg-active px-2 py-0.5 text-xs font-semibold text-brand-accent">
                  <Flame className="h-3 w-3" /> Chef Pick
                </span>
              </div>
              <div className="mt-4">
                <p className="font-display text-xl font-bold text-brand-primary">Tibs Firfir Deluxe</p>
                <p className="text-xs text-brand-secondary mt-1 line-clamp-2">
                  Prime beef simmered in awaze berbere butter sauce, served with injera.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-divider pt-3">
                <span className="font-bold text-brand-primary">380.00 ETB</span>
                <button className="inline-flex items-center gap-1 rounded-button bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-accent-hover">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>

            {/* 3. Kitchen KDS Ticket */}
            <div className="rounded-card border border-divider bg-white p-6 shadow-card transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-elevated">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-secondary">
                  <ChefHat className="h-4 w-4" />
                  KDS Kitchen Ticket
                </span>
                <span className="rounded-pill bg-status-prep-bg px-2.5 py-0.5 text-xs font-bold text-status-prep">
                  In Oven (7m)
                </span>
              </div>
              <div className="mt-4">
                <p className="font-display text-xl font-bold text-brand-primary">Ticket #108</p>
                <p className="text-xs text-brand-secondary">Table 07 • 2x Special Kitfo, 1x Tej</p>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-divider pt-3">
                <button className="w-full rounded-button bg-status-prep text-white py-1.5 text-xs font-semibold hover:opacity-90 transition">
                  Mark Ready
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
