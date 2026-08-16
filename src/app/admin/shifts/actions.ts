"use server";

import { revalidatePath } from "next/cache";
import { Shift, Staff } from "@/types/database";

export interface MockShiftItem {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  avatarUrl?: string;
  shiftDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualClockIn?: string | null;
  actualClockOut?: string | null;
  clockInCode: string;
  status: "scheduled" | "checked_in" | "late" | "completed" | "missed";
  assignedTables: string[];
  notes?: string;
}

let mockShiftsDatabase: MockShiftItem[] = [
  {
    id: "shf-01",
    staffId: "b0000000-0000-0000-0000-000000000003",
    staffName: "Sara Mengistu",
    staffRole: "waiter",
    shiftDate: "2026-08-15",
    scheduledStart: "11:00 AM",
    scheduledEnd: "07:00 PM",
    actualClockIn: "10:52 AM",
    clockInCode: "749201",
    status: "checked_in",
    assignedTables: ["T-01", "T-02", "T-10", "T-15", "T-16", "T-24", "T-25"],
    notes: "Terrace Garden Lead Attendant",
  },
  {
    id: "shf-02",
    staffId: "b0000000-0000-0000-0000-000000000004",
    staffName: "Michael Tadesse",
    staffRole: "waiter",
    shiftDate: "2026-08-15",
    scheduledStart: "11:30 AM",
    scheduledEnd: "08:30 PM",
    actualClockIn: "11:28 AM",
    clockInCode: "381940",
    status: "checked_in",
    assignedTables: ["T-03", "T-04", "T-05", "T-09", "T-11", "T-12", "T-13", "T-14", "T-21", "T-22", "T-23"],
    notes: "Main Dining Hall Section Lead",
  },
  {
    id: "shf-03",
    staffId: "b0000000-0000-0000-0000-000000000005",
    staffName: "Eden Haile",
    staffRole: "waiter",
    shiftDate: "2026-08-15",
    scheduledStart: "02:00 PM",
    scheduledEnd: "11:00 PM",
    actualClockIn: "01:55 PM",
    clockInCode: "592013",
    status: "checked_in",
    assignedTables: ["T-06", "T-07", "T-17", "T-18", "T-19"],
    notes: "Lounge & Bar Evening Shift",
  },
  {
    id: "shf-04",
    staffId: "b0000000-0000-0000-0000-000000000006",
    staffName: "Dawit Bekele",
    staffRole: "host",
    shiftDate: "2026-08-15",
    scheduledStart: "11:30 AM",
    scheduledEnd: "09:00 PM",
    actualClockIn: "11:35 AM",
    clockInCode: "492817",
    status: "checked_in",
    assignedTables: ["T-08", "T-20"],
    notes: "VIP Alcove & Floor Host",
  },
  {
    id: "shf-05",
    staffId: "b0000000-0000-0000-0000-000000000007",
    staffName: "Kassahun Lemma",
    staffRole: "cook",
    shiftDate: "2026-08-15",
    scheduledStart: "10:00 AM",
    scheduledEnd: "06:30 PM",
    actualClockIn: "09:50 AM",
    clockInCode: "918234",
    status: "checked_in",
    assignedTables: [],
    notes: "Head Grill & Tibs Chef",
  },
  {
    id: "shf-06",
    staffId: "b0000000-0000-0000-0000-000000000008",
    staffName: "Marta Tesfaye",
    staffRole: "cook",
    shiftDate: "2026-08-15",
    scheduledStart: "01:00 PM",
    scheduledEnd: "10:00 PM",
    actualClockIn: "01:15 PM",
    clockInCode: "610293",
    status: "late",
    assignedTables: [],
    notes: "Sauce, Stews & Injera Prep",
  },
  {
    id: "shf-07",
    staffId: "b0000000-0000-0000-0000-000000000009",
    staffName: "Yared Gebre",
    staffRole: "cleaner",
    shiftDate: "2026-08-15",
    scheduledStart: "09:30 AM",
    scheduledEnd: "05:30 PM",
    actualClockIn: "09:25 AM",
    actualClockOut: "05:30 PM",
    clockInCode: "827102",
    status: "completed",
    assignedTables: [],
    notes: "Daytime Floor & Restroom Sanitization",
  },
  {
    id: "shf-08",
    staffId: "b0000000-0000-0000-0000-000000000010",
    staffName: "Senait Alemu",
    staffRole: "waiter",
    shiftDate: "2026-08-15",
    scheduledStart: "05:00 PM",
    scheduledEnd: "12:00 AM",
    clockInCode: "103948",
    status: "scheduled",
    assignedTables: ["T-01", "T-02", "T-03", "T-04"],
    notes: "Night Dinner Peak Relief",
  },
];

export async function getShiftsData() {
  return { shifts: mockShiftsDatabase };
}

export async function createShiftAction(data: {
  staffId: string;
  staffName: string;
  staffRole: string;
  shiftDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  assignedTables: string[];
  notes?: string;
}) {
  // Generate random 6-digit clock in code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const newShift: MockShiftItem = {
    id: `shf-${Date.now()}`,
    staffId: data.staffId,
    staffName: data.staffName,
    staffRole: data.staffRole,
    shiftDate: data.shiftDate,
    scheduledStart: data.scheduledStart,
    scheduledEnd: data.scheduledEnd,
    clockInCode: code,
    status: "scheduled",
    assignedTables: data.assignedTables,
    notes: data.notes,
  };

  mockShiftsDatabase.unshift(newShift);
  revalidatePath("/admin/shifts");
  return { success: true, shift: newShift };
}

export async function updateShiftStatusAction(
  shiftId: string,
  status: "scheduled" | "checked_in" | "late" | "completed" | "missed"
) {
  mockShiftsDatabase = mockShiftsDatabase.map((shf) => {
    if (shf.id === shiftId) {
      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return {
        ...shf,
        status,
        actualClockIn: status === "checked_in" || status === "late" ? nowTime : shf.actualClockIn,
        actualClockOut: status === "completed" ? nowTime : shf.actualClockOut,
      };
    }
    return shf;
  });

  revalidatePath("/admin/shifts");
  return { success: true, shifts: mockShiftsDatabase };
}

export async function regenerateShiftCodeAction(shiftId: string) {
  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  mockShiftsDatabase = mockShiftsDatabase.map((shf) => {
    if (shf.id === shiftId) {
      return { ...shf, clockInCode: newCode };
    }
    return shf;
  });

  revalidatePath("/admin/shifts");
  return { success: true, newCode };
}
