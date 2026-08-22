"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChefHat,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  User,
  ArrowRight,
  Sparkles,
  Users,
  UtensilsCrossed,
  Flame,
  Delete,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Staff } from "@/types/database";
import { getStaffProfilesAction, authenticateStaffByPinAction } from "./actions";

export default function StaffSharedTabletLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [pinInput, setPinInput] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfiles() {
      const data = await getStaffProfilesAction();
      setStaffList(data);
    }
    loadProfiles();
  }, []);

  const handleSelectStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setPinInput("");
    setErrorMessage(null);
  };

  const handleKeypadPress = (digit: string) => {
    if (pinInput.length < 8) {
      setPinInput((prev) => prev + digit);
    }
  };

  const handleKeypadBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedStaff) return;
    if (!pinInput.trim()) {
      setErrorMessage("Please enter your PIN code.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const res = await authenticateStaffByPinAction(selectedStaff.id, pinInput);
      if (res.success && res.redirectTo) {
        setSuccessInfo(`Welcome back, ${selectedStaff.full_name}! Redirecting...`);
        setTimeout(() => {
          router.push(res.redirectTo!);
        }, 500);
      } else {
        setErrorMessage(res.message || "Incorrect PIN code.");
      }
    });
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-brand-accent text-white";
      case "manager":
        return "bg-brand-primary text-white";
      case "cook":
        return "bg-status-kitchen text-white";
      case "waiter":
        return "bg-status-free text-white";
      case "host":
        return "bg-status-occupied text-white";
      default:
        return "bg-bg-card text-brand-primary border border-divider";
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-bg-main flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 border-b border-divider bg-white/90 backdrop-blur-md px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-xs">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-brand-primary leading-tight">
              Admas Shared Tablet Terminal
            </h1>
            <p className="text-[11px] font-medium text-brand-secondary">
              Floor &amp; Kitchen Quick Attendant Switcher
            </p>
          </div>
        </div>

        <Link
          href="/rms-login"
          className="flex items-center gap-1.5 rounded-button bg-bg-subtle px-3.5 py-1.5 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-card transition"
        >
          <Lock className="h-3.5 w-3.5 text-brand-secondary" />
          <span>Management Portal</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto space-y-8">
        {/* Banner Announcement */}
        <div className="rounded-card bg-brand-primary text-white p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-status-free shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-header text-lg font-bold text-white">
                  Shared Tablet Attendant Terminal
                </h2>
                <span className="rounded-pill bg-status-free/20 px-2.5 py-0.5 text-[10px] font-bold text-status-free border border-status-free/30">
                  Tablet Ready
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Select your profile below and enter your secret PIN to accept orders, track hearth prep, and manage tips.
              </p>
            </div>
          </div>
        </div>

        {/* Staff Profile Selection Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-header text-xl font-bold text-brand-heading">
                Select Active Staff Profile
              </h3>
              <p className="text-xs text-brand-secondary mt-0.5">
                Tap your profile photo or name to enter PIN code.
              </p>
            </div>

            <span className="rounded-pill bg-bg-card px-3 py-1 text-xs font-bold text-brand-primary border border-divider">
              {staffList.length} Personnel Records
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {staffList.map((staff) => (
              <div
                key={staff.id}
                onClick={() => handleSelectStaff(staff)}
                className="group rounded-card bg-white p-5 border border-divider hover:border-brand-accent hover:shadow-elevated transition-all duration-200 cursor-pointer space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="h-12 w-12 rounded-full bg-brand-primary text-white font-bold text-base flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {getInitials(staff.full_name)}
                  </div>

                  <span
                    className={cn(
                      "rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      getRoleBadgeStyle(staff.role)
                    )}
                  >
                    {staff.role}
                  </span>
                </div>

                <div>
                  <h4 className="font-header text-base font-bold text-brand-heading group-hover:text-brand-accent transition-colors">
                    {staff.full_name}
                  </h4>
                  <p className="text-xs text-brand-secondary mt-0.5">
                    {staff.phone_number}
                  </p>
                  <p className="text-[11px] text-brand-secondary/80 font-mono mt-1">
                    {staff.personal_id_number}
                  </p>
                </div>

                <div className="pt-3 border-t border-divider/60 flex items-center justify-between text-xs text-brand-primary font-semibold group-hover:text-brand-accent">
                  <span>Unlock Terminal</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* PIN Unlock Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-card max-w-sm w-full p-6 space-y-6 border border-divider shadow-elevated relative">
            <button
              onClick={() => setSelectedStaff(null)}
              className="absolute top-4 right-4 text-brand-secondary hover:text-brand-primary p-1 rounded-button hover:bg-bg-subtle transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Selected Profile Header */}
            <div className="text-center space-y-2">
              <div className="h-16 w-16 rounded-full bg-brand-primary text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md">
                {getInitials(selectedStaff.full_name)}
              </div>
              <div>
                <h3 className="font-header text-lg font-bold text-brand-heading">
                  {selectedStaff.full_name}
                </h3>
                <span
                  className={cn(
                    "rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider inline-block mt-1",
                    getRoleBadgeStyle(selectedStaff.role)
                  )}
                >
                  {selectedStaff.role}
                </span>
              </div>
              <p className="text-xs text-brand-secondary">
                Enter your 6-digit PIN code to unlock console
              </p>
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="rounded-button bg-status-danger-bg p-3 border border-status-danger/30 text-xs font-semibold text-status-danger flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successInfo && (
              <div className="rounded-button bg-status-free-bg p-3 border border-status-free/30 text-xs font-semibold text-status-free flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successInfo}</span>
              </div>
            )}

            {/* Form & Keypad Input */}
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN (e.g. 123456)"
                  maxLength={10}
                  className="w-full text-center tracking-widest text-lg font-bold py-2.5 rounded-button bg-bg-subtle border border-divider text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  autoFocus
                />
              </div>

              {/* Numeric Keypad for Touch Screen Tablets */}
              <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="py-3 rounded-button bg-bg-subtle hover:bg-bg-card font-header font-bold text-lg text-brand-heading border border-divider hover:border-brand-accent active:bg-brand-accent active:text-white transition cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinInput("")}
                  className="py-3 rounded-button bg-bg-subtle hover:bg-bg-card font-bold text-xs text-brand-secondary border border-divider transition cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress("0")}
                  className="py-3 rounded-button bg-bg-subtle hover:bg-bg-card font-header font-bold text-lg text-brand-heading border border-divider hover:border-brand-accent active:bg-brand-accent active:text-white transition cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="py-3 rounded-button bg-bg-subtle hover:bg-bg-card text-brand-secondary border border-divider flex items-center justify-center transition cursor-pointer"
                >
                  <Delete className="h-5 w-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={isPending || !pinInput.trim()}
                className="w-full py-3 rounded-button bg-brand-primary hover:bg-brand-heading text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <span>Verifying PIN...</span>
                ) : (
                  <>
                    <span>Unlock &amp; Proceed</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
