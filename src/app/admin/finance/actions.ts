"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { requirePermission, requireAdminPortal, UNAUTHORIZED } from "@/lib/auth/guards";
import {
  resolvePeriodRange,
  type SalesPeriod,
  type PeriodRange,
} from "@/lib/sales/periods";

export type { SalesPeriod, PeriodRange };

const DEFAULT_RESTAURANT_ID = "00000000-0000-0000-0000-000000000001";

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createServerClient();
  }
}

export interface MockExpenseItem {
  id: string;
  category: "rent" | "salaries" | "utilities" | "supplies" | "maintenance" | "misc";
  title: string;
  amount: number;
  expenseDate: string;
  loggedBy: string;
}

export interface MenuEngineeringItem {
  id: string;
  dishName: string;
  category: string;
  salesCount: number;
  totalRevenue: number;
  grossMarginPercent: number;
  classification: "Star" | "Plowhorse" | "Puzzle" | "Dog";
  recommendation: string;
}

export type SalesOrderLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  allocatedCogs: number;
};

export type SalesOrderRow = {
  id: string;
  orderNumber: string;
  createdAt: string;
  createdAtIso: string;
  channel: string;
  status: string;
  tableLabel: string;
  waiterName: string;
  itemCount: number;
  itemSummary: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marginPercent: number;
  foodCostPercent: number;
  revenueSharePercent: number;
  tipAmount: number;
  tipPercent: number;
  amountPaid: number;
  paymentMethod: string | null;
  paymentStatus: string | null;
  expectedCash: number;
  items: SalesOrderLine[];
};

export type SalesItemRow = {
  menuItemId: string;
  name: string;
  category: string;
  quantitySold: number;
  orderCount: number;
  revenue: number;
  allocatedCogs: number;
  grossProfit: number;
  marginPercent: number;
  avgUnitPrice: number;
  revenueSharePercent: number;
  salesGrowthPercent: number | null;
};

export type SalesKpis = {
  orderCount: number;
  paidOrderCount: number;
  itemUnitsSold: number;
  uniqueMenuItems: number;
  grossRevenue: number;
  paidRevenue: number;
  tipsTotal: number;
  realizedCogs: number;
  grossProfit: number;
  foodCostPercent: number;
  grossMarginPercent: number;
  avgTicket: number;
  channelBreakdown: { dineIn: number; takeout: number; delivery: number };
};

export type SalesAnalyticsResult = {
  range: PeriodRange;
  kpis: SalesKpis;
  byOrder: SalesOrderRow[];
  byItem: SalesItemRow[];
};

const EMPTY_KPIS: SalesKpis = {
  orderCount: 0,
  paidOrderCount: 0,
  itemUnitsSold: 0,
  uniqueMenuItems: 0,
  grossRevenue: 0,
  paidRevenue: 0,
  tipsTotal: 0,
  realizedCogs: 0,
  grossProfit: 0,
  foodCostPercent: 0,
  grossMarginPercent: 0,
  avgTicket: 0,
  channelBreakdown: { dineIn: 0, takeout: 0, delivery: 0 },
};

function formatAddis(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Africa/Addis_Ababa",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortOrderNumber(id: string): string {
  return `#KD-${String(id).slice(0, 4).toUpperCase()}`;
}

/**
 * Period sales analytics: KPIs + by-order and by-item detail.
 * Excludes cancelled orders from totals; disputed counted but flagged via status.
 */
export async function getSalesAnalytics(
  period: SalesPeriod = "daily",
  anchorDate?: string
): Promise<SalesAnalyticsResult> {
  const range = resolvePeriodRange(period, anchorDate);
  const empty: SalesAnalyticsResult = {
    range,
    kpis: { ...EMPTY_KPIS },
    byOrder: [],
    byItem: [],
  };

  const session = await requirePermission("can_view_finance");
  if (!session) {
    const admin = await requireAdminPortal();
    if (!admin) return empty;
  }

  try {
    const supabase = await getSupabase();

    let query = supabase
      .from("orders")
      .select(
        `
        id,
        channel,
        status,
        total_amount,
        calculated_cogs,
        created_at,
        table:table_id (table_number, unique_code),
        staff:staff_id (full_name),
        order_items (
          quantity,
          unit_price,
          subtotal,
          is_cancelled,
          menu_item:menu_item_id (id, name, category)
        ),
        payments (
          amount,
          tip_amount,
          method,
          status,
          confirmed_at
        )
      `
      )
      .neq("status", "cancelled")
      .order("created_at", { ascending: false });

    if (range.from) {
      query = query.gte("created_at", range.from).lte("created_at", range.to);
    }

    const { data: dbOrders, error } = await query;
    if (error || !dbOrders) {
      if (error) console.error("getSalesAnalytics:", error.message);
      return empty;
    }

    // Prior equal-length window for item growth % (skip for all_time)
    const priorQty = new Map<string, number>();
    if (range.from) {
      const fromMs = new Date(range.from).getTime();
      const toMs = new Date(range.to).getTime();
      const span = Math.max(toMs - fromMs, 24 * 60 * 60 * 1000);
      const priorFrom = new Date(fromMs - span).toISOString();
      const priorTo = range.from;
      const { data: priorOrders } = await supabase
        .from("orders")
        .select(
          `
          order_items (
            quantity,
            is_cancelled,
            menu_item:menu_item_id (id)
          )
        `
        )
        .neq("status", "cancelled")
        .gte("created_at", priorFrom)
        .lt("created_at", priorTo);
      for (const po of (priorOrders || []) as any[]) {
        for (const it of po.order_items || []) {
          if (it.is_cancelled) continue;
          const id = it.menu_item?.id;
          if (!id) continue;
          priorQty.set(id, (priorQty.get(id) || 0) + Number(it.quantity || 0));
        }
      }
    }

    const byOrder: SalesOrderRow[] = [];
    const itemMap = new Map<
      string,
      {
        menuItemId: string;
        name: string;
        category: string;
        quantitySold: number;
        orderIds: Set<string>;
        revenue: number;
        allocatedCogs: number;
      }
    >();

    let grossRevenue = 0;
    let paidRevenue = 0;
    let tipsTotal = 0;
    let realizedCogs = 0;
    let paidOrderCount = 0;
    let itemUnitsSold = 0;
    let dineIn = 0;
    let takeout = 0;
    let delivery = 0;

    // First pass totals for share %
    const orderDrafts: Array<{
      o: any;
      revenue: number;
      cogs: number;
      tipAmount: number;
      amountPaid: number;
      paymentMethod: string | null;
      paymentStatus: string | null;
      lines: SalesOrderLine[];
    }> = [];

    for (const o of dbOrders as any[]) {
      const revenue = Number(o.total_amount || 0);
      const cogs = Number(o.calculated_cogs || 0);
      const payments = Array.isArray(o.payments) ? o.payments : [];
      const confirmed =
        payments.find((p: any) => p.status === "confirmed") ||
        payments.find((p: any) => p.status === "pending") ||
        payments[0] ||
        null;
      const tipAmount = Number(confirmed?.tip_amount || 0);
      const amountPaid = confirmed ? Number(confirmed.amount || 0) : 0;
      const paymentMethod = confirmed?.method ? String(confirmed.method) : null;
      const paymentStatus = confirmed?.status ? String(confirmed.status) : null;

      const rawItems = Array.isArray(o.order_items) ? o.order_items : [];
      const activeItems = rawItems.filter((it: any) => !it.is_cancelled);
      const itemsRevenue = activeItems.reduce(
        (s: number, it: any) => s + Number(it.subtotal || 0),
        0
      );

      const lines: SalesOrderLine[] = activeItems.map((it: any) => {
        const sub = Number(it.subtotal || 0);
        const qty = Number(it.quantity || 0);
        const share = itemsRevenue > 0 ? sub / itemsRevenue : 0;
        const allocatedCogs = parseFloat((cogs * share).toFixed(2));
        const name = it.menu_item?.name || "Menu item";
        const menuItemId = it.menu_item?.id || `unknown-${name}`;
        const category = it.menu_item?.category || "Uncategorized";

        itemUnitsSold += qty;
        const existing = itemMap.get(menuItemId);
        if (existing) {
          existing.quantitySold += qty;
          existing.orderIds.add(o.id);
          existing.revenue += sub;
          existing.allocatedCogs += allocatedCogs;
        } else {
          itemMap.set(menuItemId, {
            menuItemId,
            name,
            category,
            quantitySold: qty,
            orderIds: new Set([o.id]),
            revenue: sub,
            allocatedCogs,
          });
        }

        return {
          name,
          quantity: qty,
          unitPrice: Number(it.unit_price || 0),
          subtotal: sub,
          allocatedCogs,
        };
      });

      tipsTotal += tipAmount;
      grossRevenue += revenue;
      realizedCogs += cogs;
      const status = String(o.status || "");
      if (status === "paid" || paymentStatus === "confirmed") {
        paidRevenue += revenue;
        paidOrderCount += 1;
      }
      const channel = String(o.channel || "dine_in");
      if (channel === "takeout") takeout += revenue;
      else if (channel === "delivery") delivery += revenue;
      else dineIn += revenue;

      orderDrafts.push({
        o,
        revenue,
        cogs,
        tipAmount,
        amountPaid,
        paymentMethod,
        paymentStatus,
        lines,
      });
    }

    for (const draft of orderDrafts) {
      const { o, revenue, cogs, tipAmount, amountPaid, paymentMethod, paymentStatus, lines } =
        draft;
      const status = String(o.status || "");
      const channel = String(o.channel || "dine_in");
      const grossProfit = revenue - cogs;
      const marginPercent =
        revenue > 0 ? parseFloat(((grossProfit / revenue) * 100).toFixed(1)) : 0;
      const foodCostPercent =
        revenue > 0 ? parseFloat(((cogs / revenue) * 100).toFixed(1)) : 0;
      const revenueSharePercent =
        grossRevenue > 0
          ? parseFloat(((revenue / grossRevenue) * 100).toFixed(2))
          : 0;
      const tipPercent =
        revenue > 0 ? parseFloat(((tipAmount / revenue) * 100).toFixed(1)) : 0;
      const tableLabel =
        o.table?.unique_code ||
        (o.table?.table_number != null
          ? `T-${o.table.table_number}`
          : channel === "dine_in"
            ? "Floor"
            : channel);

      byOrder.push({
        id: o.id,
        orderNumber: shortOrderNumber(o.id),
        createdAt: formatAddis(o.created_at),
        createdAtIso: o.created_at,
        channel,
        status,
        tableLabel,
        waiterName: o.staff?.full_name || "—",
        itemCount: lines.reduce((s, l) => s + l.quantity, 0),
        itemSummary: lines.map((l) => `${l.quantity}× ${l.name}`).join(", ") || "—",
        revenue,
        cogs,
        grossProfit,
        marginPercent,
        foodCostPercent,
        revenueSharePercent,
        tipAmount,
        tipPercent,
        amountPaid,
        paymentMethod,
        paymentStatus,
        expectedCash: revenue + tipAmount,
        items: lines,
      });
    }

    const byItem: SalesItemRow[] = Array.from(itemMap.values())
      .map((row) => {
        const grossProfit = row.revenue - row.allocatedCogs;
        const prior = priorQty.get(row.menuItemId) || 0;
        let salesGrowthPercent: number | null = null;
        if (range.from) {
          if (prior === 0) salesGrowthPercent = row.quantitySold > 0 ? 100 : 0;
          else
            salesGrowthPercent = parseFloat(
              (((row.quantitySold - prior) / prior) * 100).toFixed(1)
            );
        }
        return {
          menuItemId: row.menuItemId,
          name: row.name,
          category: row.category,
          quantitySold: row.quantitySold,
          orderCount: row.orderIds.size,
          revenue: parseFloat(row.revenue.toFixed(2)),
          allocatedCogs: parseFloat(row.allocatedCogs.toFixed(2)),
          grossProfit: parseFloat(grossProfit.toFixed(2)),
          marginPercent:
            row.revenue > 0
              ? parseFloat(((grossProfit / row.revenue) * 100).toFixed(1))
              : 0,
          avgUnitPrice:
            row.quantitySold > 0
              ? parseFloat((row.revenue / row.quantitySold).toFixed(2))
              : 0,
          revenueSharePercent:
            grossRevenue > 0
              ? parseFloat(((row.revenue / grossRevenue) * 100).toFixed(2))
              : 0,
          salesGrowthPercent,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const orderCount = byOrder.length;
    const grossProfit = grossRevenue - realizedCogs;

    return {
      range,
      kpis: {
        orderCount,
        paidOrderCount,
        itemUnitsSold,
        uniqueMenuItems: byItem.length,
        grossRevenue,
        paidRevenue,
        tipsTotal,
        realizedCogs,
        grossProfit,
        foodCostPercent:
          grossRevenue > 0
            ? parseFloat(((realizedCogs / grossRevenue) * 100).toFixed(1))
            : 0,
        grossMarginPercent:
          grossRevenue > 0
            ? parseFloat(((grossProfit / grossRevenue) * 100).toFixed(1))
            : 0,
        avgTicket:
          orderCount > 0 ? parseFloat((grossRevenue / orderCount).toFixed(2)) : 0,
        channelBreakdown: { dineIn, takeout, delivery },
      },
      byOrder,
      byItem,
    };
  } catch (err) {
    console.error("getSalesAnalytics failed:", err);
    return empty;
  }
}

export async function getFinanceData(
  period: SalesPeriod = "all_time",
  anchorDate?: string
) {
  const session = await requirePermission("can_view_finance");
  if (!session) {
    return {
      sales: await getSalesAnalytics(period, anchorDate),
      kpis: {
        grossRevenue: 0,
        realizedCogs: 0,
        grossProfit: 0,
        totalOpex: 0,
        netProfit: 0,
        foodCostPercent: 0,
        netMarginPercent: 0,
        channelBreakdown: { dineIn: 0, takeout: 0, delivery: 0 },
      },
      expenses: [] as MockExpenseItem[],
      menuMatrix: [] as MenuEngineeringItem[],
    };
  }

  try {
    const supabase = await getSupabase();
    const sales = await getSalesAnalytics(period, anchorDate);

    const { data: dbExpenses, error: expErr } = await supabase
      .from("expenses")
      .select("*")
      .order("expense_date", { ascending: false });

    let expenses: MockExpenseItem[] = [];
    if (!expErr && dbExpenses) {
      expenses = dbExpenses.map((e: any) => ({
        id: e.id,
        category: e.category as MockExpenseItem["category"],
        title: e.title,
        amount: Number(e.amount || 0),
        expenseDate: e.expense_date,
        loggedBy: "Executive Staff",
      }));
    }

    // OPEX filtered to same period when possible (expense_date is date-only)
    const range = sales.range;
    let periodOpex = expenses;
    if (range.from) {
      const fromDate = range.from.slice(0, 10);
      const toDate = range.to.slice(0, 10);
      periodOpex = expenses.filter(
        (e) => e.expenseDate >= fromDate && e.expenseDate <= toDate
      );
    }

    const totalOpex = periodOpex.reduce((sum, e) => sum + e.amount, 0);
    const { grossRevenue, realizedCogs, grossProfit, channelBreakdown, foodCostPercent } =
      sales.kpis;
    const netProfit = grossProfit - totalOpex;

    // Real menu engineering from period item sales
    const avgQty =
      sales.byItem.length > 0
        ? sales.byItem.reduce((s, i) => s + i.quantitySold, 0) / sales.byItem.length
        : 0;
    const avgMargin =
      sales.byItem.length > 0
        ? sales.byItem.reduce((s, i) => s + i.marginPercent, 0) / sales.byItem.length
        : 0;

    const menuMatrix: MenuEngineeringItem[] = sales.byItem.map((item) => {
      const highVol = item.quantitySold >= avgQty;
      const highMargin = item.marginPercent >= avgMargin;
      let classification: MenuEngineeringItem["classification"] = "Dog";
      let recommendation = "Low volume & margin — review pricing or remove.";
      if (highVol && highMargin) {
        classification = "Star";
        recommendation = "Protect quality and keep featured — top performer.";
      } else if (highVol && !highMargin) {
        classification = "Plowhorse";
        recommendation = "High sellers with thin margin — trim recipe cost.";
      } else if (!highVol && highMargin) {
        classification = "Puzzle";
        recommendation = "High margin, low volume — promote on menu.";
      }
      return {
        id: item.menuItemId,
        dishName: item.name,
        category: item.category,
        salesCount: item.quantitySold,
        totalRevenue: item.revenue,
        grossMarginPercent: item.marginPercent,
        classification,
        recommendation,
      };
    });

    return {
      sales,
      kpis: {
        grossRevenue,
        realizedCogs,
        grossProfit,
        totalOpex,
        netProfit,
        foodCostPercent,
        netMarginPercent:
          grossRevenue > 0
            ? parseFloat(((netProfit / grossRevenue) * 100).toFixed(1))
            : 0,
        channelBreakdown,
      },
      expenses: periodOpex,
      allExpenses: expenses,
      menuMatrix,
    };
  } catch (err) {
    console.error("Error fetching finance data from Supabase:", err);
    const sales = await getSalesAnalytics(period, anchorDate);
    return {
      sales,
      kpis: {
        grossRevenue: 0,
        realizedCogs: 0,
        grossProfit: 0,
        totalOpex: 0,
        netProfit: 0,
        foodCostPercent: 0,
        netMarginPercent: 0,
        channelBreakdown: { dineIn: 0, takeout: 0, delivery: 0 },
      },
      expenses: [],
      menuMatrix: [],
    };
  }
}

export async function logExpenseAction(data: {
  category: MockExpenseItem["category"];
  title: string;
  amount: number;
  expenseDate: string;
}) {
  const session = await requirePermission("can_view_finance");
  if (!session) return UNAUTHORIZED;

  try {
    const supabase = await getSupabase();
    await supabase.from("expenses").insert([
      {
        restaurant_id: DEFAULT_RESTAURANT_ID,
        category: data.category,
        title: data.title,
        amount: data.amount,
        expense_date: data.expenseDate,
      },
    ]);
  } catch (err) {
    console.error("Failed to log expense in Supabase:", err);
  }

  revalidatePath("/admin/finance");
  revalidatePath("/admin/dashboard");
  const fin = await getFinanceData();
  return { success: true, expenses: fin.expenses };
}
