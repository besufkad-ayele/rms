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

export interface MockIngredientItem {
  id: string;
  name: string;
  category: "Meat & Poultry" | "Dairy & Fats" | "Produce & Veggies" | "Spices & Grains" | "Beverages & Honey";
  unit: "gram" | "ml" | "piece" | "kg" | "liter";
  stockQty: number;
  lowStockThreshold: number;
  costPerUnit: number;
  lastRestocked: string;
}

export interface MockRecipeData {
  id: string;
  dishName: string;
  category: string;
  sellingPrice: number;
  calculatedCogs: number;
  foodCostMarginPercent: number;
  ingredients: {
    name: string;
    qty: number;
    unit: string;
    costContribution: number;
  }[];
}

export interface MockReconciliationAudit {
  id: string;
  ingredientName: string;
  unit: string;
  expectedStock: number;
  physicalCount: number;
  variance: number;
  lossAmountETB: number;
  auditDate: string;
  loggedBy: string;
  reason?: "portioning_error" | "spoilage" | "kitchen_waste" | "unrecorded_use";
}

export async function getInventoryData() {
  try {
    const supabase = await getSupabase();

    // 1. Ingredients
    const { data: dbIngredients } = await supabase.from("ingredients").select("*").order("name");

    let ingredients: MockIngredientItem[] = [];
    if (dbIngredients && dbIngredients.length > 0) {
      ingredients = dbIngredients.map((i: any) => ({
        id: i.id,
        name: i.name,
        category: "Spices & Grains",
        unit: i.unit as any,
        stockQty: Number(i.stock_qty || 0),
        lowStockThreshold: Number(i.low_stock_threshold || 10),
        costPerUnit: Number(i.cost_per_unit || 0),
        lastRestocked: i.last_restocked_at ? i.last_restocked_at.split("T")[0] : "Recently",
      }));
    }

    // 2. Menu Items & Recipes
    const { data: dbMenuItems } = await supabase
      .from("menu_items")
      .select(`
        id,
        name,
        category,
        price,
        recipes (
          quantity_required,
          ingredient:ingredient_id (name, unit, cost_per_unit)
        )
      `);

    let recipes: MockRecipeData[] = [];
    if (dbMenuItems && dbMenuItems.length > 0) {
      recipes = dbMenuItems.map((item: any) => {
        const price = Number(item.price || 0);
        let cogs = 0;
        const ingList: any[] = [];

        if (Array.isArray(item.recipes)) {
          item.recipes.forEach((rc: any) => {
            const ingQty = Number(rc.quantity_required || 0);
            const ingCost = Number(rc.ingredient?.cost_per_unit || 0);
            const contrib = ingQty * ingCost;
            cogs += contrib;
            ingList.push({
              name: rc.ingredient?.name || "Ingredient",
              qty: ingQty,
              unit: rc.ingredient?.unit || "unit",
              costContribution: Math.round(contrib * 10) / 10,
            });
          });
        }

        if (cogs === 0) cogs = Math.round(price * 0.32);
        const foodCostMarginPercent = price > 0 ? Math.round((cogs / price) * 1000) / 10 : 32.0;

        return {
          id: item.id,
          dishName: item.name,
          category: item.category,
          sellingPrice: price,
          calculatedCogs: cogs,
          foodCostMarginPercent,
          ingredients: ingList.length > 0 ? ingList : [{ name: "Standard Meal BOM Base", qty: 1, unit: "serving", costContribution: Math.round(cogs) }],
        };
      });
    }

    return {
      ingredients,
      recipes,
      audits: [],
    };
  } catch (err) {
    console.error("Error fetching inventory data from Supabase:", err);
    return { ingredients: [], recipes: [], audits: [] };
  }
}

export async function addIngredientAction(data: {
  name: string;
  category: "Meat & Poultry" | "Dairy & Fats" | "Produce & Veggies" | "Spices & Grains" | "Beverages & Honey";
  unit: "gram" | "ml" | "piece" | "kg" | "liter";
  stockQty: number;
  lowStockThreshold: number;
  costPerUnit: number;
}) {
  try {
    const supabase = await getSupabase();
    await supabase.from("ingredients").insert([
      {
        restaurant_id: DEFAULT_RESTAURANT_ID,
        name: data.name,
        unit: data.unit,
        stock_qty: data.stockQty,
        low_stock_threshold: data.lowStockThreshold,
        cost_per_unit: data.costPerUnit,
        last_restocked_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.error("Failed to add ingredient in Supabase:", err);
  }

  revalidatePath("/admin/inventory");
  const inv = await getInventoryData();
  return { success: true, ingredients: inv.ingredients };
}

export async function restockIngredientAction(ingredientId: string, addedQty: number) {
  try {
    const supabase = await getSupabase();
    const { data: ing } = await supabase.from("ingredients").select("stock_qty").eq("id", ingredientId).single();

    if (ing) {
      const cur = Number(ing.stock_qty || 0);
      await supabase
        .from("ingredients")
        .update({
          stock_qty: cur + addedQty,
          last_restocked_at: new Date().toISOString(),
        })
        .eq("id", ingredientId);
    }
  } catch (err) {
    console.error("Failed to restock ingredient in Supabase:", err);
  }

  revalidatePath("/admin/inventory");
  const inv = await getInventoryData();
  return { success: true, ingredients: inv.ingredients };
}

export async function submitStockAuditAction(data: {
  ingredientId: string;
  physicalCount: number;
  reason?: "portioning_error" | "spoilage" | "kitchen_waste" | "unrecorded_use";
}) {
  try {
    const supabase = await getSupabase();
    await supabase
      .from("ingredients")
      .update({ stock_qty: data.physicalCount, updated_at: new Date().toISOString() })
      .eq("id", data.ingredientId);
  } catch (err) {
    console.error("Failed to submit stock audit in Supabase:", err);
  }

  revalidatePath("/admin/inventory");
  return { success: true };
}
