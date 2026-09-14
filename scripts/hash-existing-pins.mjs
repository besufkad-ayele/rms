import { createClient } from "@supabase/supabase-js";
import { randomBytes, scryptSync } from "crypto";
import { readFileSync } from "fs";
import { resolve } from "path";

try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const eq = trimmed.indexOf("=");
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // rely on process env
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

function hashPin(pin) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin.trim(), salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await supabase.from("staff").select("id, full_name, pin_code_hash");
if (error) {
  console.error(error.message);
  process.exit(1);
}

let upgraded = 0;
for (const staff of data || []) {
  if (!staff.pin_code_hash || String(staff.pin_code_hash).startsWith("scrypt:")) continue;
  const { error: updateError } = await supabase
    .from("staff")
    .update({ pin_code_hash: hashPin(staff.pin_code_hash) })
    .eq("id", staff.id);
  if (updateError) {
    console.error(`Failed to hash PIN for ${staff.full_name}: ${updateError.message}`);
    continue;
  }
  upgraded += 1;
  console.log(`Hashed PIN for ${staff.full_name}`);
}

console.log(`Done. Upgraded ${upgraded} staff PIN(s).`);
