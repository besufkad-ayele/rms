"use server";

import { revalidatePath } from "next/cache";
import { INITIAL_FLOOR_TABLES, TableFloorState } from "@/data/mockDashboard";

let mockTablesDb: TableFloorState[] = [...INITIAL_FLOOR_TABLES];

export async function getTablesData() {
  return { tables: mockTablesDb };
}

export async function updateTableDetailsAction(
  tableId: string,
  data: {
    capacity: number;
    section: TableFloorState["section"];
    assignedStaffName: string;
    status: "free" | "occupied" | "reserved";
  }
) {
  mockTablesDb = mockTablesDb.map((t) => {
    if (t.id === tableId) {
      return {
        ...t,
        capacity: data.capacity,
        section: data.section,
        assigned_staff_name: data.assignedStaffName,
        status: data.status,
      };
    }
    return t;
  });

  revalidatePath("/admin/tables");
  revalidatePath("/admin/dashboard");
  return { success: true, tables: mockTablesDb };
}

export async function createNewTableAction(data: {
  tableNumber: number;
  capacity: number;
  section: TableFloorState["section"];
  assignedStaffName: string;
}) {
  const code = `T-${data.tableNumber.toString().padStart(2, "0")}`;
  const newTbl: TableFloorState = {
    id: `tbl-${Date.now()}`,
    table_number: data.tableNumber,
    unique_code: code,
    capacity: data.capacity,
    section: data.section,
    status: "free",
    assigned_staff_name: data.assignedStaffName,
    assigned_staff_role: "waiter",
  };

  mockTablesDb.push(newTbl);
  revalidatePath("/admin/tables");
  revalidatePath("/admin/dashboard");
  return { success: true, table: newTbl };
}
