"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChefHat,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Building2,
  Package,
  UtensilsCrossed,
  Sparkles,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authenticateStaffAction } from "./actions";

// Quick-fill credentials for testing seeded database accounts
const SEED_ACCOUNTS_PREVIEW = [
  {
    roleName: "Owner (Super Admin)",
    identifier: "owner@admasrms.com",
    pin: "123456",
    target: "/admin/dashboard",
    faydaId: "ETH-FAYDA-98234120",
    badgeColor: "bg-brand-accent text-white",
  },
  {
    roleName: "Operations Manager",
    identifier: "manager@admasrms.com",
    pin: "123456",
    target: "/admin/dashboard",
    faydaId: "ETH-FAYDA-48192031",
    badgeColor: "bg-brand-primary text-white",
  },
  {
    roleName: "Inventory Specialist",
    identifier: "inventory@admasrms.com",
    pin: "123456",
    target: "/admin/inventory",
    faydaId: "ETH-FAYDA-39201948",
    badgeColor: "bg-status-occupied text-white",
  },
  {
    roleName: "Head Kitchen Chef",
    identifier: "chef@admasrms.com",
    pin: "123456",
    target: "/chef/dashboard",
    faydaId: "ETH-FAYDA-51920384",
    badgeColor: "bg-status-kitchen text-white",
  },
  {
    roleName: "Floor Attendant (Waiter)",
    identifier: "waiter@admasrms.com",
    pin: "123456",
    target: "/staff/dashboard",
    faydaId: "ETH-FAYDA-67291048",
    badgeColor: "bg-status-free text-white",
  },
  {
    roleName: "Terrace Attendant (Sara)",
    identifier: "sara.m@admasrms.com",
    pin: "123456",
    target: "/staff/dashboard",
    faydaId: "ETH-FAYDA-19203847",
    badgeColor: "bg-status-free text-white",
  },
];

export default function RMSLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [identifier, setIdentifier] = useState<string>("owner@admasrms.com");
  const [pin, setPin] = useState<string>("123456");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await authenticateStaffAction(identifier, pin);
      if (res.success && res.redirectTo) {
        setSuccessInfo(`Authenticated as ${res.user?.fullName} (${res.user?.role?.toUpperCase()}). Loading dashboard...`);
        router.push(res.redirectTo);
      } else {
        setErrorMessage(res.message || "Invalid authentication credentials.");
      }
    });
  };

  const handleQuickFill = (acc: typeof SEED_ACCOUNTS_PREVIEW[0]) => {
    setIdentifier(acc.identifier);
    setPin(acc.pin);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-sm">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-header font-bold text-base text-brand-heading leading-tight">
              Admas Lounge
            </h1>
            <p className="text-[11px] font-medium text-brand-secondary">
              Restaurant Management System (RMS)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-brand-secondary">
          <ShieldCheck className="h-4 w-4 text-status-free" />
          <span>Internal Portal (Not publicly listed)</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="rounded-card bg-white p-6 sm:p-8 border border-divider shadow-elevated space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-accent/10 px-3 py-0.5 text-xs font-bold text-brand-accent">
              <KeyRound className="h-3.5 w-3.5" />
              Staff Personnel Sign-In
            </span>
            <h2 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
              Access Your Workspace
            </h2>
            <p className="font-sans text-xs text-brand-secondary">
              Enter your registered Email, Phone, or National Fayda ID along with your secure PIN.
            </p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-card bg-status-danger-bg p-3 border border-status-danger/30 text-xs font-semibold text-status-danger animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successInfo && (
            <div className="flex items-center gap-2.5 rounded-card bg-status-free-bg p-3 border border-status-free/30 text-xs font-semibold text-status-free animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* Sign-In Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-brand-primary block mb-1.5">
                Email, Phone Number or National Fayda ID:
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. owner@admasrms.com or ETH-FAYDA-98234120"
                  className="w-full pl-9 pr-3 py-2.5 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary placeholder:text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-brand-primary block mb-1.5">
                Secret PIN or Password:
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your 4-6 digit PIN"
                  className="w-full pl-9 pr-10 py-2.5 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-accent font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-primary"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-button bg-brand-accent py-3 text-xs font-bold text-white shadow-sm hover:bg-brand-accentHover transition disabled:opacity-50"
            >
              <span>{isPending ? "Authenticating..." : "Sign In to Workspace"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick-Fill Seeded Accounts Selector */}
          <div className="pt-4 border-t border-divider space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary text-center">
              Quick Test Seeded Database Accounts:
            </p>
            <div className="space-y-1.5">
              {SEED_ACCOUNTS_PREVIEW.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-button border text-left transition hover:border-brand-accent text-[11px]",
                    identifier === acc.identifier
                      ? "bg-bg-active border-brand-accent font-semibold"
                      : "bg-bg-subtle border-divider/60"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("px-1.5 py-0.5 rounded-pill text-[9px] font-bold", acc.badgeColor)}>
                      {acc.roleName.split(" ")[0]}
                    </span>
                    <span className="text-brand-primary font-mono">{acc.identifier}</span>
                  </div>
                  <span className="text-brand-secondary text-[10px] font-mono">PIN: {acc.pin}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-5xl w-full mx-auto text-center text-[11px] text-brand-secondary space-y-1">
        <p>
          Admas Lounge Management OS • Row-Level Security (RLS) &amp; Dispute-Proof Audit Trail
        </p>
        <p className="text-[10px]">
          Confidential Restaurant Enterprise System • Access restricted to authorized personnel.
        </p>
      </div>
    </div>
  );
}
