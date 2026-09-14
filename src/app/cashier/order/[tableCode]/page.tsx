"use client";

import React, { use } from "react";
import { StaffOrderConsole } from "@/components/staff/StaffOrderConsole";

interface PageProps {
  params: Promise<{ tableCode: string }>;
}

export default function CashierOrderForTablePage({ params }: PageProps) {
  const { tableCode } = use(params);
  return (
    <StaffOrderConsole
      tableCode={tableCode}
      backHref="/cashier"
      backLabel="Back to cashier"
    />
  );
}
