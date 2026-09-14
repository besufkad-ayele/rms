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

const { data: ings } = await sb.from("ingredients").select("*");
console.log("ingredients columns:", Object.keys(ings?.[0] || {}));
console.log("ingredients:", JSON.stringify(ings, null, 2));

const { data: recipes } = await sb.from("recipes").select("*");
console.log("\nrecipes columns:", Object.keys(recipes?.[0] || {}));
console.log("recipes:", JSON.stringify(recipes, null, 2));

const { data: menu } = await sb.from("menu_items").select("id, name, category");
console.log("\nmenu:", JSON.stringify(menu, null, 2));

process.exit(0);
