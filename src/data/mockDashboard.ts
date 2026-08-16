import { Order, RestaurantTable, Staff, Ingredient, CustomerFeedback } from "@/types/database";

export interface DashboardKPIs {
  todayRevenue: number;
  revenueGrowthPercent: number;
  channelBreakdown: {
    dineIn: number;
    takeout: number;
    delivery: number;
  };
  realizedCogs: number;
  foodCostPercentage: number;
  grossProfit: number;
  totalTables: number;
  occupiedTables: number;
  freeTables: number;
  reservedTables: number;
  activeOrderCount: number;
  avgPreparationMinutes: number;
  onDutyStaffCount: number;
  avgStaffRating: number;
}

export const INITIAL_DASHBOARD_KPIS: DashboardKPIs = {
  todayRevenue: 48650,
  revenueGrowthPercent: 14.8,
  channelBreakdown: {
    dineIn: 36200,
    takeout: 8150,
    delivery: 4300,
  },
  realizedCogs: 15720,
  foodCostPercentage: 32.3,
  grossProfit: 32930,
  totalTables: 25,
  occupiedTables: 16,
  freeTables: 7,
  reservedTables: 2,
  activeOrderCount: 9,
  avgPreparationMinutes: 13.4,
  onDutyStaffCount: 8,
  avgStaffRating: 4.88,
};

export interface TableFloorState {
  id: string;
  table_number: number;
  unique_code: string;
  capacity: number;
  section: "Main Dining Hall" | "Terrace Garden" | "Lounge & Bar" | "VIP Alcove";
  status: "free" | "occupied" | "reserved";
  assigned_staff_id?: string;
  assigned_staff_name?: string;
  assigned_staff_role?: string;
  current_order_id?: string;
  current_order_total?: number;
  occupied_since_minutes?: number;
  active_guest_count?: number;
}

export const INITIAL_FLOOR_TABLES: TableFloorState[] = [
  {
    id: "tbl-01",
    table_number: 1,
    unique_code: "T-01",
    capacity: 2,
    section: "Terrace Garden",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000003",
    assigned_staff_name: "Sara Mengistu",
    assigned_staff_role: "waiter",
    current_order_id: "ord-101",
    current_order_total: 840,
    occupied_since_minutes: 38,
    active_guest_count: 2,
  },
  {
    id: "tbl-02",
    table_number: 2,
    unique_code: "T-02",
    capacity: 4,
    section: "Terrace Garden",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000003",
    assigned_staff_name: "Sara Mengistu",
    assigned_staff_role: "waiter",
    current_order_id: "ord-102",
    current_order_total: 1560,
    occupied_since_minutes: 52,
    active_guest_count: 3,
  },
  {
    id: "tbl-03",
    table_number: 3,
    unique_code: "T-03",
    capacity: 4,
    section: "Main Dining Hall",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000004",
    assigned_staff_name: "Michael Tadesse",
    assigned_staff_role: "waiter",
    current_order_id: "ord-103",
    current_order_total: 2180,
    occupied_since_minutes: 19,
    active_guest_count: 4,
  },
  {
    id: "tbl-04",
    table_number: 4,
    unique_code: "T-04",
    capacity: 4,
    section: "Main Dining Hall",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000004",
    assigned_staff_name: "Michael Tadesse",
    assigned_staff_role: "waiter",
    current_order_id: "ord-104",
    current_order_total: 1160,
    occupied_since_minutes: 14,
    active_guest_count: 2,
  },
  {
    id: "tbl-05",
    table_number: 5,
    unique_code: "T-05",
    capacity: 6,
    section: "Main Dining Hall",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000004",
    assigned_staff_name: "Michael Tadesse",
    assigned_staff_role: "waiter",
    current_order_id: "ord-105",
    current_order_total: 3420,
    occupied_since_minutes: 45,
    active_guest_count: 5,
  },
  {
    id: "tbl-06",
    table_number: 6,
    unique_code: "T-06",
    capacity: 2,
    section: "Lounge & Bar",
    status: "free",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000005",
    assigned_staff_name: "Eden Haile",
    assigned_staff_role: "waiter",
  },
  {
    id: "tbl-07",
    table_number: 7,
    unique_code: "T-07",
    capacity: 4,
    section: "Lounge & Bar",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000005",
    assigned_staff_name: "Eden Haile",
    assigned_staff_role: "waiter",
    current_order_id: "ord-106",
    current_order_total: 940,
    occupied_since_minutes: 27,
    active_guest_count: 2,
  },
  {
    id: "tbl-08",
    table_number: 8,
    unique_code: "T-08",
    capacity: 8,
    section: "VIP Alcove",
    status: "reserved",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000006",
    assigned_staff_name: "Dawit Bekele",
    assigned_staff_role: "host",
  },
  {
    id: "tbl-09",
    table_number: 9,
    unique_code: "T-09",
    capacity: 4,
    section: "Main Dining Hall",
    status: "free",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000004",
    assigned_staff_name: "Michael Tadesse",
    assigned_staff_role: "waiter",
  },
  {
    id: "tbl-10",
    table_number: 10,
    unique_code: "T-10",
    capacity: 2,
    section: "Terrace Garden",
    status: "free",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000003",
    assigned_staff_name: "Sara Mengistu",
    assigned_staff_role: "waiter",
  },
  {
    id: "tbl-11",
    table_number: 11,
    unique_code: "T-11",
    capacity: 4,
    section: "Main Dining Hall",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000004",
    assigned_staff_name: "Michael Tadesse",
    assigned_staff_role: "waiter",
    current_order_id: "ord-107",
    current_order_total: 1890,
    occupied_since_minutes: 32,
    active_guest_count: 4,
  },
  {
    id: "tbl-12",
    table_number: 12,
    unique_code: "T-12",
    capacity: 4,
    section: "Main Dining Hall",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000004",
    assigned_staff_name: "Michael Tadesse",
    assigned_staff_role: "waiter",
    current_order_id: "ord-108",
    current_order_total: 1420,
    occupied_since_minutes: 24,
    active_guest_count: 3,
  },
  {
    id: "tbl-13",
    table_number: 13,
    unique_code: "T-13",
    capacity: 6,
    section: "Main Dining Hall",
    status: "free",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000004",
    assigned_staff_name: "Michael Tadesse",
    assigned_staff_role: "waiter",
  },
  {
    id: "tbl-14",
    table_number: 14,
    unique_code: "T-14",
    capacity: 4,
    section: "Main Dining Hall",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000004",
    assigned_staff_name: "Michael Tadesse",
    assigned_staff_role: "waiter",
    current_order_id: "ord-109",
    current_order_total: 2650,
    occupied_since_minutes: 61,
    active_guest_count: 4,
  },
  {
    id: "tbl-15",
    table_number: 15,
    unique_code: "T-15",
    capacity: 2,
    section: "Terrace Garden",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000003",
    assigned_staff_name: "Sara Mengistu",
    assigned_staff_role: "waiter",
    current_order_id: "ord-110",
    current_order_total: 780,
    occupied_since_minutes: 12,
    active_guest_count: 2,
  },
  {
    id: "tbl-16",
    table_number: 16,
    unique_code: "T-16",
    capacity: 4,
    section: "Terrace Garden",
    status: "free",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000003",
    assigned_staff_name: "Sara Mengistu",
    assigned_staff_role: "waiter",
  },
  {
    id: "tbl-17",
    table_number: 17,
    unique_code: "T-17",
    capacity: 2,
    section: "Lounge & Bar",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000005",
    assigned_staff_name: "Eden Haile",
    assigned_staff_role: "waiter",
    current_order_id: "ord-111",
    current_order_total: 640,
    occupied_since_minutes: 15,
    active_guest_count: 2,
  },
  {
    id: "tbl-18",
    table_number: 18,
    unique_code: "T-18",
    capacity: 4,
    section: "Lounge & Bar",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000005",
    assigned_staff_name: "Eden Haile",
    assigned_staff_role: "waiter",
    current_order_id: "ord-112",
    current_order_total: 1320,
    occupied_since_minutes: 36,
    active_guest_count: 3,
  },
  {
    id: "tbl-19",
    table_number: 19,
    unique_code: "T-19",
    capacity: 4,
    section: "Lounge & Bar",
    status: "free",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000005",
    assigned_staff_name: "Eden Haile",
    assigned_staff_role: "waiter",
  },
  {
    id: "tbl-20",
    table_number: 20,
    unique_code: "T-20",
    capacity: 10,
    section: "VIP Alcove",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000006",
    assigned_staff_name: "Dawit Bekele",
    assigned_staff_role: "host",
    current_order_id: "ord-113",
    current_order_total: 5890,
    occupied_since_minutes: 74,
    active_guest_count: 8,
  },
  {
    id: "tbl-21",
    table_number: 21,
    unique_code: "T-21",
    capacity: 4,
    section: "Main Dining Hall",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000004",
    assigned_staff_name: "Michael Tadesse",
    assigned_staff_role: "waiter",
    current_order_id: "ord-114",
    current_order_total: 1680,
    occupied_since_minutes: 22,
    active_guest_count: 4,
  },
  {
    id: "tbl-22",
    table_number: 22,
    unique_code: "T-22",
    capacity: 4,
    section: "Main Dining Hall",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000004",
    assigned_staff_name: "Michael Tadesse",
    assigned_staff_role: "waiter",
    current_order_id: "ord-115",
    current_order_total: 2140,
    occupied_since_minutes: 41,
    active_guest_count: 3,
  },
  {
    id: "tbl-23",
    table_number: 23,
    unique_code: "T-23",
    capacity: 6,
    section: "Main Dining Hall",
    status: "reserved",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000004",
    assigned_staff_name: "Michael Tadesse",
    assigned_staff_role: "waiter",
  },
  {
    id: "tbl-24",
    table_number: 24,
    unique_code: "T-24",
    capacity: 4,
    section: "Terrace Garden",
    status: "occupied",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000003",
    assigned_staff_name: "Sara Mengistu",
    assigned_staff_role: "waiter",
    current_order_id: "ord-116",
    current_order_total: 1480,
    occupied_since_minutes: 29,
    active_guest_count: 3,
  },
  {
    id: "tbl-25",
    table_number: 25,
    unique_code: "T-25",
    capacity: 2,
    section: "Terrace Garden",
    status: "free",
    assigned_staff_id: "b0000000-0000-0000-0000-000000000003",
    assigned_staff_name: "Sara Mengistu",
    assigned_staff_role: "waiter",
  },
];

export interface LiveKitchenTicket {
  id: string;
  orderNumber: string;
  tableCode: string;
  tableNumber: number;
  waiterName: string;
  channel: "dine_in" | "takeout" | "delivery";
  status: "placed" | "preparing" | "ready" | "served" | "disputed";
  elapsedMinutes: number;
  totalAmount: number;
  customerNotes?: string;
  items: {
    name: string;
    quantity: number;
    notes?: string;
  }[];
}

export const INITIAL_KITCHEN_TICKETS: LiveKitchenTicket[] = [
  {
    id: "ord-104",
    orderNumber: "#KD-402",
    tableCode: "T-04",
    tableNumber: 4,
    waiterName: "Michael Tadesse",
    channel: "dine_in",
    status: "placed",
    elapsedMinutes: 4,
    totalAmount: 1160,
    customerNotes: "Extra awaze on side, mild spice for kitfo",
    items: [
      { name: "Special Sizzling Awaze Tibs", quantity: 1, notes: "Extra rosemary" },
      { name: "Gourmet Kereyu Kitfo Royale", quantity: 1, notes: "Mild mitmita" },
    ],
  },
  {
    id: "ord-110",
    orderNumber: "#KD-401",
    tableCode: "T-15",
    tableNumber: 15,
    waiterName: "Sara Mengistu",
    channel: "dine_in",
    status: "placed",
    elapsedMinutes: 7,
    totalAmount: 780,
    items: [
      { name: "Claypot Sizzling Shiro Misto", quantity: 1 },
      { name: "Keren Sheba Honey Tej (Decanter)", quantity: 1 },
    ],
  },
  {
    id: "ord-117",
    orderNumber: "#KD-400",
    tableCode: "Takeout-08",
    tableNumber: 0,
    waiterName: "Eden Haile",
    channel: "takeout",
    status: "placed",
    elapsedMinutes: 9,
    totalAmount: 1020,
    customerNotes: "Packaging for pickup in 15 min",
    items: [
      { name: "Royal Doro Wat Feast", quantity: 1 },
      { name: "Crispy Lentil & Beef Sambusa Trio", quantity: 2 },
    ],
  },
  {
    id: "ord-103",
    orderNumber: "#KD-398",
    tableCode: "T-03",
    tableNumber: 3,
    waiterName: "Michael Tadesse",
    channel: "dine_in",
    status: "preparing",
    elapsedMinutes: 14,
    totalAmount: 2180,
    items: [
      { name: "Wood-Fired Lamb Derek Tibs", quantity: 2 },
      { name: "Yetsom Beyaynetu (Fasting Platter)", quantity: 1 },
      { name: "Single-Origin Yirgacheffe Pour-Over", quantity: 2 },
    ],
  },
  {
    id: "ord-107",
    orderNumber: "#KD-397",
    tableCode: "T-11",
    tableNumber: 11,
    waiterName: "Michael Tadesse",
    channel: "dine_in",
    status: "preparing",
    elapsedMinutes: 16,
    totalAmount: 1890,
    items: [
      { name: "Special Sizzling Awaze Tibs", quantity: 2 },
      { name: "Spiced Cardamom & Honey Baklava", quantity: 2 },
    ],
  },
  {
    id: "ord-114",
    orderNumber: "#KD-396",
    tableCode: "T-21",
    tableNumber: 21,
    waiterName: "Michael Tadesse",
    channel: "dine_in",
    status: "preparing",
    elapsedMinutes: 18,
    totalAmount: 1680,
    items: [
      { name: "Royal Doro Wat Feast", quantity: 2 },
      { name: "Crispy Lentil & Beef Sambusa Trio", quantity: 1 },
    ],
  },
  {
    id: "ord-101",
    orderNumber: "#KD-394",
    tableCode: "T-01",
    tableNumber: 1,
    waiterName: "Sara Mengistu",
    channel: "dine_in",
    status: "ready",
    elapsedMinutes: 22,
    totalAmount: 840,
    items: [
      { name: "Claypot Sizzling Shiro Misto", quantity: 1 },
      { name: "Spiced Cardamom & Honey Baklava", quantity: 2 },
    ],
  },
  {
    id: "ord-111",
    orderNumber: "#KD-392",
    tableCode: "T-17",
    tableNumber: 17,
    waiterName: "Eden Haile",
    channel: "dine_in",
    status: "ready",
    elapsedMinutes: 24,
    totalAmount: 640,
    items: [
      { name: "Gourmet Kereyu Kitfo Royale", quantity: 1 },
    ],
  },
];

export interface LowStockAlertItem {
  id: string;
  name: string;
  category: string;
  stockQty: number;
  threshold: number;
  unit: "gram" | "ml" | "piece" | "kg" | "liter";
  costPerUnit: number;
  severity: "critical" | "warning";
}

export const INITIAL_LOW_STOCK_ALERTS: LowStockAlertItem[] = [
  {
    id: "ing-01",
    name: "Prime Beef Tenderloin",
    category: "Meat & Poultry",
    stockQty: 3.2,
    threshold: 8.0,
    unit: "kg",
    costPerUnit: 480,
    severity: "critical",
  },
  {
    id: "ing-02",
    name: "Wild Highland Honey",
    category: "Specialty / Tej",
    stockQty: 1.8,
    threshold: 5.0,
    unit: "liter",
    costPerUnit: 350,
    severity: "critical",
  },
  {
    id: "ing-03",
    name: "Aged Berbere Spice Blend",
    category: "Spices",
    stockQty: 1.1,
    threshold: 3.0,
    unit: "kg",
    costPerUnit: 290,
    severity: "warning",
  },
  {
    id: "ing-04",
    name: "Fresh Niter Kibbeh (Clarified Butter)",
    category: "Dairy & Fats",
    stockQty: 2.4,
    threshold: 6.0,
    unit: "kg",
    costPerUnit: 520,
    severity: "warning",
  },
];

export interface PendingSettlementItem {
  id: string;
  orderNumber: string;
  tableCode: string;
  tableNumber: number;
  waiterName: string;
  amount: number;
  method: "cash" | "cbe_transfer" | "telegram";
  txReference?: string;
  timeWaitingMinutes: number;
}

export const INITIAL_PENDING_SETTLEMENTS: PendingSettlementItem[] = [
  {
    id: "pay-101",
    orderNumber: "#KD-388",
    tableCode: "T-02",
    tableNumber: 2,
    waiterName: "Sara Mengistu",
    amount: 1560,
    method: "cash",
    timeWaitingMinutes: 6,
  },
  {
    id: "pay-102",
    orderNumber: "#KD-385",
    tableCode: "T-05",
    tableNumber: 5,
    waiterName: "Michael Tadesse",
    amount: 3420,
    method: "cbe_transfer",
    txReference: "FT2408159821CBE",
    timeWaitingMinutes: 11,
  },
  {
    id: "pay-103",
    orderNumber: "#KD-382",
    tableCode: "T-07",
    tableNumber: 7,
    waiterName: "Eden Haile",
    amount: 940,
    method: "telegram",
    txReference: "TELEBIRR-918240",
    timeWaitingMinutes: 3,
  },
];

export interface RecentReviewItem {
  id: string;
  tableCode: string;
  staffName: string;
  staffRating: number;
  foodRating: number;
  speedRating: number;
  weightedScore: number;
  comment?: string;
  redirectedToGoogle: boolean;
  timeAgo: string;
}

export const INITIAL_RECENT_REVIEWS: RecentReviewItem[] = [
  {
    id: "rev-01",
    tableCode: "T-03",
    staffName: "Michael Tadesse",
    staffRating: 5,
    foodRating: 5,
    speedRating: 5,
    weightedScore: 5.0,
    comment: "The Sizzling Tibs was world-class, and Michael anticipated our every need. Splendid evening!",
    redirectedToGoogle: true,
    timeAgo: "12m ago",
  },
  {
    id: "rev-02",
    tableCode: "T-01",
    staffName: "Sara Mengistu",
    staffRating: 5,
    foodRating: 4,
    speedRating: 5,
    weightedScore: 4.75,
    comment: "Delicious honey tej and fast warm service on the terrace.",
    redirectedToGoogle: true,
    timeAgo: "28m ago",
  },
  {
    id: "rev-03",
    tableCode: "T-18",
    staffName: "Eden Haile",
    staffRating: 4,
    foodRating: 5,
    speedRating: 4,
    weightedScore: 4.35,
    redirectedToGoogle: true,
    timeAgo: "45m ago",
  },
  {
    id: "rev-04",
    tableCode: "T-14",
    staffName: "Michael Tadesse",
    staffRating: 4,
    foodRating: 4,
    speedRating: 3,
    weightedScore: 3.8,
    comment: "Food was fantastic, though kitchen was a bit slow during the 8 PM peak rush.",
    redirectedToGoogle: false,
    timeAgo: "1h ago",
  },
];
