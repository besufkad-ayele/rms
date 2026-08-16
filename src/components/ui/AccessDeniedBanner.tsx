"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

interface AccessDeniedProps {
  requiredRole?: string;
  userRole?: string;
  redirectPath?: string;
}

export default function AccessDeniedBanner({
  requiredRole = "Super Admin",
  userRole = "Staff Personnel",
  redirectPath = "/staff/dashboard",
}: AccessDeniedProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="h-16 w-16 rounded-2xl bg-status-danger-bg text-status-danger flex items-center justify-center border border-status-danger/30 shadow-sm animate-bounce">
        <ShieldAlert className="h-8 w-8" />
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="font-header text-2xl font-bold text-brand-heading">
          Restricted Access Module
        </h2>
        <p className="text-xs text-brand-secondary leading-relaxed">
          Your current session role (<strong>{userRole.toUpperCase()}</strong>) does not have sufficient permissions to access this administrative module. Only <strong>{requiredRole}</strong> accounts can manage these records.
        </p>
      </div>

      <div className="rounded-button bg-bg-subtle p-3 border border-divider text-xs font-mono text-brand-secondary flex items-center gap-2">
        <Lock className="h-4 w-4 text-status-occupied shrink-0" />
        <span>Permission Check: Access Denied</span>
      </div>

      <Link
        href={redirectPath}
        className="inline-flex items-center gap-2 rounded-button bg-brand-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-heading transition shadow-md"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Authorized Workspace</span>
      </Link>
    </div>
  );
}
