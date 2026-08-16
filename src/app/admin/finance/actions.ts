"use server";

import { revalidatePath } from "next/cache";

export interface MockExpenseItem {
  id: string;
  category: "rent" | "salaries" | "utilities" | "supplies" | "maintenance" | "misc";
  title: string;
  amount: number;
  expenseDate: string;
  loggedBy: string;
}

export interface MenuEngineeringItem {
  id: string;
  dishName: string;
  category: string;
  salesCount: number;
  totalRevenue: number;
  grossMarginPercent: number;
  classification: "Star" | "Plowhorse" | "Puzzle" | "Dog";
  recommendation: string;
}

let mockExpensesDb: MockExpenseItem[] = [
  {
    id: "exp-01",
    category: "rent",
    title: "Bole Medhanialem Commercial Premises Rent (August)",
    amount: 140000,
    expenseDate: "2026-08-01",
    loggedBy: "Abebe Kebede (Owner)",
  },
  {
    id: "exp-02",
    category: "salaries",
    title: "Kitchen, Attendant & Host Payroll Base",
    amount: 185000,
    expenseDate: "2026-08-05",
    loggedBy: "Tigist Haile (Manager)",
  },
  {
    id: "exp-03",
    category: "utilities",
    title: "Electricity, Commercial Water & 100Mbps Fiber",
    amount: 28500,
    expenseDate: "2026-08-08",
    loggedBy: "Tigist Haile (Manager)",
  },
  {
    id: "exp-04",
    category: "supplies",
    title: "Takeout Kraft Eco-Boxes, Napkins & Cleaning Agents",
    amount: 14200,
    expenseDate: "2026-08-12",
    loggedBy: "Tigist Haile (Manager)",
  },
  {
    id: "exp-05",
    category: "maintenance",
    title: "Espresso Machine Boiler Servicing & Acacia Hearth Charcoal",
    amount: 8600,
    expenseDate: "2026-08-14",
    loggedBy: "Tigist Haile (Manager)",
  },
];

let mockMenuMatrixDb: MenuEngineeringItem[] = [
  {
    id: "m-01",
    dishName: "Special Sizzling Awaze Tibs",
    category: "Mains",
    salesCount: 412,
    totalRevenue: 214240,
    grossMarginPercent: 67.6,
    classification: "Star",
    recommendation: "Maintain high consistency; featured prominently on digital menu.",
  },
  {
    id: "m-02",
    dishName: "Royal Doro Wat Feast",
    category: "Mains",
    salesCount: 348,
    totalRevenue: 201840,
    grossMarginPercent: 66.6,
    classification: "Star",
    recommendation: "Signature cultural flagship dish; ensure supply of farm eggs and drumsticks.",
  },
  {
    id: "m-03",
    dishName: "Claypot Sizzling Shiro Misto",
    category: "Mains",
    salesCount: 390,
    totalRevenue: 140400,
    grossMarginPercent: 74.5,
    classification: "Star",
    recommendation: "High margin and high popularity; highly lucrative staple.",
  },
  {
    id: "m-04",
    dishName: "Crispy Lentil & Beef Sambusa",
    category: "Starters",
    salesCount: 520,
    totalRevenue: 114400,
    grossMarginPercent: 54.0,
    classification: "Plowhorse",
    recommendation: "High volume but moderate margin; consider slight +20 ETB price adjustment.",
  },
  {
    id: "m-05",
    dishName: "Keren Sheba Honey Tej Decanter",
    category: "Beverages",
    salesCount: 180,
    totalRevenue: 57600,
    grossMarginPercent: 78.2,
    classification: "Puzzle",
    recommendation: "Extremely high margin but lower sales volume; run evening pairing specials.",
  },
  {
    id: "m-06",
    dishName: "Derek Tibs with Inset",
    category: "Specials",
    salesCount: 95,
    totalRevenue: 56050,
    grossMarginPercent: 51.2,
    classification: "Dog",
    recommendation: "Lower sales and tighter margin; consider revamping charcoal prep recipe.",
  },
];

export async function getFinanceData() {
  const grossRevenue = 784500;
  const realizedCogs = 252800;
  const grossProfit = grossRevenue - realizedCogs;
  const totalOpex = mockExpensesDb.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalOpex;

  return {
    kpis: {
      grossRevenue,
      realizedCogs,
      grossProfit,
      totalOpex,
      netProfit,
      foodCostPercent: parseFloat(((realizedCogs / grossRevenue) * 100).toFixed(1)),
      netMarginPercent: parseFloat(((netProfit / grossRevenue) * 100).toFixed(1)),
      channelBreakdown: {
        dineIn: 572000,
        takeout: 138500,
        delivery: 74000,
      },
    },
    expenses: mockExpensesDb,
    menuMatrix: mockMenuMatrixDb,
  };
}

export async function logExpenseAction(data: {
  category: MockExpenseItem["category"];
  title: string;
  amount: number;
  expenseDate: string;
}) {
  const newExp: MockExpenseItem = {
    id: `exp-${Date.now()}`,
    category: data.category,
    title: data.title,
    amount: data.amount,
    expenseDate: data.expenseDate,
    loggedBy: "Tigist Haile (Manager)",
  };

  mockExpensesDb.unshift(newExp);
  revalidatePath("/admin/finance");
  revalidatePath("/admin/dashboard");
  return { success: true, expense: newExp };
}
