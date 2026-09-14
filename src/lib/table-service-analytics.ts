import type { SupabaseClient } from "@supabase/supabase-js";

export interface TableServiceHistory {
  currentServer: string;
  todayVisits: number;
  weekVisits: number;
  monthTips: number;
  todayTips: number;
  recentShifts: { id: string; staffName: string; whenLabel: string }[];
}

export async function logTableServiceEvent(
  supabase: SupabaseClient,
  row: {
    tableId: string;
    staffId?: string | null;
    orderId?: string | null;
    eventType: "order_placed" | "payment_pending" | "table_cleared";
    notes?: string | null;
  }
) {
  try {
    await supabase.from("table_service_log").insert([
      {
        table_id: row.tableId,
        staff_id: row.staffId || null,
        order_id: row.orderId || null,
        event_type: row.eventType,
        notes: row.notes || null,
      },
    ]);
  } catch (err) {
    console.warn("table_service_log insert skipped:", err);
  }
}

export async function loadTableServiceHistory(
  supabase: SupabaseClient,
  tableCode: string
): Promise<TableServiceHistory | null> {
  const cleanCode = tableCode.trim().toUpperCase();
  const { data: table } = await supabase
    .from("tables")
    .select("id, assigned_staff_id, staff:assigned_staff_id (full_name)")
    .or(`unique_code.eq.${cleanCode},unique_code.eq.${tableCode}`)
    .maybeSingle();
  if (!table?.id) return null;

  const staffObj = Array.isArray(table.staff) ? table.staff[0] : table.staff;
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const startOfMonth = new Date(startOfDay);
  startOfMonth.setDate(1);

  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, staff_id, staff:staff_id (full_name)")
    .eq("table_id", table.id)
    .gte("created_at", startOfMonth.toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  const orderIds = (orders || []).map((o) => o.id);
  let tipsToday = 0;
  let tipsMonth = 0;
  if (orderIds.length > 0) {
    const { data: payments } = await supabase
      .from("payments")
      .select("tip_amount, created_at, order_id")
      .in("order_id", orderIds);
    (payments || []).forEach((p: { tip_amount?: number; created_at: string }) => {
      const tip = Number(p.tip_amount || 0);
      tipsMonth += tip;
      if (new Date(p.created_at) >= startOfDay) tipsToday += tip;
    });
  }

  const todayVisits = (orders || []).filter((o) => new Date(o.created_at) >= startOfDay).length;
  const weekVisits = (orders || []).filter((o) => new Date(o.created_at) >= startOfWeek).length;

  const recentShifts = (orders || []).slice(0, 6).map((o: any) => {
    const st = Array.isArray(o.staff) ? o.staff[0] : o.staff;
    return {
      id: o.id,
      staffName: st?.full_name || "Floor team",
      whenLabel: new Date(o.created_at).toLocaleString("en-ET", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });

  return {
    currentServer: staffObj?.full_name || "Floor team",
    todayVisits,
    weekVisits,
    monthTips: tipsMonth,
    todayTips: tipsToday,
    recentShifts,
  };
}
