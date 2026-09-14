import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatETB(amount: number): string {
  return new Intl.NumberFormat("en-ET", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + " ETB";
}

/** Ethiopian restaurant bill: 10% service charge, then 15% VAT on food + service. */
export const SERVICE_CHARGE_RATE = 0.1;
export const VAT_RATE = 0.15;

export interface BillBreakdown {
  subtotal: number;
  serviceCharge: number;
  vat: number;
  total: number;
}

export function computeBill(subtotal: number): BillBreakdown {
  const food = Math.max(0, Number(subtotal) || 0);
  const serviceCharge = Math.round(food * SERVICE_CHARGE_RATE);
  const vat = Math.round((food + serviceCharge) * VAT_RATE);
  return {
    subtotal: food,
    serviceCharge,
    vat,
    total: food + serviceCharge + vat,
  };
}
