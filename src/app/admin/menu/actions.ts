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

export interface DBMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  amharic_name?: string;
  description?: string;
  category: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  is_spicy?: boolean;
  created_at?: string;
}

export async function getMenuItemsAction(): Promise<DBMenuItem[]> {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as DBMenuItem[];
    }
  } catch (err) {
    console.error("Error fetching menu items from Supabase:", err);
  }
  return [];
}

export async function createMenuItemAction(formData: FormData) {
  const name = (formData.get("name") as string) || "New Dish";
  const amharic_name = (formData.get("amharic_name") as string) || null;
  const description = (formData.get("description") as string) || null;
  const category = (formData.get("category") as string) || "Mains";
  const price = parseFloat((formData.get("price") as string) || "0");
  const image_url = (formData.get("image_url") as string) || null;
  const is_spicy = formData.get("is_spicy") === "on";

  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("menu_items")
      .insert([
        {
          restaurant_id: DEFAULT_RESTAURANT_ID,
          name,
          amharic_name,
          description,
          category,
          price,
          image_url,
          is_available: true,
          is_spicy,
        },
      ])
      .select();

    if (!error && data) {
      revalidatePath("/admin/menu");
      return { success: true, item: data[0] };
    }
  } catch (err) {
    console.error("Failed to create menu item in Supabase:", err);
  }

  revalidatePath("/admin/menu");
  return { success: false, message: "Failed to create menu item." };
}

export async function updateMenuItemAction(itemId: string, data: Partial<DBMenuItem>) {
  try {
    const supabase = await getSupabase();
    await supabase.from("menu_items").update(data).eq("id", itemId);

    revalidatePath("/admin/menu");
    return { success: true };
  } catch (err) {
    console.error("Failed to update menu item in Supabase:", err);
    return { success: false };
  }
}

export async function deleteMenuItemAction(itemId: string) {
  try {
    const supabase = await getSupabase();
    await supabase.from("menu_items").delete().eq("id", itemId);

    revalidatePath("/admin/menu");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete menu item from Supabase:", err);
    return { success: false };
  }
}
