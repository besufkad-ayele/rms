import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_KEYLEN = 64;

export function hashPin(pin: string): string {
  const clean = pin.trim();
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(clean, salt, SCRYPT_KEYLEN).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPin(enteredPin: string, stored: string | null | undefined): boolean {
  const clean = enteredPin.trim();
  if (!stored) return false;

  if (stored.startsWith("scrypt:")) {
    const parts = stored.split(":");
    if (parts.length !== 3) return false;
    const [, salt, hash] = parts;
    const computed = scryptSync(clean, salt, SCRYPT_KEYLEN);
    const expected = Buffer.from(hash, "hex");
    if (computed.length !== expected.length) return false;
    return timingSafeEqual(computed, expected);
  }

  if (stored.startsWith("sha256:")) {
    return false;
  }

  // Legacy plaintext seed values — compared once, then rehashed on login.
  return clean === stored;
}

export function isHashedPin(stored: string | null | undefined): boolean {
  return Boolean(stored && stored.startsWith("scrypt:"));
}
