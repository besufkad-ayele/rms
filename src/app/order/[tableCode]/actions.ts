"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

const DEFAULT_RESTAURANT_ID = "00000000-0000-0000-0000-000000000001";

async function getSupabase() {
  try {
    return createAdminClient();
  } catch {
    return await createServerClient();
  }
}

export interface CustomerOrderItemInput {
  menuItemId?: string;
  title: string;
  price: number;
  quantity: number;
}

export async function submitOrderAction(
  tableCode: string,
  items: CustomerOrderItemInput[],
  customerNote?: string
) {
  if (!items || items.length === 0) {
    return { success: false, message: "Cart is empty." };
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    const supabase = await getSupabase();

    // 1. Fetch Table ID by tableCode
    const { data: tableData } = await supabase
      .from("tables")
      .select("id")
      .eq("unique_code", tableCode)
      .maybeSingle();

    const tableId = tableData?.id || null;

    // 2. Insert Order Record into Supabase
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          restaurant_id: DEFAULT_RESTAURANT_ID,
          table_id: tableId,
          status: "placed",
          order_type: "dine_in",
          payment_status: "pending",
          total_amount: totalAmount,
          special_instructions: customerNote || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (orderError || !orderData || orderData.length === 0) {
      console.error("Supabase Order Creation Error:", orderError?.message);
      return { success: false, message: "Failed to save order to database." };
    }

    const createdOrder = orderData[0];
    const orderId = createdOrder.id;

    // 3. Insert Order Items
    const itemRows = items.map((item) => ({
      order_id: orderId,
      menu_item_id: item.menuItemId || null,
      title: item.title,
      unit_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    await supabase.from("order_items").insert(itemRows);

    // 4. Update Table Status to 'occupied'
    if (tableId) {
      await supabase
        .from("tables")
        .update({ status: "occupied", current_order_id: orderId })
        .eq("id", tableId);
    }

    revalidatePath("/admin/tables");
    revalidatePath("/admin/orders");
    revalidatePath("/chef/dashboard");

    return {
      success: true,
      orderId: orderId,
      orderNumber: `#KD-${orderId.substring(0, 5).toUpperCase()}`,
    };
  } catch (err) {
    console.error("Order submission exception:", err);
    return { success: false, message: "Database connection failed during order." };
  }
}

export async function submitPaymentAction(
  orderId: string,
  tableCode: string,
  method: "cash" | "cbe_birr" | "telebirr",
  amount: number
) {
  try {
    const supabase = await getSupabase();

    // 1. Insert Payment Record
    await supabase.from("payments").insert([
      {
        restaurant_id: DEFAULT_RESTAURANT_ID,
        order_id: orderId || null,
        payment_method: method,
        amount: amount,
        status: "completed",
        created_at: new Date().toISOString(),
      },
    ]);

    // 2. Update Order Payment Status
    if (orderId) {
      await supabase
        .from("orders")
        .update({ payment_status: "paid", status: "served" })
        .eq("id", orderId);
    }

    // 3. Reset Table Status to 'free'
    if (tableCode) {
      await supabase
        .from("tables")
        .update({ status: "free", current_order_id: null })
        .eq("unique_code", tableCode);
    }

    revalidatePath("/admin/tables");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/finance");

    return { success: true };
  } catch (err) {
    console.error("Payment recording exception:", err);
    return { success: false, message: "Failed to record payment in database." };
  }
}

export async function submitFeedbackAction(
  orderId: string,
  foodRating: number,
  serviceRating: number,
  comment?: string
) {
  try {
    const supabase = await getSupabase();

    await supabase.from("feedback").insert([
      {
        restaurant_id: DEFAULT_RESTAURANT_ID,
        order_id: orderId || null,
        food_quality_rating: foodRating,
        service_quality_rating: serviceRating,
        comments: comment || null,
        created_at: new Date().toISOString(),
      },
    ]);

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (err) {
    console.error("Feedback submission exception:", err);
    return { success: false, message: "Failed to save feedback." };
  }
}

export async function getOrderStatusAction(orderId: string) {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .maybeSingle();

    if (data?.status) {
      return { status: data.status as "placed" | "preparing" | "ready" | "served" };
    }
  } catch (err) {
    console.error("Error fetching order status:", err);
  }
  return null;
}
