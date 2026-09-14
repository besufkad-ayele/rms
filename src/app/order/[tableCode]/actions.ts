"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { requireFloorStaff, UNAUTHORIZED } from "@/lib/auth/guards";
import { computeBill } from "@/lib/utils";
import { formatKitchenNotes, extrasTotal } from "@/lib/kitchen-notes";
import { issueReceiptNumber, loadReceiptForOrder } from "@/lib/receipts-server";
import {
  ItemCustomization,
  MenuExtraOption,
  MenuIngredientOption,
} from "@/types/order-customization";
import { logTableServiceEvent } from "@/lib/table-service-analytics";
import { upsertCustomerByPhone } from "@/lib/customers-server";

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
  customization?: ItemCustomization;
}

async function insertOrderItemRow(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  row: {
    order_id: string;
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    kitchen_notes?: string | null;
    customization?: ItemCustomization | null;
  }
) {
  const withCustom = {
    order_id: row.order_id,
    menu_item_id: row.menu_item_id,
    quantity: row.quantity,
    unit_price: row.unit_price,
    subtotal: row.subtotal,
    kitchen_notes: row.kitchen_notes || null,
    customization: row.customization || null,
  };
  let result = await supabase.from("order_items").insert(withCustom);
  if (result.error) {
    result = await supabase.from("order_items").insert({
      order_id: row.order_id,
      menu_item_id: row.menu_item_id,
      quantity: row.quantity,
      unit_price: row.unit_price,
      subtotal: row.subtotal,
    });
  }
  return result;
}

export async function getMenuItemOptionsAction(
  menuItemId: string,
  menuItemName: string,
  fallbackIngredients: string[] = []
): Promise<{ ingredients: MenuIngredientOption[]; extras: MenuExtraOption[] }> {
  try {
    const supabase = await getSupabase();
    const { data: recipes } = await supabase
      .from("recipes")
      .select("ingredient_id, ingredient:ingredient_id (id, name)")
      .eq("menu_item_id", menuItemId);

    let ingredients: MenuIngredientOption[] = [];
    if (recipes && recipes.length > 0) {
      ingredients = recipes.map((r: any, index: number) => {
        const ing = Array.isArray(r.ingredient) ? r.ingredient[0] : r.ingredient;
        return {
          id: ing?.id || `ing-${index}`,
          name: ing?.name || "Ingredient",
          required: index === 0,
        };
      });
    } else if (fallbackIngredients.length > 0) {
      ingredients = fallbackIngredients.map((name, index) => ({
        id: `mock-${index}`,
        name,
        required: index === 0,
      }));
    } else {
      ingredients = [{ id: "base", name: menuItemName, required: true }];
    }

    const { data: extraRows } = await supabase
      .from("menu_items")
      .select("id, name, price")
      .in("category", ["side", "drink", "dessert"])
      .eq("is_available", true)
      .neq("id", menuItemId)
      .order("price", { ascending: true })
      .limit(12);

    const extras: MenuExtraOption[] = (extraRows || []).map((e: any) => ({
      id: e.id,
      name: e.name,
      price: Number(e.price || 0),
    }));

    return { ingredients, extras };
  } catch (err) {
    console.error("getMenuItemOptionsAction:", err);
    return {
      ingredients: (fallbackIngredients.length ? fallbackIngredients : [menuItemName]).map(
        (name, index) => ({ id: `mock-${index}`, name, required: index === 0 })
      ),
      extras: [],
    };
  }
}

export interface LiveTableInfo {
  id: string;
  uniqueCode: string;
  tableNumber: number;
  capacity: number;
  section: string;
  status: string;
  serverName: string;
  assignedStaffId?: string;
}

export async function getTableByCodeAction(tableCode: string): Promise<LiveTableInfo | null> {
  try {
    const supabase = await getSupabase();
    const cleanCode = tableCode.trim().toUpperCase();

    const { data, error } = await supabase
      .from("tables")
      .select(`
        id,
        table_number,
        unique_code,
        capacity,
        status,
        section_name,
        assigned_staff_id,
        staff:assigned_staff_id (id, full_name, role)
      `)
      .or(`unique_code.eq.${cleanCode},unique_code.eq.${tableCode}`)
      .maybeSingle();

    if (!error && data) {
      const staffObj = Array.isArray(data.staff) ? data.staff[0] : data.staff;
      return {
        id: data.id,
        uniqueCode: data.unique_code,
        tableNumber: data.table_number,
        capacity: data.capacity || 4,
        section: data.section_name || "Main Dining Hall",
        status: data.status || "free",
        serverName: staffObj?.full_name || "Floor Attendant",
        assignedStaffId: data.assigned_staff_id || undefined,
      };
    }
  } catch (err) {
    console.error("Error fetching table by code:", err);
  }

  return null;
}

export async function submitOrderAction(
  tableCode: string,
  items: CustomerOrderItemInput[],
  customerNote?: string
) {
  if (!items || items.length === 0) {
    return { success: false, message: "Cart is empty." };
  }

  try {
    const supabase = await getSupabase();

    const cleanCode = tableCode.trim().toUpperCase();
    const { data: tableData } = await supabase
      .from("tables")
      .select("id, assigned_staff_id, current_order_id")
      .or(`unique_code.eq.${cleanCode},unique_code.eq.${tableCode}`)
      .maybeSingle();

    if (!tableData?.id) {
      return { success: false, message: "Unknown table code." };
    }

    const { data: dbMenuItems } = await supabase
      .from("menu_items")
      .select("id, name, price, is_available");

    const byId = new Map<string, { id: string; name: string; price: number; is_available: boolean }>();
    const byName = new Map<string, { id: string; name: string; price: number; is_available: boolean }>();
    (dbMenuItems || []).forEach((mi: { id: string; name: string; price: number; is_available: boolean }) => {
      byId.set(mi.id, mi);
      byName.set(mi.name.toLowerCase().trim(), mi);
    });

    const resolvedItems: {
      menu_item_id: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
      kitchen_notes: string | null;
      customization: ItemCustomization | null;
    }[] = [];
    for (const item of items) {
      const qty = Math.max(1, Math.floor(Number(item.quantity) || 0));
      if (!qty) continue;
      const menuItem =
        (item.menuItemId && byId.get(item.menuItemId)) ||
        byName.get((item.title || "").toLowerCase().trim());
      if (!menuItem) {
        return { success: false, message: `Unknown menu item: ${item.title}` };
      }
      if (menuItem.is_available === false) {
        return { success: false, message: `${menuItem.name} is currently unavailable.` };
      }
      const customization = item.customization || null;
      const extra = customization ? extrasTotal(customization) : 0;
      const unitPrice = Number(menuItem.price) + extra;
      const kitchenNotes = customization ? formatKitchenNotes(customization) : null;
      resolvedItems.push({
        menu_item_id: menuItem.id,
        quantity: qty,
        unit_price: unitPrice,
        subtotal: unitPrice * qty,
        kitchen_notes: kitchenNotes,
        customization,
      });
    }

    if (resolvedItems.length === 0) {
      return { success: false, message: "No valid menu items in cart." };
    }

    const addedTotal = resolvedItems.reduce((sum, item) => sum + item.subtotal, 0);

    if (tableData.current_order_id) {
      const { data: existing } = await supabase
        .from("orders")
        .select("id, status, total_amount, customer_notes")
        .eq("id", tableData.current_order_id)
        .maybeSingle();

      if (existing && existing.status !== "paid" && existing.status !== "cancelled") {
        for (const item of resolvedItems) {
          const { data: existingItem } = await supabase
            .from("order_items")
            .select("id, quantity")
            .eq("order_id", existing.id)
            .eq("menu_item_id", item.menu_item_id)
            .maybeSingle();

          if (existingItem && !item.kitchen_notes && !item.customization) {
            const qty = Number(existingItem.quantity) + item.quantity;
            await supabase
              .from("order_items")
              .update({ quantity: qty, subtotal: item.unit_price * qty })
              .eq("id", existingItem.id);
          } else {
            await insertOrderItemRow(supabase, {
              order_id: existing.id,
              ...item,
            });
          }
        }

        const bumpedStatus =
          existing.status === "served" || existing.status === "ready" ? "placed" : existing.status;
        const notes = [existing.customer_notes, customerNote].filter(Boolean).join(" | ") || null;

        await supabase
          .from("orders")
          .update({
            total_amount: Number(existing.total_amount || 0) + addedTotal,
            status: bumpedStatus,
            customer_notes: notes,
          })
          .eq("id", existing.id);

        await supabase
          .from("tables")
          .update({ status: "occupied", current_order_id: existing.id })
          .eq("id", tableData.id);

        await logTableServiceEvent(supabase, {
          tableId: tableData.id,
          staffId: tableData.assigned_staff_id,
          orderId: existing.id,
          eventType: "order_placed",
          notes: "Items added to open ticket",
        });

        revalidatePath("/admin/tables");
        revalidatePath("/admin/dashboard");
        revalidatePath("/admin/orders");
        revalidatePath("/chef/dashboard");
        revalidatePath("/staff/dashboard");
        revalidatePath("/staff/cashier");
        revalidatePath("/cashier");

        return {
          success: true,
          appended: true,
          orderId: existing.id,
          orderNumber: `#KD-${existing.id.substring(0, 5).toUpperCase()}`,
          totalAmount: Number(existing.total_amount || 0) + addedTotal,
        };
      }
    }

    const totalAmount = addedTotal;

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          restaurant_id: DEFAULT_RESTAURANT_ID,
          table_id: tableData.id,
          staff_id: tableData.assigned_staff_id || null,
          status: "placed",
          channel: "dine_in",
          total_amount: totalAmount,
          customer_notes: customerNote || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (orderError || !orderData || orderData.length === 0) {
      console.error("Supabase Order Creation Error:", orderError?.message);
      return { success: false, message: orderError?.message || "Failed to save order to database." };
    }

    const createdOrder = orderData[0];
    const orderId = createdOrder.id;

    for (const item of resolvedItems) {
      const { error: itemsError } = await insertOrderItemRow(supabase, {
        order_id: orderId,
        ...item,
      });
      if (itemsError) {
        console.error("Supabase Order Items Error:", itemsError.message);
        return { success: false, message: "Order saved but items failed to record." };
      }
    }

    await supabase
      .from("tables")
      .update({ status: "occupied", current_order_id: orderId })
      .eq("id", tableData.id);

    await logTableServiceEvent(supabase, {
      tableId: tableData.id,
      staffId: tableData.assigned_staff_id,
      orderId,
      eventType: "order_placed",
    });

    revalidatePath("/admin/tables");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/orders");
    revalidatePath("/chef/dashboard");
    revalidatePath("/staff/dashboard");
    revalidatePath("/staff/cashier");
    revalidatePath("/cashier");

    return {
      success: true,
      appended: false,
      orderId: orderId,
      orderNumber: `#KD-${orderId.substring(0, 5).toUpperCase()}`,
      totalAmount,
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
  amount?: number,
  reference?: string,
  tipAmount?: number,
  customerPhone?: string,
  customerName?: string
) {
  if (!orderId) return { success: false, message: "Missing order." };

  try {
    const supabase = await getSupabase();
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, total_amount, table_id, staff_id")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) return { success: false, message: "Order not found." };
    if (order.status === "paid" || order.status === "cancelled") {
      return { success: false, message: "This order is already closed." };
    }

    const billTotal = computeBill(Number(order.total_amount || 0)).total;
    const tip = Math.max(0, Number(tipAmount || 0));
    const payAmount = amount ?? billTotal + tip;
    const dbMethod =
      method === "cash" ? "cash" : method === "cbe_birr" ? "cbe_transfer" : "telegram";

    const { data: pending } = await supabase
      .from("payments")
      .select("id")
      .eq("order_id", orderId)
      .eq("status", "pending")
      .maybeSingle();

    const paymentPayload = {
      method: dbMethod,
      amount: payAmount,
      tip_amount: tip,
      transaction_reference: reference?.trim() || null,
      status: "pending" as const,
    };

    if (pending?.id) {
      let update = await supabase.from("payments").update(paymentPayload).eq("id", pending.id);
      if (update.error?.message?.includes("tip_amount")) {
        const { tip_amount: _tip, ...rest } = paymentPayload;
        update = await supabase.from("payments").update(rest).eq("id", pending.id);
      }
      if (update.error) {
        return { success: false, message: update.error.message };
      }
    } else {
      let insert = await supabase.from("payments").insert([
        { order_id: orderId, ...paymentPayload },
      ]);
      if (insert.error?.message?.includes("tip_amount")) {
        const { tip_amount: _tip, ...rest } = paymentPayload;
        insert = await supabase.from("payments").insert([{ order_id: orderId, ...rest }]);
      }
      if (insert.error) {
        return { success: false, message: insert.error.message };
      }
    }

    if (order.table_id) {
      await logTableServiceEvent(supabase, {
        tableId: order.table_id,
        staffId: order.staff_id,
        orderId,
        eventType: "payment_pending",
        notes: `${method}${tip > 0 ? ` · tip ${tip} ETB` : ""}`,
      });
    }

    if (customerPhone) {
      await upsertCustomerByPhone(supabase, {
        phone: customerPhone,
        fullName: customerName,
        orderId,
        spentDelta: billTotal,
        tipDelta: tip,
      });
    }

    revalidatePath("/staff/cashier");
    revalidatePath("/cashier");
    revalidatePath("/admin/finance");
    revalidatePath("/staff/dashboard");

    return {
      success: true,
      message: "Payment submitted. The cashier will confirm and print your receipt.",
    };
  } catch (err) {
    console.error("submitPaymentAction:", err);
    return { success: false, message: "Could not record payment. Try again." };
  }
}

export interface GuestActiveOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  photoUrl?: string;
}

export interface GuestActiveOrder {
  orderId: string;
  orderNumber: string;
  status: "placed" | "preparing" | "ready" | "served" | "paid" | "cancelled";
  foodSubtotal: number;
  items: GuestActiveOrderItem[];
  hasPendingPayment?: boolean;
  pendingTip?: number;
}

export async function getActiveTableOrderAction(
  tableCode: string
): Promise<GuestActiveOrder | null> {
  if (!tableCode) return null;

  try {
    const supabase = await getSupabase();
    const cleanCode = tableCode.trim().toUpperCase();
    const { data: table } = await supabase
      .from("tables")
      .select("id, current_order_id")
      .or(`unique_code.eq.${cleanCode},unique_code.eq.${tableCode}`)
      .maybeSingle();

    if (!table?.id) return null;

    const { data: openOrders } = await supabase
      .from("orders")
      .select("id, status, total_amount")
      .eq("table_id", table.id)
      .in("status", ["placed", "preparing", "ready", "served"])
      .order("created_at", { ascending: false })
      .limit(5);

    const pinned = (openOrders || []).find((o) => o.id === table.current_order_id);
    const order = pinned || openOrders?.[0];
    if (!order) return null;

    const { data: rows } = await supabase
      .from("order_items")
      .select("quantity, unit_price, menu_item_id, menu_item:menu_item_id (id, name, price, image_url)")
      .eq("order_id", order.id);

    const items: GuestActiveOrderItem[] = (rows || []).map((row: any) => {
      const menu = Array.isArray(row.menu_item) ? row.menu_item[0] : row.menu_item;
      return {
        menuItemId: menu?.id || row.menu_item_id || "",
        name: menu?.name || "Menu item",
        price: Number(row.unit_price ?? menu?.price ?? 0),
        quantity: Number(row.quantity || 1),
        photoUrl: menu?.image_url || undefined,
      };
    });

    const { data: pendingPayment } = await supabase
      .from("payments")
      .select("id, tip_amount")
      .eq("order_id", order.id)
      .eq("status", "pending")
      .maybeSingle();

    return {
      orderId: order.id,
      orderNumber: `#KD-${order.id.substring(0, 5).toUpperCase()}`,
      status: order.status,
      foodSubtotal: Number(order.total_amount || 0),
      items,
      hasPendingPayment: !!pendingPayment?.id,
      pendingTip: Number(pendingPayment?.tip_amount || 0),
    };
  } catch (err) {
    console.error("Error loading active table order:", err);
    return null;
  }
}

export interface FeedbackSubmissionPayload {
  orderId?: string;
  tableCode?: string;
  staffId?: string;
  staffFriendliness: number;
  staffPromptness: number;
  foodRating: number;
  ambienceRating: number;
  comment?: string;
  redirectedToGoogle?: boolean;
  customerPhone?: string;
  customerName?: string;
}

export async function submitFeedbackAction(payload: FeedbackSubmissionPayload) {
  try {
    const supabase = await getSupabase();

    let resolvedOrderId = payload.orderId || null;
    let resolvedStaffId = payload.staffId || null;

    if (!resolvedOrderId && payload.tableCode) {
      const cleanCode = payload.tableCode.trim().toUpperCase();
      const { data: tableData } = await supabase
        .from("tables")
        .select("id, assigned_staff_id, current_order_id")
        .or(`unique_code.eq.${cleanCode},unique_code.eq.${payload.tableCode}`)
        .maybeSingle();

      if (tableData) {
        resolvedStaffId = resolvedStaffId || tableData.assigned_staff_id || null;
        resolvedOrderId = tableData.current_order_id || null;
      }
    }

    if (!resolvedOrderId) {
      return { success: false, message: "Cannot attach feedback without an order." };
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id, staff_id")
      .eq("id", resolvedOrderId)
      .maybeSingle();

    if (!order) {
      return { success: false, message: "Order not found." };
    }
    resolvedStaffId = resolvedStaffId || order.staff_id || null;

    const q1 = Number(payload.staffFriendliness) || 5;
    const q2 = Number(payload.staffPromptness) || 5;
    const food = Number(payload.foodRating) || 5;
    const speed = Number(payload.staffPromptness) || 5;
    const ambience = Number(payload.ambienceRating) || 5;
    const weighted = Math.round((0.25 * q1 + 0.25 * q2 + 0.20 * food + 0.15 * speed + 0.15 * ambience) * 100) / 100;

    const { error: insertErr } = await supabase.from("feedback").insert([
      {
        order_id: resolvedOrderId,
        staff_id: resolvedStaffId,
        staff_rating_q1: q1,
        staff_rating_q2: q2,
        experience_rating_food: food,
        experience_rating_speed: speed,
        experience_rating_ambience: ambience,
        weighted_score: weighted,
        customer_comment: payload.comment || null,
        redirected_to_google: Boolean(payload.redirectedToGoogle),
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertErr) {
      console.error("Error inserting feedback:", insertErr.message);
      return { success: false, message: "Failed to save feedback." };
    }

    if (resolvedStaffId) {
      const { data: staffFeedbacks } = await supabase
        .from("feedback")
        .select("weighted_score")
        .eq("staff_id", resolvedStaffId);

      if (staffFeedbacks && staffFeedbacks.length > 0) {
        const total = staffFeedbacks.reduce((sum, f) => sum + Number(f.weighted_score || 5), 0);
        const avg = Math.round((total / staffFeedbacks.length) * 10) / 10;
        await supabase.from("staff").update({ performance_score: avg }).eq("id", resolvedStaffId);
      }
    }

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/dashboard");

    if (payload.customerPhone) {
      await upsertCustomerByPhone(supabase, {
        phone: payload.customerPhone,
        fullName: payload.customerName,
        orderId: resolvedOrderId,
        countVisit: false,
      });
    }

    return { success: true };
  } catch (err) {
    console.error("Feedback submission exception:", err);
    return { success: false, message: "Failed to save feedback." };
  }
}

export async function getOrderStatusAction(orderId: string) {
  if (!orderId) return null;
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .maybeSingle();

    if (data?.status) {
      return {
        status: data.status as "placed" | "preparing" | "ready" | "served" | "paid" | "cancelled",
      };
    }
  } catch (err) {
    console.error("Error fetching order status:", err);
  }
  return null;
}

export async function getReceiptAction(orderId: string) {
  if (!orderId) return null;
  try {
    const supabase = await getSupabase();
    return await loadReceiptForOrder(supabase, orderId);
  } catch (err) {
    console.error("Error loading receipt:", err);
    return null;
  }
}

export async function confirmPaymentAction(orderId: string) {
  const session = await requireFloorStaff();
  if (!session) return UNAUTHORIZED;

  try {
    const supabase = await getSupabase();
    const { data: order } = await supabase
      .from("orders")
      .select("id, total_amount, table_id, status")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) return { success: false, message: "Order not found." };
    if (order.status === "paid") return { success: true, message: "Already paid." };

    const { data: payment } = await supabase
      .from("payments")
      .select("id")
      .eq("order_id", orderId)
      .eq("status", "pending")
      .maybeSingle();

    let paymentId = payment?.id;
    if (paymentId) {
      await supabase
        .from("payments")
        .update({
          status: "confirmed",
          confirmed_by: session.id,
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", paymentId);
    } else {
      const { data: inserted } = await supabase
        .from("payments")
        .insert([
          {
            order_id: orderId,
            method: "cash",
            amount: computeBill(Number(order.total_amount)).total,
            status: "confirmed",
            confirmed_by: session.id,
            confirmed_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();
      paymentId = inserted?.id;
    }

    if (paymentId) {
      await issueReceiptNumber(supabase, paymentId);
    }

    await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
    if (order.table_id) {
      await supabase
        .from("tables")
        .update({ status: "free", current_order_id: null })
        .eq("id", order.table_id);
    }

    revalidatePath("/staff/dashboard");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/finance");
    return { success: true, receipt: await loadReceiptForOrder(supabase, orderId) };
  } catch (err) {
    console.error("Failed to confirm payment:", err);
    return { success: false, message: "Failed to confirm payment." };
  }
}
