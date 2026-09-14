"use client";

import React, { use } from "react";
import { StaffOrderConsole } from "@/components/staff/StaffOrderConsole";

interface PageProps {
  params: Promise<{ tableCode: string }>;
}

export default function StaffOrderForTablePage({ params }: PageProps) {
  const { tableCode } = use(params);
  return (
    <StaffOrderConsole
      tableCode={tableCode}
      backHref="/staff/dashboard"
      backLabel="Back to floor console"
    />
  );
}
