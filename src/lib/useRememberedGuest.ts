"use client";

import { useCallback, useEffect, useState } from "react";

const PHONE_KEY = "ka_guest_phone";
const NAME_KEY = "ka_guest_name";

export interface RememberedGuest {
  phone: string;
  name: string;
}

/**
 * Remembers the guest's phone/name on their device so returning guests
 * don't have to re-enter it. No login required — purely local convenience.
 */
export function useRememberedGuest() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setPhone(localStorage.getItem(PHONE_KEY) || "");
      setName(localStorage.getItem(NAME_KEY) || "");
    } catch {
      // ignore storage errors (private mode etc.)
    }
    setLoaded(true);
  }, []);

  const remember = useCallback((nextPhone: string, nextName?: string) => {
    try {
      if (nextPhone) localStorage.setItem(PHONE_KEY, nextPhone);
      if (nextName) localStorage.setItem(NAME_KEY, nextName);
    } catch {
      // ignore
    }
    setPhone(nextPhone);
    if (nextName !== undefined) setName(nextName);
  }, []);

  const forget = useCallback(() => {
    try {
      localStorage.removeItem(PHONE_KEY);
      localStorage.removeItem(NAME_KEY);
    } catch {
      // ignore
    }
    setPhone("");
    setName("");
  }, []);

  return { phone, name, loaded, isReturning: loaded && !!phone, remember, forget };
}
