import { BillBreakdown, computeBill } from "@/lib/utils";
import { RESTAURANT_INFO } from "@/data/mockMenu";

export interface ReceiptLine {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ReceiptData {
  receiptNumber: string;
  issuedAt: string;
  status: "pending" | "confirmed";
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  tin: string;
  vatNumber: string;
  tableCode: string;
  cashierName: string;
  paymentMethod: string;
  transactionReference?: string | null;
  items: ReceiptLine[];
  bill: BillBreakdown;
}

export function fallbackReceiptNumber(paymentId: string): string {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `KA-${day}-${paymentId.slice(0, 5).toUpperCase()}`;
}

export function restaurantIdentity(row?: {
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  tin?: string | null;
  vat_number?: string | null;
} | null): Pick<ReceiptData, "restaurantName" | "restaurantAddress" | "restaurantPhone" | "tin" | "vatNumber"> {
  return {
    restaurantName: row?.name || RESTAURANT_INFO.name,
    restaurantAddress: row?.address || RESTAURANT_INFO.address,
    restaurantPhone: row?.phone || RESTAURANT_INFO.phone,
    tin: row?.tin || process.env.NEXT_PUBLIC_RESTAURANT_TIN || "TIN pending",
    vatNumber: row?.vat_number || row?.tin || process.env.NEXT_PUBLIC_RESTAURANT_TIN || "VAT pending",
  };
}

export function methodLabel(method: string): string {
  if (method === "cbe_transfer" || method === "cbe_birr") return "CBE Transfer";
  if (method === "telegram" || method === "telebirr") return "Telebirr";
  if (method === "cash") return "Cash";
  return method;
}

export function assembleReceipt(input: {
  receiptNumber: string;
  issuedAt?: string;
  status: "pending" | "confirmed";
  restaurant?: Parameters<typeof restaurantIdentity>[0];
  tableCode: string;
  cashierName: string;
  paymentMethod: string;
  transactionReference?: string | null;
  items: ReceiptLine[];
  foodSubtotal: number;
}): ReceiptData {
  return {
    receiptNumber: input.receiptNumber,
    issuedAt: input.issuedAt || new Date().toISOString(),
    status: input.status,
    ...restaurantIdentity(input.restaurant),
    tableCode: input.tableCode,
    cashierName: input.cashierName,
    paymentMethod: methodLabel(input.paymentMethod),
    transactionReference: input.transactionReference,
    items: input.items,
    bill: computeBill(input.foodSubtotal),
  };
}
