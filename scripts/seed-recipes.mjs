import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const raw = fs.readFileSync(".env.local", "utf8").replace(/\r/g, "");
const map = {};
for (const line of raw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) map[m[1]] = m[2].trim();
}
const sb = createClient(map.NEXT_PUBLIC_SUPABASE_URL, map.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const RID = "00000000-0000-0000-0000-000000000001";

// Existing ingredients:
//  c...01 Prime Beef Tenderloin, c...02 Wild Highland Honey, c...03 Aged Berbere Spice Blend,
//  c...04 Fresh Niter Kibbeh, c...05 Yirgacheffe Specialty Coffee Beans
// New ingredients so every main dish has removable components.
const newIngredients = [
  { id: "c0000000-0000-0000-0000-000000000006", name: "Chickpea Shiro Powder", unit: "gram", cost: 0.12 },
  { id: "c0000000-0000-0000-0000-000000000007", name: "Minced Lean Beef", unit: "gram", cost: 0.44 },
  { id: "c0000000-0000-0000-0000-000000000008", name: "Fresh Garlic & Ginger", unit: "gram", cost: 0.09 },
  { id: "c0000000-0000-0000-0000-000000000009", name: "Rosemary Sprig", unit: "gram", cost: 0.15 },
  { id: "c0000000-0000-0000-0000-000000000010", name: "Mitmita Chili Blend", unit: "gram", cost: 0.22 },
  { id: "c0000000-0000-0000-0000-000000000011", name: "Cardamom & Cloves", unit: "gram", cost: 0.31 },
  { id: "c0000000-0000-0000-0000-000000000012", name: "Fresh Ayib (Cottage Cheese)", unit: "gram", cost: 0.2 },
];

for (const ing of newIngredients) {
  const { error } = await sb.from("ingredients").upsert(
    {
      id: ing.id,
      restaurant_id: RID,
      name: ing.name,
      unit: ing.unit,
      stock_qty: 5000,
      low_stock_threshold: 1000,
      cost_per_unit: ing.cost,
    },
    { onConflict: "id" }
  );
  if (error) console.log("ingredient upsert error", ing.name, error.message);
}
console.log("ingredients seeded.");

// menu items
const AWAZE = "d0000000-0000-0000-0000-000000000001";
const SHIRO = "d0000000-0000-0000-0000-000000000003";
const KITFO = "d0000000-0000-0000-0000-000000000002";
const COFFEE = "d0000000-0000-0000-0000-000000000004";
const TEJ = "d0000000-0000-0000-0000-000000000005";

// recipe rows: [menu_item_id, ingredient_id, qty]
// First ingredient listed per dish becomes the "required" (primary) one in the UI.
const recipes = [
  // Awaze Tibs — beef is primary/required; add aromatics as removable
  [AWAZE, "c0000000-0000-0000-0000-000000000001", 350],
  [AWAZE, "c0000000-0000-0000-0000-000000000003", 30],
  [AWAZE, "c0000000-0000-0000-0000-000000000004", 50],
  [AWAZE, "c0000000-0000-0000-0000-000000000008", 20],
  [AWAZE, "c0000000-0000-0000-0000-000000000009", 5],
  // Shiro Misto — shiro powder primary
  [SHIRO, "c0000000-0000-0000-0000-000000000006", 200],
  [SHIRO, "c0000000-0000-0000-0000-000000000004", 40],
  [SHIRO, "c0000000-0000-0000-0000-000000000003", 25],
  [SHIRO, "c0000000-0000-0000-0000-000000000008", 20],
  // Kitfo Royale — minced beef primary
  [KITFO, "c0000000-0000-0000-0000-000000000007", 300],
  [KITFO, "c0000000-0000-0000-0000-000000000004", 60],
  [KITFO, "c0000000-0000-0000-0000-000000000010", 15],
  [KITFO, "c0000000-0000-0000-0000-000000000011", 8],
  [KITFO, "c0000000-0000-0000-0000-000000000012", 80],
  // Coffee — beans primary + cardamom removable
  [COFFEE, "c0000000-0000-0000-0000-000000000005", 40],
  [COFFEE, "c0000000-0000-0000-0000-000000000011", 4],
  // Tej — honey primary
  [TEJ, "c0000000-0000-0000-0000-000000000002", 200],
];

// clear existing recipes for these menu items, then insert fresh (keeps ordering deterministic)
const menuIds = [AWAZE, SHIRO, KITFO, COFFEE, TEJ];
const { error: delErr } = await sb.from("recipes").delete().in("menu_item_id", menuIds);
if (delErr) console.log("delete recipes error", delErr.message);

for (const [mid, iid, qty] of recipes) {
  const { error } = await sb
    .from("recipes")
    .insert({ menu_item_id: mid, ingredient_id: iid, quantity_required: qty });
  if (error) console.log("recipe insert error", mid, iid, error.message);
}
console.log("recipes seeded.");

// verify
const { data: check } = await sb
  .from("recipes")
  .select("menu_item_id, ingredient:ingredient_id (name)");
const byDish = {};
for (const r of check || []) {
  (byDish[r.menu_item_id] ||= []).push(r.ingredient?.name);
}
console.log("\nrecipe coverage:");
for (const [mid, names] of Object.entries(byDish)) {
  console.log(mid.slice(0, 8), "->", names.join(", "));
}

process.exit(0);
