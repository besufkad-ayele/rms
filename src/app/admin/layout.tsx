"use client";

import { Suspense } from "react";
import AdminLayoutClient from "./AdminLayoutClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg-main text-sm text-brand-secondary">
          Loading admin workspace…
        </div>
      }
    >
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </Suspense>
  );
}
