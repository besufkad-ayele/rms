import { assembleReceipt, fallbackReceiptNumber, ReceiptData } from "@/lib/receipts";

export async function issueReceiptNumber(
  supabase: any,
  paymentId: string
): Promise<string> {
  let number = fallbackReceiptNumber(paymentId);
  try {
    const { data, error } = await supabase.rpc("next_receipt_number");
    if (!error && data) number = data;
  } catch {
    // Sequence not installed yet — keep fallback.
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({ receipt_number: number })
    .eq("id", paymentId);

  if (updateError) {
    console.warn("Could not persist receipt_number (run 20260913_receipts.sql):", updateError.message);
  }

  return number;
}

export async function loadReceiptForOrder(
  supabase: any,
  orderId: string
): Promise<ReceiptData | null> {
  const { data: order } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      restaurant_id,
      table_id,
      staff_id,
      table:table_id (unique_code),
      staff:staff_id (full_name),
      order_items (
        quantity,
        unit_price,
        subtotal,
        menu_item:menu_item_id (name)
      )
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return null;

  let paymentQuery = await supabase
    .from("payments")
    .select("id, method, status, receipt_number, transaction_reference, confirmed_at, created_at, confirmed_by")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentQuery.error) {
    paymentQuery = await supabase
      .from("payments")
      .select("id, method, status, transaction_reference, confirmed_at, created_at, confirmed_by")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  const payment = paymentQuery.data;

  if (!payment) return null;

  let cashierName = Array.isArray(order.staff) ? order.staff[0]?.full_name : order.staff?.full_name;
  if (payment.confirmed_by) {
    const { data: confirmer } = await supabase
      .from("staff")
      .select("full_name")
      .eq("id", payment.confirmed_by)
      .maybeSingle();
    if (confirmer?.full_name) cashierName = confirmer.full_name;
  }

  let restaurantQuery = await supabase
    .from("restaurants")
    .select("name, address, phone, tin, vat_number")
    .eq("id", order.restaurant_id)
    .maybeSingle();
  if (restaurantQuery.error) {
    restaurantQuery = await supabase
      .from("restaurants")
      .select("name, address, phone")
      .eq("id", order.restaurant_id)
      .maybeSingle();
  }
  const restaurant = restaurantQuery.data;

  const table = Array.isArray(order.table) ? order.table[0] : order.table;
  const items = (order.order_items || []).map((row: any) => {
    const menu = Array.isArray(row.menu_item) ? row.menu_item[0] : row.menu_item;
    return {
      name: menu?.name || "Menu item",
      quantity: Number(row.quantity || 1),
      unitPrice: Number(row.unit_price || 0),
      subtotal: Number(row.subtotal || 0),
    };
  });

  const receiptNumber = payment.receipt_number || (await issueReceiptNumber(supabase, payment.id));

  return assembleReceipt({
    receiptNumber,
    issuedAt: payment.confirmed_at || payment.created_at,
    status: payment.status === "confirmed" ? "confirmed" : "pending",
    restaurant,
    tableCode: table?.unique_code || "—",
    cashierName: cashierName || "Floor attendant",
    paymentMethod: payment.method,
    transactionReference: payment.transaction_reference,
    items,
    foodSubtotal: Number(order.total_amount || 0),
  });
}
