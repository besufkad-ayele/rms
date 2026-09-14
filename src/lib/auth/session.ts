import { StaffPermissions, StaffRole } from "@/types/database";

export const SESSION_COOKIE = "rms_session_user";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface SessionUser {
  id: string;
  fullName: string;
  role: StaffRole;
  email?: string | null;
  personalId?: string;
  permissions: StaffPermissions;
  destination?: string;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET is missing or too short. Add a 32+ character secret to .env.local.");
  }
  return secret;
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const buffer = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  buffer.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64Url(signature);
}

async function hmacVerify(data: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(data);
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function signSession(user: SessionUser): Promise<string> {
  const payload = {
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmacSign(encoded);
  return `v1.${encoded}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;

  const [, encoded, signature] = parts;
  let valid = false;
  try {
    valid = await hmacVerify(encoded, signature);
  } catch {
    return null;
  }
  if (!valid) return null;

  try {
    const json = new TextDecoder().decode(fromBase64Url(encoded));
    const parsed = JSON.parse(json) as SessionUser & { exp?: number };
    if (!parsed?.id || !parsed?.role) return null;
    if (typeof parsed.exp === "number" && parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return {
      id: parsed.id,
      fullName: parsed.fullName,
      role: parsed.role,
      email: parsed.email,
      personalId: parsed.personalId,
      permissions: parsed.permissions || {
        can_manage_inventory: false,
        can_view_finance: false,
        can_manage_shifts: false,
        can_manage_staff: false,
      },
      destination: parsed.destination,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_TTL_SECONDS) {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge,
  };
}
