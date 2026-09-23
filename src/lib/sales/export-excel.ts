import * as XLSX from "xlsx";
import type { SalesAnalyticsResult, SalesOrderRow, SalesItemRow } from "@/app/admin/finance/actions";

function money(n: number) {
  return Math.round(n * 100) / 100;
}

function orderSheetRows(orders: SalesOrderRow[]) {
  return orders.map((o) => ({
    "Order #": o.orderNumber,
    "Order ID": o.id,
    "Date / Time": o.createdAt,
    Channel: o.channel,
    Status: o.status,
    Table: o.tableLabel,
    Staff: o.waiterName,
    "Items Qty": o.itemCount,
    "Items Detail": o.itemSummary,
    "Revenue (ETB)": money(o.revenue),
    "Revenue Share %": o.revenueSharePercent,
    "COGS (ETB)": money(o.cogs),
    "Food Cost %": o.foodCostPercent,
    "Gross Profit (ETB)": money(o.grossProfit),
    "Margin %": o.marginPercent,
    "Tip (ETB)": money(o.tipAmount),
    "Tip % of bill": o.tipPercent,
    "Amount Paid (ETB)": money(o.amountPaid),
    "Expected Cash (bill+tip)": money(o.expectedCash),
    "Payment Method": o.paymentMethod || "",
    "Payment Status": o.paymentStatus || "",
  }));
}

function itemSheetRows(items: SalesItemRow[]) {
  return items.map((i) => ({
    Item: i.name,
    Category: i.category,
    "Qty Sold": i.quantitySold,
    "Orders Containing": i.orderCount,
    "Avg Unit Price (ETB)": money(i.avgUnitPrice),
    "Revenue (ETB)": money(i.revenue),
    "Revenue Share %": i.revenueSharePercent,
    "Sales Growth % vs prior": i.salesGrowthPercent ?? "",
    "Allocated COGS (ETB)": money(i.allocatedCogs),
    "Gross Profit (ETB)": money(i.grossProfit),
    "Margin %": i.marginPercent,
  }));
}

function summarySheet(data: SalesAnalyticsResult) {
  const { kpis, range } = data;
  return [
    { Metric: "Period", Value: range.label },
    { Metric: "From", Value: range.displayFrom },
    { Metric: "To", Value: range.displayTo },
    { Metric: "Orders (excl. cancelled)", Value: kpis.orderCount },
    { Metric: "Paid orders", Value: kpis.paidOrderCount },
    { Metric: "Menu units sold", Value: kpis.itemUnitsSold },
    { Metric: "Unique menu items", Value: kpis.uniqueMenuItems },
    { Metric: "Gross revenue (ETB)", Value: money(kpis.grossRevenue) },
    { Metric: "Paid revenue (ETB)", Value: money(kpis.paidRevenue) },
    { Metric: "Tips total (ETB)", Value: money(kpis.tipsTotal) },
    { Metric: "Expected cash vs book (gross − paid)", Value: money(kpis.grossRevenue - kpis.paidRevenue) },
    { Metric: "Recipe COGS (ETB)", Value: money(kpis.realizedCogs) },
    { Metric: "Gross profit (ETB)", Value: money(kpis.grossProfit) },
    { Metric: "Food cost %", Value: kpis.foodCostPercent },
    { Metric: "Gross margin %", Value: kpis.grossMarginPercent },
    { Metric: "Avg ticket (ETB)", Value: money(kpis.avgTicket) },
    { Metric: "Dine-in revenue (ETB)", Value: money(kpis.channelBreakdown.dineIn) },
    { Metric: "Takeout revenue (ETB)", Value: money(kpis.channelBreakdown.takeout) },
    { Metric: "Delivery revenue (ETB)", Value: money(kpis.channelBreakdown.delivery) },
  ];
}

function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function stamp(rangeLabel: string) {
  const d = new Date().toISOString().slice(0, 10);
  return `sales_${rangeLabel.toLowerCase().replace(/\s+/g, "_")}_${d}`;
}

/** Export by-order workbook (summary + orders + line detail). */
export function exportSalesByOrder(data: SalesAnalyticsResult) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summarySheet(data)), "Summary");
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(orderSheetRows(data.byOrder)),
    "By Order"
  );

  const lineRows = data.byOrder.flatMap((o) =>
    o.items.map((line) => ({
      "Order #": o.orderNumber,
      "Order ID": o.id,
      "Date / Time": o.createdAt,
      Status: o.status,
      Item: line.name,
      Qty: line.quantity,
      "Unit Price (ETB)": money(line.unitPrice),
      "Line Revenue (ETB)": money(line.subtotal),
      "Allocated COGS (ETB)": money(line.allocatedCogs),
      "Line Gross Profit (ETB)": money(line.subtotal - line.allocatedCogs),
    }))
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(lineRows.length ? lineRows : [{ Note: "No line items" }]),
    "Order Lines"
  );

  downloadWorkbook(wb, `${stamp(data.range.label)}_by_order.xlsx`);
}

/** Export by-menu-item aggregation workbook. */
export function exportSalesByItem(data: SalesAnalyticsResult) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summarySheet(data)), "Summary");
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(itemSheetRows(data.byItem)),
    "By Menu Item"
  );
  downloadWorkbook(wb, `${stamp(data.range.label)}_by_item.xlsx`);
}

/** Full pack: summary + by order + by item in one file. */
export function exportSalesFull(data: SalesAnalyticsResult) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summarySheet(data)), "Summary");
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(orderSheetRows(data.byOrder)),
    "By Order"
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(itemSheetRows(data.byItem)),
    "By Menu Item"
  );
  downloadWorkbook(wb, `${stamp(data.range.label)}_full.xlsx`);
}
