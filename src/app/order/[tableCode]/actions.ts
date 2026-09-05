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

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
    const supabase = await getSupabase();

    // 1. Fetch Table ID and assigned staff by tableCode
    const cleanCode = tableCode.trim().toUpperCase();
    const { data: tableData } = await supabase
      .from("tables")
      .select("id, assigned_staff_id")
      .or(`unique_code.eq.${cleanCode},unique_code.eq.${tableCode}`)
      .maybeSingle();

    const tableId = tableData?.id || null;
    const assignedStaffId = tableData?.assigned_staff_id || null;

    // 2. Fetch all menu items to resolve UUIDs
    const { data: dbMenuItems } = await supabase
      .from("menu_items")
      .select("id, name");

    const menuItemMap = new Map<string, string>();
    (dbMenuItems || []).forEach((mi: any) => {
      menuItemMap.set(mi.id, mi.id);
      menuItemMap.set(mi.name.toLowerCase().trim(), mi.id);
    });
    const defaultMenuItemId = dbMenuItems?.[0]?.id || "d0000000-0000-0000-0000-000000000001";

    // 3. Insert Order Record into Supabase
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          restaurant_id: DEFAULT_RESTAURANT_ID,
          table_id: tableId,
          staff_id: assignedStaffId,
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

    // 4. Insert Order Items
    const itemRows = items.map((item) => {
      let resolvedId = defaultMenuItemId;
      if (item.menuItemId && menuItemMap.has(item.menuItemId)) {
        resolvedId = menuItemMap.get(item.menuItemId)!;
      } else if (menuItemMap.has(item.title.toLowerCase().trim())) {
        resolvedId = menuItemMap.get(item.title.toLowerCase().trim())!;
      }

      return {
        order_id: orderId,
        menu_item_id: resolvedId,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      };
    });

    const { error: itemsError } = await supabase.from("order_items").insert(itemRows);
    if (itemsError) {
      console.error("Supabase Order Items Error:", itemsError.message);
    }

    // 5. Update Table Status to 'occupied'
    if (tableId) {
      await supabase
        .from("tables")
        .update({ status: "occupied", current_order_id: orderId })
        .eq("id", tableId);
    }

    revalidatePath("/admin/tables");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/orders");
    revalidatePath("/chef/dashboard");
    revalidatePath("/staff/dashboard");

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

    const dbMethod = method === "cash" ? "cash" : method === "cbe_birr" ? "cbe_transfer" : "telegram";

    // 1. Insert Payment Record
    if (orderId) {
      await supabase.from("payments").insert([
        {
          order_id: orderId,
          method: dbMethod,
          amount: amount,
          status: "confirmed",
          created_at: new Date().toISOString(),
        },
      ]);
    }

    // 2. Update Order Status
    if (orderId) {
      await supabase
        .from("orders")
        .update({ status: "paid" })
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
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/finance");
    revalidatePath("/staff/dashboard");

    return { success: true };
  } catch (err) {
    console.error("Payment recording exception:", err);
    return { success: false, message: "Failed to record payment in database." };
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
}

export async function submitFeedbackAction(payload: FeedbackSubmissionPayload) {
  try {
    const supabase = await getSupabase();

    let resolvedOrderId = payload.orderId || null;
    let resolvedStaffId = payload.staffId || null;

    if (payload.tableCode) {
      const cleanCode = payload.tableCode.trim().toUpperCase();
      const { data: tableData } = await supabase
        .from("tables")
        .select("id, assigned_staff_id, current_order_id")
        .or(`unique_code.eq.${cleanCode},unique_code.eq.${payload.tableCode}`)
        .maybeSingle();

      if (tableData) {
        if (!resolvedStaffId) {
          resolvedStaffId = tableData.assigned_staff_id || null;
        }
        if (!resolvedOrderId && tableData.current_order_id) {
          resolvedOrderId = tableData.current_order_id;
        } else if (!resolvedOrderId) {
          // Look up most recent order for this table
          const { data: tableOrder } = await supabase
            .from("orders")
            .select("id, staff_id")
            .eq("table_id", tableData.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (tableOrder) {
            resolvedOrderId = tableOrder.id;
            if (!resolvedStaffId) {
              resolvedStaffId = tableOrder.staff_id;
            }
          }
        }
      }
    }

    // Fallback order ID if session was already completed
    if (!resolvedOrderId) {
      const { data: recentOrder } = await supabase
        .from("orders")
        .select("id, staff_id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentOrder) {
        resolvedOrderId = recentOrder.id;
        if (!resolvedStaffId) {
          resolvedStaffId = recentOrder.staff_id;
        }
      } else {
        // Create an order placeholder if zero orders exist in database
        const { data: newOrder } = await supabase
          .from("orders")
          .insert([
            {
              restaurant_id: DEFAULT_RESTAURANT_ID,
              channel: "dine_in",
              status: "paid",
              total_amount: 0,
              calculated_cogs: 0,
              staff_id: resolvedStaffId || "b0000000-0000-0000-0000-000000000005",
              created_at: new Date().toISOString(),
            },
          ])
          .select("id, staff_id")
          .single();

        if (newOrder) {
          resolvedOrderId = newOrder.id;
          resolvedStaffId = resolvedStaffId || newOrder.staff_id;
        }
      }
    }

    const q1 = Number(payload.staffFriendliness) || 5;
    const q2 = Number(payload.staffPromptness) || 5;
    const food = Number(payload.foodRating) || 5;
    const speed = Number(payload.staffPromptness) || 5;
    const ambience = Number(payload.ambienceRating) || 5;

    // 5-Factor Weighted Score
    const weighted = Math.round((0.25 * q1 + 0.25 * q2 + 0.20 * food + 0.15 * speed + 0.15 * ambience) * 100) / 100;

    if (resolvedOrderId) {
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
      }
    }

    // Update staff performance rolling score
    if (resolvedStaffId) {
      const { data: staffFeedbacks } = await supabase
        .from("feedback")
        .select("weighted_score")
        .eq("staff_id", resolvedStaffId);

      if (staffFeedbacks && staffFeedbacks.length > 0) {
        const total = staffFeedbacks.reduce((sum, f) => sum + Number(f.weighted_score || 5), 0);
        const avg = Math.round((total / staffFeedbacks.length) * 10) / 10;
        await supabase
          .from("staff")
          .update({ performance_score: avg })
          .eq("id", resolvedStaffId);
      }
    }

    revalidatePath("/admin/reviews");
    revalidatePath("/admin/dashboard");
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
