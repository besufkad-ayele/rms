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
  Crown,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authenticateStaffAction } from "./actions";

export default function RMSLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [identifier, setIdentifier] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await authenticateStaffAction(identifier, pin);
      if (res.success && res.redirectTo) {
        setSuccessInfo(`Authenticated as ${res.user?.fullName} (${res.user?.role?.toUpperCase()}). Directing to workspace...`);
        router.push(res.redirectTo);
      } else {
        setErrorMessage(res.message || "Invalid authentication credentials.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-sm">
            <ChefHat className="h-5 w-5 text-brand-accent" />
          </div>
          <div>
            <h1 className="font-header font-bold text-base text-brand-heading leading-tight">
              Keren Addis OS
            </h1>
            <p className="text-[11px] font-medium text-brand-secondary">
              Owner &amp; Admin Enterprise Management Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-brand-secondary">
          <ShieldCheck className="h-4 w-4 text-status-free" />
          <span>Encrypted Portal (Role-Controlled)</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="rounded-card bg-white p-6 sm:p-8 border border-divider shadow-elevated space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-accent/10 px-3 py-0.5 text-xs font-bold text-brand-accent">
              <KeyRound className="h-3.5 w-3.5" />
              Owner &amp; Admin Sign-In
            </span>
            <h2 className="font-header text-2xl font-bold text-brand-heading tracking-tight">
              Sign In to Management Hub
            </h2>
            <p className="font-sans text-xs text-brand-secondary">
              Enter your registered Email, Phone, or National Fayda ID to access management dashboards.
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
                Registered Email, Phone, or National Fayda ID:
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. owner@tibebrms.com or ETH-FAYDA-98234120"
                  className="w-full pl-9 pr-3 py-2.5 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary placeholder:text-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-accent"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-brand-primary block mb-1.5">
                Password or Secret PIN:
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-secondary" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter Password or PIN"
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
              <span>{isPending ? "Authenticating..." : "Sign In as Executive"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-5xl w-full mx-auto text-center text-[11px] text-brand-secondary space-y-1">
        <p>
          Keren Addis OS • Row-Level Security (RLS) &amp; Financial Audit Trail
        </p>
        <p className="text-[10px]">
          Confidential Enterprise Portal • Access restricted to owner and designated administration personnel.
        </p>
      </div>
    </div>
  );
}
