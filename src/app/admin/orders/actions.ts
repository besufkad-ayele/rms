"use server";

import { revalidatePath } from "next/cache";

export interface MockAdminOrder {
  id: string;
  orderNumber: string;
  tableCode: string;
  channel: "dine_in" | "takeout" | "delivery";
  status: "placed" | "preparing" | "ready" | "served" | "paid" | "disputed" | "cancelled";
  waiterName: string;
  totalAmount: number;
  calculatedCogs: number;
  createdAt: string;
  customerNotes?: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes?: string;
  }[];
}

let mockOrdersDb: MockAdminOrder[] = [
  {
    id: "ord-104",
    orderNumber: "#KD-402",
    tableCode: "T-04",
    channel: "dine_in",
    status: "placed",
    waiterName: "Michael Tadesse",
    totalAmount: 1160,
    calculatedCogs: 366.5,
    createdAt: "10 mins ago",
    customerNotes: "Extra awaze on side, mild spice for kitfo",
    items: [
      { name: "Special Sizzling Awaze Tibs", quantity: 1, unitPrice: 520, subtotal: 520, notes: "Extra rosemary" },
      { name: "Gourmet Kereyu Kitfo Royale", quantity: 1, unitPrice: 640, subtotal: 640, notes: "Mild mitmita" },
    ],
  },
  {
    id: "ord-110",
    orderNumber: "#KD-401",
    tableCode: "T-15",
    channel: "dine_in",
    status: "placed",
    waiterName: "Sara Mengistu",
    totalAmount: 780,
    calculatedCogs: 245.0,
    createdAt: "14 mins ago",
    items: [
      { name: "Claypot Sizzling Shiro Misto", quantity: 1, unitPrice: 360, subtotal: 360 },
      { name: "Keren Sheba Honey Tej (Decanter)", quantity: 1, unitPrice: 320, subtotal: 320 },
      { name: "Single-Origin Yirgacheffe Pour-Over", quantity: 1, unitPrice: 100, subtotal: 100 },
    ],
  },
  {
    id: "ord-103",
    orderNumber: "#KD-398",
    tableCode: "T-03",
    channel: "dine_in",
    status: "preparing",
    waiterName: "Michael Tadesse",
    totalAmount: 2180,
    calculatedCogs: 690.0,
    createdAt: "22 mins ago",
    items: [
      { name: "Wood-Fired Lamb Derek Tibs", quantity: 2, unitPrice: 590, subtotal: 1180 },
      { name: "Yetsom Beyaynetu (Fasting Platter)", quantity: 1, unitPrice: 440, subtotal: 440 },
      { name: "Single-Origin Yirgacheffe Pour-Over", quantity: 2, unitPrice: 160, subtotal: 320 },
      { name: "Spiced Cardamom & Honey Baklava", quantity: 1, unitPrice: 240, subtotal: 240 },
    ],
  },
  {
    id: "ord-107",
    orderNumber: "#KD-397",
    tableCode: "T-11",
    channel: "dine_in",
    status: "preparing",
    waiterName: "Michael Tadesse",
    totalAmount: 1890,
    calculatedCogs: 598.0,
    createdAt: "28 mins ago",
    items: [
      { name: "Special Sizzling Awaze Tibs", quantity: 2, unitPrice: 520, subtotal: 1040 },
      { name: "Spiced Cardamom & Honey Baklava", quantity: 2, unitPrice: 240, subtotal: 480 },
      { name: "Keren Sheba Honey Tej (Decanter)", quantity: 1, unitPrice: 320, subtotal: 320 },
    ],
  },
  {
    id: "ord-101",
    orderNumber: "#KD-394",
    tableCode: "T-01",
    channel: "dine_in",
    status: "ready",
    waiterName: "Sara Mengistu",
    totalAmount: 840,
    calculatedCogs: 274.0,
    createdAt: "34 mins ago",
    items: [
      { name: "Claypot Sizzling Shiro Misto", quantity: 1, unitPrice: 360, subtotal: 360 },
      { name: "Spiced Cardamom & Honey Baklava", quantity: 2, unitPrice: 240, subtotal: 480 },
    ],
  },
  {
    id: "ord-108",
    orderNumber: "#KD-390",
    tableCode: "T-12",
    channel: "dine_in",
    status: "served",
    waiterName: "Michael Tadesse",
    totalAmount: 1420,
    calculatedCogs: 460.0,
    createdAt: "48 mins ago",
    items: [
      { name: "Royal Doro Wat Feast", quantity: 2, unitPrice: 580, subtotal: 1160 },
      { name: "Crispy Lentil & Beef Sambusa Trio", quantity: 1, unitPrice: 220, subtotal: 220 },
    ],
  },
  {
    id: "ord-095",
    orderNumber: "#KD-380",
    tableCode: "T-08",
    channel: "dine_in",
    status: "paid",
    waiterName: "Dawit Bekele",
    totalAmount: 4850,
    calculatedCogs: 1520.0,
    createdAt: "1h 30m ago",
    items: [
      { name: "Gourmet Kereyu Kitfo Royale", quantity: 3, unitPrice: 640, subtotal: 1920 },
      { name: "Royal Doro Wat Feast", quantity: 2, unitPrice: 580, subtotal: 1160 },
      { name: "Wood-Fired Lamb Derek Tibs", quantity: 2, unitPrice: 590, subtotal: 1180 },
      { name: "Keren Sheba Honey Tej (Decanter)", quantity: 2, unitPrice: 320, subtotal: 640 },
    ],
  },
];

export async function getOrdersData() {
  return { orders: mockOrdersDb };
}

export async function advanceOrderStatusAction(
  orderId: string,
  newStatus: MockAdminOrder["status"]
) {
  mockOrdersDb = mockOrdersDb.map((o) => {
    if (o.id === orderId) {
      return { ...o, status: newStatus };
    }
    return o;
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  return { success: true, orders: mockOrdersDb };
}

export async function disputeOrderAction(orderId: string, reason: string) {
  mockOrdersDb = mockOrdersDb.map((o) => {
    if (o.id === orderId) {
      return {
        ...o,
        status: "disputed" as const,
        customerNotes: `Disputed: ${reason}`,
      };
    }
    return o;
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  return { success: true, orders: mockOrdersDb };
}
