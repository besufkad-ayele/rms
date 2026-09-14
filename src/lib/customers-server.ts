import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_RESTAURANT_ID = "00000000-0000-0000-0000-000000000001";

/** Normalize Ethiopian phone input to a comparable key (keeps leading +, strips spaces/dashes). */
export function normalizePhone(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  const cleaned = trimmed.replace(/[\s\-()]/g, "");
  // 0912... -> +2519...  ; 251912... -> +251912...
  if (/^0\d{9}$/.test(cleaned)) return `+251${cleaned.slice(1)}`;
  if (/^251\d{9}$/.test(cleaned)) return `+${cleaned}`;
  return cleaned;
}

export function isValidPhone(raw: string): boolean {
  const p = normalizePhone(raw);
  return /^\+?\d{9,15}$/.test(p);
}

export interface UpsertCustomerInput {
  phone: string;
  fullName?: string | null;
  orderId?: string | null;
  spentDelta?: number;
  tipDelta?: number;
  /** Whether this call represents a new visit (increments visit_count/points). Default true. */
  countVisit?: boolean;
}

/**
 * Insert or update a customer by phone, bump loyalty stats, and link the order.
 * Safe to call multiple times; returns the customer id (or null if phone invalid).
 * Never throws — capturing a phone must never block payment/feedback.
 */
export async function upsertCustomerByPhone(
  supabase: SupabaseClient,
  input: UpsertCustomerInput
): Promise<string | null> {
  try {
    const phone = normalizePhone(input.phone);
    if (!isValidPhone(phone)) return null;

    const { data: existing } = await supabase
      .from("customers")
      .select("id, visit_count, total_spent, total_tips, loyalty_points, full_name")
      .eq("restaurant_id", DEFAULT_RESTAURANT_ID)
      .eq("phone", phone)
      .maybeSingle();

    const spent = Math.max(0, Number(input.spentDelta || 0));
    const tip = Math.max(0, Number(input.tipDelta || 0));
    const countVisit = input.countVisit !== false;
    // 1 point per 10 ETB spent — tweak later for gamification tuning.
    const pointsDelta = countVisit ? Math.floor(spent / 10) : 0;
    const visitDelta = countVisit ? 1 : 0;

    let customerId: string | null = existing?.id || null;

    if (existing?.id) {
      await supabase
        .from("customers")
        .update({
          full_name: input.fullName?.trim() || existing.full_name || null,
          visit_count: Number(existing.visit_count || 0) + visitDelta,
          total_spent: Number(existing.total_spent || 0) + spent,
          total_tips: Number(existing.total_tips || 0) + tip,
          loyalty_points: Number(existing.loyalty_points || 0) + pointsDelta,
          last_seen: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      const { data: inserted } = await supabase
        .from("customers")
        .insert([
          {
            restaurant_id: DEFAULT_RESTAURANT_ID,
            phone,
            full_name: input.fullName?.trim() || null,
            visit_count: visitDelta,
            total_spent: spent,
            total_tips: tip,
            loyalty_points: pointsDelta,
          },
        ])
        .select("id")
        .single();
      customerId = inserted?.id || null;
    }

    if (customerId && input.orderId) {
      await supabase
        .from("orders")
        .update({ customer_id: customerId, customer_phone: phone })
        .eq("id", input.orderId);
    }

    return customerId;
  } catch (err) {
    console.warn("upsertCustomerByPhone skipped:", err);
    return null;
  }
}
