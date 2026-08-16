"use client";

import React, { useState, useEffect } from "react";
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
  HeartHandshake,
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Flame,
  UserCheck,
  Edit2,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateStaffProfileAndPinAction } from "@/app/staff-login/actions";

interface StaffStationTable {
  code: string;
  section: string;
  status: "free" | "occupied";
  capacity?: number;
  guests?: number;
  elapsedMinutes?: number;
  billTotal?: number;
  activeOrder?: string;
  foodStatus?: "placed" | "preparing" | "ready" | "served";
  paymentMethod?: "cbe_birr" | "telebirr" | "cash" | "card";
  receiptImage?: string | null;
  transactionRef?: string;
}

interface TipEntry {
  id: string;
  tableCode: string;
  amount: number;
  method: "cash" | "cbe_birr" | "telebirr";
  time: string;
  customerNote?: string;
}

export default function StaffDashboardPage() {
  const [sessionUser, setSessionUser] = useState<any>(null);

  useEffect(() => {
    try {
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("rms_session_user="));
      if (match) {
        setSessionUser(JSON.parse(decodeURIComponent(match.split("=")[1])));
      }
    } catch (e) {}
  }, []);

  const staffName = sessionUser?.fullName || "Michael Tadesse";
  const staffId = sessionUser?.id || "b0000000-0000-0000-0000-000000000005";

  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Station Tables State
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
      foodStatus: "preparing",
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
      foodStatus: "ready",
    },
    {
      code: "T-05",
      section: "Main Dining Hall",
      status: "occupied",
      capacity: 6,
      guests: 5,
      elapsedMinutes: 45,
      billTotal: 3420,
      activeOrder: "1x Royal Doro Wat, 2x Awaze Tibs, Tej Decanter",
      foodStatus: "served",
      paymentMethod: "cbe_birr",
      transactionRef: "CBE-98213-90",
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
      foodStatus: "placed",
    },
    {
      code: "T-13",
      section: "Main Dining Hall",
      status: "free",
      capacity: 6,
    },
  ]);

  // Tips Tracking State (Received from Customer QR Order Payments)
  const [tips, setTips] = useState<TipEntry[]>([
    {
      id: "tip-1",
      tableCode: "T-02",
      amount: 250,
      method: "cbe_birr",
      time: "12:15 PM",
      customerNote: "Extraordinary tibs & attentive service!",
    },
    {
      id: "tip-2",
      tableCode: "T-07",
      amount: 150,
      method: "cash",
      time: "01:30 PM",
    },
  ]);

  // Table Settlement Modal
  const [settleTable, setSettleTable] = useState<StaffStationTable | null>(null);
  const [settleMethod, setSettleMethod] = useState<"cbe_birr" | "telebirr" | "cash" | "card">("cbe_birr");
  const [settleTxRef, setSettleTxRef] = useState<string>("");
  const [receiptImageFile, setReceiptImageFile] = useState<string | null>(null);

  // Edit Profile & PIN Modal
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [currentPin, setCurrentPin] = useState<string>("");
  const [newPin, setNewPin] = useState<string>("");
  const [newPhone, setNewPhone] = useState<string>("+251933445566");
  const [emergencyPhone, setEmergencyPhone] = useState<string>("+251933998877");
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

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

  const handleReceiptImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmSettlement = () => {
    if (!settleTable) return;
    setMyTables(
      myTables.map((t) =>
        t.code === settleTable.code
          ? {
              ...t,
              status: "free",
              billTotal: undefined,
              activeOrder: undefined,
              guests: undefined,
              paymentMethod: settleMethod,
              receiptImage: receiptImageFile,
              transactionRef: settleTxRef,
            }
          : t
      )
    );
    showToast(`Table ${settleTable.code} bill settled (${settleMethod.toUpperCase()}) & cleared!`);
    setSettleTable(null);
    setReceiptImageFile(null);
    setSettleTxRef("");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    const res = await updateStaffProfileAndPinAction(
      staffId,
      currentPin,
      newPin,
      newPhone,
      emergencyPhone
    );
    if (res.success) {
      setProfileMsg({ text: res.message, type: "success" });
      setTimeout(() => {
        setShowEditProfileModal(false);
        setCurrentPin("");
        setNewPin("");
        setProfileMsg(null);
      }, 1200);
      showToast("Profile & PIN updated!");
    } else {
      setProfileMsg({ text: res.message, type: "error" });
    }
  };

  const advanceFoodStatus = (tableCode: string) => {
    setMyTables(
      myTables.map((t) => {
        if (t.code === tableCode) {
          if (t.foodStatus === "placed") return { ...t, foodStatus: "preparing" };
          if (t.foodStatus === "preparing") return { ...t, foodStatus: "ready" };
          if (t.foodStatus === "ready") return { ...t, foodStatus: "served" };
        }
        return t;
      })
    );
    showToast(`Updated food progress for Table ${tableCode}!`);
  };

  const totalTips = tips.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6 pb-16">
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
          <div className="h-12 w-12 rounded-full bg-brand-primary text-white font-bold text-base flex items-center justify-center shadow-xs">
            MT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-header text-xl font-bold text-brand-heading">
                {staffName}
              </h2>
              <span className="rounded-pill bg-bg-card px-2.5 py-0.5 text-[11px] font-bold text-brand-primary border border-divider capitalize">
                {sessionUser?.role || "Lead Waiter"}
              </span>
            </div>
            <p className="text-xs text-brand-secondary mt-0.5">
              Station: Main Dining Hall (Tables T-03 to T-14) • Today&apos;s Shift: 11:30 AM – 08:30 PM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Tip Summary Counter */}
          <div className="rounded-card bg-brand-accent/10 p-3 border border-brand-accent/30 text-right">
            <p className="text-[10px] uppercase font-bold text-brand-accent">
              Today&apos;s Total Tips
            </p>
            <p className="font-header text-lg font-bold text-brand-heading flex items-center justify-end gap-1">
              <HeartHandshake className="h-4 w-4 text-brand-accent" />
              ETB {totalTips.toLocaleString()}
            </p>
          </div>

          <div className="rounded-card bg-status-occupied-bg/40 p-3 border border-status-occupied/30 text-right">
            <p className="text-[10px] uppercase font-bold text-brand-secondary">
              Guest Rating
            </p>
            <p className="font-header text-lg font-bold text-status-occupied flex items-center justify-end gap-1">
              <Star className="h-4 w-4 fill-status-occupied" />
              4.92 / 5.0
            </p>
          </div>

          <button
            onClick={() => setShowEditProfileModal(true)}
            className="flex items-center gap-1.5 rounded-button bg-bg-card px-3 py-2 text-xs font-semibold text-brand-primary border border-divider hover:bg-bg-subtle transition shadow-xs cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5 text-brand-accent" />
            <span>Edit Profile &amp; PIN</span>
          </button>
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <div className="grid grid-cols-1 gap-4">
        {/* Clock-In Banner */}
        <div className="rounded-card bg-brand-primary text-white p-4 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-status-free">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-header text-sm font-bold text-white">
                Shift Verified (Code: #381940)
              </h3>
              <p className="text-xs text-white/80">
                Clocked in at 11:28 AM • Punctuality: On-Time (+2m)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCheckedIn(!isCheckedIn);
              showToast(isCheckedIn ? "Clocked out of shift" : "Clocked in to shift");
            }}
            className="rounded-button bg-status-free px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-90 transition shrink-0"
          >
            {isCheckedIn ? "Clock Out" : "Clock In"}
          </button>
        </div>
      </div>

      {/* Section 1: My Assigned Station Floor Tables */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-header text-lg font-bold text-brand-heading">
              Station Floor Tables ({myTables.length} Tables)
            </h3>
            <p className="text-xs text-brand-secondary mt-0.5">
              Live orders, kitchen prep status, and receipt verification for your station.
            </p>
          </div>

          <span className="rounded-pill bg-bg-card px-3 py-1 text-xs font-bold text-brand-primary border border-divider">
            {myTables.filter((t) => t.status === "occupied").length} Occupied / {myTables.length} Total
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTables.map((table) => {
            const isOccupied = table.status === "occupied";
            return (
              <div
                key={table.code}
                className={cn(
                  "rounded-card p-5 border transition-all space-y-4 shadow-card flex flex-col justify-between",
                  isOccupied
                    ? "bg-white border-status-occupied/40"
                    : "bg-bg-subtle border-divider opacity-90"
                )}
              >
                <div className="space-y-3">
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
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between text-[11px] text-brand-secondary">
                        <span>Guests Seated: <strong>{table.guests} Guests</strong></span>
                        <span className="flex items-center gap-1 text-status-occupied font-semibold">
                          <Clock className="h-3 w-3" />
                          {table.elapsedMinutes}m
                        </span>
                      </div>

                      {/* Live Food Status Progress */}
                      {table.foodStatus && (
                        <div className="rounded-button bg-bg-subtle p-2.5 border border-divider space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-brand-secondary flex items-center gap-1">
                              <Flame className="h-3 w-3 text-brand-accent" />
                              Kitchen Status:
                            </span>
                            <span
                              onClick={() => advanceFoodStatus(table.code)}
                              className={cn(
                                "rounded-pill px-2 py-0.2 text-[10px] font-bold uppercase cursor-pointer hover:opacity-80 transition",
                                table.foodStatus === "placed" && "bg-status-danger-bg text-status-danger border border-status-danger/30",
                                table.foodStatus === "preparing" && "bg-status-occupied-bg text-status-occupied border border-status-occupied/30",
                                table.foodStatus === "ready" && "bg-status-kitchen-bg text-status-kitchen border border-status-kitchen/30",
                                table.foodStatus === "served" && "bg-status-free-bg text-status-free border border-status-free/30"
                              )}
                            >
                              {table.foodStatus} ➔
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-brand-primary truncate">
                            {table.activeOrder}
                          </p>
                        </div>
                      )}

                      {/* Attached Receipt Image Thumbnail if any */}
                      {table.receiptImage && (
                        <div className="rounded-button bg-status-free-bg/40 p-2 border border-status-free/30 flex items-center gap-2">
                          <img
                            src={table.receiptImage}
                            alt="Receipt proof"
                            className="h-10 w-10 object-cover rounded border border-divider shrink-0"
                          />
                          <div className="text-[11px]">
                            <p className="font-bold text-status-free flex items-center gap-1">
                              <FileCheck className="h-3.5 w-3.5" />
                              Receipt Verified
                            </p>
                            <p className="text-[10px] text-brand-secondary font-mono">
                              {table.transactionRef || "Paper Receipt"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-brand-secondary space-y-2">
                      <p>Table clean &amp; ready ({table.capacity} Seats)</p>
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

                {/* Bottom Settlement Row */}
                {isOccupied && (
                  <div className="pt-3 border-t border-divider flex items-center justify-between mt-2">
                    <div>
                      <p className="text-[10px] text-brand-secondary uppercase">Current Bill</p>
                      <p className="font-header text-base font-bold text-brand-heading">
                        ETB {(table.billTotal || 0).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => setSettleTable(table)}
                      className="rounded-button bg-status-free px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-90 transition cursor-pointer flex items-center gap-1"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Settle &amp; Clear</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Shift Customer Tips Log (Read-Only Telemetry) */}
      <div className="rounded-card bg-white p-6 border border-divider shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-header text-base font-bold text-brand-heading">
              Customer Gratuities Received ({tips.length} Orders)
            </h3>
            <p className="text-xs text-brand-secondary mt-0.5">
              Read-only shift gratuity log automatically recorded from guest QR table checkouts.
            </p>
          </div>

          <span className="rounded-pill bg-brand-accent/10 px-2.5 py-0.5 text-xs font-bold text-brand-accent border border-brand-accent/20">
            Customer Recorded
          </span>
        </div>

        <div className="space-y-2">
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="flex items-center justify-between p-3.5 rounded-card bg-bg-subtle border border-divider text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-accent/10 text-brand-accent font-bold flex items-center justify-center shrink-0">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-heading">Table {tip.tableCode}</span>
                    <span className="rounded-pill bg-bg-card px-2 py-0.2 text-[10px] font-bold text-brand-secondary uppercase border border-divider">
                      {tip.method.replace("_", " ")}
                    </span>
                  </div>
                  {tip.customerNote && (
                    <p className="text-[11px] text-brand-secondary italic mt-0.5">
                      &quot;{tip.customerNote}&quot;
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="font-header text-sm font-bold text-brand-accent">
                  + ETB {tip.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-brand-secondary">{tip.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal 2: Table Settlement & Receipt Photo Upload */}
      {settleTable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-card max-w-md w-full p-6 space-y-5 border border-divider shadow-elevated relative">
            <button
              onClick={() => setSettleTable(null)}
              className="absolute top-4 right-4 text-brand-secondary hover:text-brand-primary p-1 rounded-button hover:bg-bg-subtle transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-status-free-bg text-status-free flex items-center justify-center">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-header text-base font-bold text-brand-heading">
                  Settle Table {settleTable.code}
                </h3>
                <p className="text-xs text-brand-secondary">
                  Total Bill: ETB {(settleTable.billTotal || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-brand-secondary">
                  Settlement Payment Channel
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { key: "cbe_birr", label: "CBE Birr / Bank" },
                    { key: "telebirr", label: "Telebirr" },
                    { key: "cash", label: "Cash" },
                    { key: "card", label: "POS Card Slip" },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSettleMethod(m.key as any)}
                      className={cn(
                        "py-2 px-3 rounded-button text-xs font-bold border transition cursor-pointer text-left",
                        settleMethod === m.key
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-bg-subtle border-divider text-brand-primary"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-brand-secondary">
                  Transaction Reference Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. FT2608159012"
                  value={settleTxRef}
                  onChange={(e) => setSettleTxRef(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-button bg-bg-subtle border border-divider text-xs text-brand-primary focus:outline-none"
                />
              </div>

              {/* Attach Paid Receipt / Transaction Image Photo */}
              <div>
                <label className="text-[10px] font-bold uppercase text-brand-secondary flex items-center justify-between">
                  <span>Attach Paid Receipt / Screenshot Photo</span>
                  <span className="text-brand-accent">(Optional)</span>
                </label>

                <div className="mt-1 border-2 border-dashed border-divider hover:border-brand-accent rounded-card p-4 text-center bg-bg-subtle transition">
                  {receiptImageFile ? (
                    <div className="space-y-2">
                      <img
                        src={receiptImageFile}
                        alt="Receipt preview"
                        className="h-28 w-auto mx-auto object-cover rounded border border-divider"
                      />
                      <button
                        type="button"
                        onClick={() => setReceiptImageFile(null)}
                        className="text-[11px] font-bold text-status-danger hover:underline"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-1 block">
                      <ImageIcon className="h-6 w-6 text-brand-secondary mx-auto" />
                      <p className="text-xs font-bold text-brand-primary">
                        Tap to Capture or Upload Receipt Photo
                      </p>
                      <p className="text-[10px] text-brand-secondary">
                        PNG, JPG, camera photo up to 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmSettlement}
                className="w-full py-2.5 rounded-button bg-status-free hover:opacity-90 text-white font-bold text-xs transition cursor-pointer shadow-md"
              >
                Confirm Payment &amp; Clear Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Profile & PIN Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-card max-w-sm w-full p-6 space-y-5 border border-divider shadow-elevated relative">
            <button
              onClick={() => setShowEditProfileModal(false)}
              className="absolute top-4 right-4 text-brand-secondary hover:text-brand-primary p-1 rounded-button hover:bg-bg-subtle transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                <Edit2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-header text-base font-bold text-brand-heading">
                  Edit Profile &amp; Change PIN
                </h3>
                <p className="text-xs text-brand-secondary">
                  {staffName}
                </p>
              </div>
            </div>

            {profileMsg && (
              <div
                className={cn(
                  "p-3 rounded-button text-xs font-semibold border flex items-center gap-2",
                  profileMsg.type === "success"
                    ? "bg-status-free-bg text-status-free border-status-free/30"
                    : "bg-status-danger-bg text-status-danger border-status-danger/30"
                )}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-brand-secondary">
                  Current Secret PIN *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter current PIN (e.g. 123456)"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-button bg-bg-subtle border border-divider font-bold text-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-brand-secondary">
                  New Secret PIN Code
                </label>
                <input
                  type="password"
                  placeholder="New 4 to 6 digit PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-button bg-bg-subtle border border-divider font-bold text-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-brand-secondary">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-button bg-bg-subtle border border-divider font-bold text-brand-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-button bg-brand-primary hover:bg-brand-heading text-white font-bold text-xs transition cursor-pointer shadow-md"
              >
                Save Changes &amp; Update PIN
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
