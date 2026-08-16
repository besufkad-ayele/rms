"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Volume2,
  VolumeX,
  LogOut,
  Clock,
  CheckCircle2,
  UtensilsCrossed,
  ChefHat,
  BellRing,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutUserAction } from "@/app/rms-login/actions";

export default function ChefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  const handleLogout = async () => {
    await logoutUserAction();
    router.push("/rms-login");
  };

  return (
    <div className="min-h-screen bg-[#161314] text-white flex flex-col font-sans">
      {/* High-Contrast Kitchen Header */}
      <header className="h-16 border-b border-white/10 bg-[#231F20] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-accent text-white flex items-center justify-center shadow-md">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-header font-bold text-base text-white tracking-wide">
                Admas Kitchen Display (KDS)
              </h1>
              <span className="rounded-pill bg-status-occupied px-2 py-0.2 text-[10px] font-bold text-white uppercase">
                Live Kitchen
              </span>
            </div>
            <p className="text-[11px] text-[#92898A]">
              Head Chef: Kassahun Lemma • Active Station: All Stations
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={cn(
              "flex items-center gap-1.5 rounded-button px-3 py-1.5 text-xs font-semibold border transition cursor-pointer",
              audioEnabled
                ? "bg-status-free/20 border-status-free/40 text-status-free"
                : "bg-white/10 border-white/10 text-white/60"
            )}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">Order Chime: {audioEnabled ? "ON" : "OFF"}</span>
          </button>
          <div className="h-6 w-px bg-white/10 hidden sm:block" />
          <button
            onClick={handleLogout}
            title="Sign Out to Login Portal"
            className="flex items-center gap-1.5 rounded-button bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 border border-white/15 hover:bg-status-danger hover:border-status-danger hover:text-white transition shadow-xs cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main KDS Area */}
      <main className="flex-1 p-4 sm:p-6 w-full max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
