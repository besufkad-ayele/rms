import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const raw = fs.readFileSync(".env.local", "utf8").replace(/\r/g, "");
const map = {};
for (const line of raw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) map[m[1]] = m[2].trim();
}

// Simulate the PRODUCTION fallback: no valid service role -> anon client under RLS
const anon = createClient(map.NEXT_PUBLIC_SUPABASE_URL, map.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

const cleanId = "owner@tibebrms.com";
const { data, error } = await anon
  .from("staff")
  .select("*")
  .or(`email.ilike.${cleanId},phone_number.eq.${cleanId},personal_id_number.ilike.${cleanId}`)
  .maybeSingle();

console.log("ANON staff query:");
console.log("  error:", error?.message || "(none)");
console.log("  row found:", !!data);
if (data) {
  console.log("  email:", data.email);
  console.log("  pin_code_hash present:", !!data.pin_code_hash, "len:", (data.pin_code_hash || "").length);
}
process.exit(0);
