/**
 * Authentication and Hashing Utility Functions for Keren Addis Restaurant OS
 */

export async function hashPinCode(pin: string): Promise<string> {
  const cleanPin = pin.trim();
  if (typeof window === "undefined" && globalThis.crypto?.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(`keren_addis_salt_${cleanPin}`);
      const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return `sha256:${hashHex}`;
    } catch {
      return cleanPin;
    }
  }
  return cleanPin;
}

export async function verifyPinCode(enteredPin: string, storedHash: string): Promise<boolean> {
  const cleanPin = enteredPin.trim();
  if (!storedHash) return false;

  if (storedHash.startsWith("sha256:")) {
    const hashedEntered = await hashPinCode(cleanPin);
    return hashedEntered === storedHash;
  }

  // Direct comparison for plain text pins or seeded passwords
  return cleanPin === storedHash;
}
