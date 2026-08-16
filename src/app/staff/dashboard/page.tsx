"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  KeyRound,
  CheckCircle2,
  Clock,
  Star,
  Users,
  Award,
  DollarSign,
  CreditCard,
  ChefHat,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffStationTable {
  code: string;
  section: string;
  status: "free" | "occupied";
  capacity?: number;
  guests?: number;
  elapsedMinutes?: number;
  billTotal?: number;
  activeOrder?: string;
}

export default function StaffDashboardPage() {
  const [clockInCode, setClockInCode] = useState<string>("381940");
  const [staffPin, setStaffPin] = useState<string>("1234");
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mock Assigned Tables for Lead Waiter Michael Tadesse
  const [myTables, setMyTables] = useState<StaffStationTable[]>([
    {
      code: "T-03",
      section: "Main Dining Hall",
      status: "occupied",
      capacity: 4,
      guests: 4,
      elapsedMinutes: 19,
      billTotal: 2180,
      activeOrder: "2x Lamb Derek Tibs, 1x Yetsom Beyaynetu, 2x Coffee",
    },
    {
      code: "T-04",
      section: "Main Dining Hall",
      status: "occupied",
      capacity: 4,
      guests: 2,
      elapsedMinutes: 14,
      billTotal: 1160,
      activeOrder: "1x Sizzling Tibs, 1x Kitfo Royale",
    },
    {
      code: "T-05",
      section: "Main Dining Hall",
      status: "occupied",
      capacity: 6,
      guests: 5,
      elapsedMinutes: 45,
      billTotal: 3420,
      activeOrder: "Settlement Requested (CBE Transfer)",
    },
    {
      code: "T-09",
      section: "Main Dining Hall",
      status: "free",
      capacity: 4,
    },
    {
      code: "T-11",
      section: "Main Dining Hall",
      status: "occupied",
      capacity: 4,
      guests: 4,
      elapsedMinutes: 32,
      billTotal: 1890,
      activeOrder: "2x Awaze Tibs, 2x Baklava",
    },
    {
      code: "T-13",
      section: "Main Dining Hall",
      status: "free",
      capacity: 6,
    },
  ]);

  // Training checklist
  const [checklist, setChecklist] = useState([
    { id: 1, title: "Table Etiquette & Greeting Standards", completed: true },
    { id: 2, title: "Digital Menu & Allergen Knowledge", completed: true },
    { id: 3, title: "QR Table System & CBE/Telebirr Verification", completed: true },
    { id: 4, title: "Complaint Handling & Escalation Protocol", completed: false },
  ]);

  const handleToggleChecklist = (id: number) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    showToast("Training progress updated!");
  };

  const handleFreeTable = (tableCode: string) => {
    setMyTables(
      myTables.map((t) =>
        t.code === tableCode
          ? { ...t, status: "free", billTotal: undefined, activeOrder: undefined, guests: undefined }
          : t
      )
    );
    showToast(`Table ${tableCode} marked as clean and ready for guests!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-card bg-brand-primary px-4 py-3 text-white shadow-elevated transition-all animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-status-free shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Attendant Profile & Shift Status Header */}
      <div className="rounded-card bg-white p-6 border border-divider shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-pill bg-brand-accent text-white font-bold text-base flex items-center justify-center shadow-xs">
            MT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-header text-xl font-bold text-brand-heading">
                Michael Tadesse
              </h2>
              <span className="rounded-pill bg-bg-card px-2.5 py-0.5 text-[11px] font-bold text-brand-primary border border-divider">
                Lead Waiter
              </span>
            </div>
            <p className="text-xs text-brand-secondary mt-0.5">
              Station: Main Dining Hall (Tables T-03 to T-14) • Today&apos;s Shift: 11:30 AM – 08:30 PM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-card bg-status-occupied-bg/40 p-3 border border-status-occupied/30 text-right">
            <p className="text-[10px] uppercase font-bold text-brand-secondary">
              Rolling Guest Rating
            </p>
            <p className="font-header text-lg font-bold text-status-occupied flex items-center justify-end gap-1">
              <Star className="h-4 w-4 fill-status-occupied" />
              4.92 / 5.0
            </p>
          </div>
        </div>
      </div>

      {/* 2-Factor Clock-In Terminal Status */}
      <div className="rounded-card bg-brand-primary text-white p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-status-free">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-header text-sm font-bold text-white">
              Shift Check-In Verified (Code: #381940)
            </h3>
            <p className="text-xs text-white/80">
              Clocked in at 11:28 AM • Punctuality: On-Time (+2m before shift start)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-button bg-white/10 px-3 py-1 text-xs font-mono text-white">
            PIN: ••••
          </span>
          <button
            onClick={() => {
              setIsCheckedIn(!isCheckedIn);
              showToast(isCheckedIn ? "Clocked out of shift" : "Clocked in to shift");
            }}
            className="rounded-button bg-status-free px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-90 transition"
          >
            {isCheckedIn ? "Clock Out End of Shift" : "Re-Clock In"}
          </button>
        </div>
      </div>

      {/* Section 1: My Assigned Floor Tables */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-header text-lg font-bold text-brand-heading">
              My Assigned Station Tables (6 Tables)
            </h3>
            <p className="text-xs text-brand-secondary mt-0.5">
              Live orders, table status, and billing requests for your active station.
            </p>
          </div>

          <span className="rounded-pill bg-bg-card px-3 py-1 text-xs font-bold text-brand-primary border border-divider">
            {myTables.filter((t) => t.status === "occupied").length} Occupied / {myTables.length} Total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTables.map((table) => {
            const isOccupied = table.status === "occupied";
            return (
              <div
                key={table.code}
                className={cn(
                  "rounded-card p-5 border transition-all space-y-4 shadow-card",
                  isOccupied
                    ? "bg-white border-status-occupied/40"
                    : "bg-bg-subtle border-divider opacity-90"
                )}
              >
                {/* Top Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-header text-lg font-bold text-brand-heading">
                      Table {table.code}
                    </h4>
                    <p className="text-[10px] text-brand-secondary">{table.section}</p>
                  </div>

                  <span
                    className={cn(
                      "rounded-pill px-2.5 py-0.5 text-[10px] font-bold uppercase",
                      isOccupied ? "bg-status-occupied text-white" : "bg-status-free text-white"
                    )}
                  >
                    {table.status}
                  </span>
                </div>

                {/* Details */}
                {isOccupied ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-[11px] text-brand-secondary">
                      <span>Guests Seated: <strong>{table.guests} Guests</strong></span>
                      <span className="flex items-center gap-1 text-status-occupied font-semibold">
                        <Clock className="h-3 w-3" />
                        {table.elapsedMinutes}m
                      </span>
                    </div>

                    <div className="rounded-button bg-bg-subtle p-2.5 border border-divider/60 space-y-1">
                      <p className="text-[10px] font-bold uppercase text-brand-secondary">
                        Active Order Summary:
                      </p>
                      <p className="text-xs font-semibold text-brand-primary">
                        {table.activeOrder}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-divider flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-brand-secondary uppercase">Current Bill</p>
                        <p className="font-header text-base font-bold text-brand-heading">
                          ETB {(table.billTotal || 0).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handleFreeTable(table.code)}
                        className="rounded-button bg-status-free px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition"
                      >
                        Settle &amp; Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-brand-secondary space-y-2">
                    <p>Table is clean and ready for seating ({table.capacity} Seats)</p>
                    <Link
                      href={`/order/${table.code}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-brand-accent font-bold text-xs hover:underline"
                    >
                      <span>Open Customer QR Menu</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Personal Training Checklist */}
      <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-header text-base font-bold text-brand-heading">
              My Role Training Checklist
            </h3>
            <p className="text-xs text-brand-secondary mt-0.5">
              Verified by Supervisor: Tigist Haile (Operations Manager)
            </p>
          </div>
          <span className="rounded-pill bg-brand-accent/10 px-2.5 py-0.5 text-xs font-bold text-brand-accent">
            3 / 4 Completed
          </span>
        </div>

        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleChecklist(item.id)}
              className={cn(
                "flex items-center justify-between p-3 rounded-card border cursor-pointer transition",
                item.completed
                  ? "bg-status-free-bg/30 border-status-free/30 text-brand-primary"
                  : "bg-bg-subtle border-divider text-brand-secondary hover:border-brand-accent"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center border",
                    item.completed
                      ? "bg-status-free border-status-free text-white"
                      : "border-brand-secondary bg-white"
                  )}
                >
                  {item.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                </div>
                <span className="text-xs font-semibold">{item.title}</span>
              </div>

              <span className="text-[10px] font-bold uppercase text-brand-secondary">
                {item.completed ? "Signed Off" : "In Progress"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
