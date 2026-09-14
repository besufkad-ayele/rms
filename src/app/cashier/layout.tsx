"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, LogOut } from "lucide-react";
import { logoutUserAction } from "@/app/rms-login/actions";

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUserAction();
    router.push("/staff-login");
  };

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <header className="h-16 border-b border-divider bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-primary text-white flex items-center justify-center shadow-xs">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-header font-bold text-sm text-brand-heading leading-tight">
              Cashier Portal
            </h1>
            <p className="text-[10px] text-brand-secondary">Payments, receipts & table orders</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="flex items-center gap-1.5 rounded-button bg-bg-card px-3.5 py-1.5 text-xs font-semibold text-brand-primary border border-divider hover:bg-status-danger-bg hover:text-status-danger hover:border-status-danger/30 transition shadow-xs cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Log Out</span>
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
