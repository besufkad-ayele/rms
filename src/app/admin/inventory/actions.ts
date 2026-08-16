"use server";

import { revalidatePath } from "next/cache";

export interface MockIngredientItem {
  id: string;
  name: string;
  category: "Meat & Poultry" | "Dairy & Fats" | "Produce & Veggies" | "Spices & Grains" | "Beverages & Honey";
  unit: "gram" | "ml" | "piece" | "kg" | "liter";
  stockQty: number;
  lowStockThreshold: number;
  costPerUnit: number; // in ETB
  lastRestocked: string;
}

export interface MockRecipeData {
  id: string;
  dishName: string;
  category: string;
  sellingPrice: number;
  calculatedCogs: number;
  foodCostMarginPercent: number;
  ingredients: {
    name: string;
    qty: number;
    unit: string;
    costContribution: number;
  }[];
}

export interface MockReconciliationAudit {
  id: string;
  ingredientName: string;
  unit: string;
  expectedStock: number;
  physicalCount: number;
  variance: number;
  lossAmountETB: number;
  auditDate: string;
  loggedBy: string;
  reason?: "portioning_error" | "spoilage" | "kitchen_waste" | "unrecorded_use";
}

let mockIngredientsDb: MockIngredientItem[] = [
  {
    id: "ing-01",
    name: "Prime Beef Tenderloin",
    category: "Meat & Poultry",
    unit: "kg",
    stockQty: 3.2,
    lowStockThreshold: 8.0,
    costPerUnit: 480.0,
    lastRestocked: "2026-08-14",
  },
  {
    id: "ing-02",
    name: "Wild Highland Honey",
    category: "Beverages & Honey",
    unit: "liter",
    stockQty: 1.8,
    lowStockThreshold: 5.0,
    costPerUnit: 350.0,
    lastRestocked: "2026-08-12",
  },
  {
    id: "ing-03",
    name: "Aged Berbere Spice Blend",
    category: "Spices & Grains",
    unit: "kg",
    stockQty: 1.1,
    lowStockThreshold: 3.0,
    costPerUnit: 290.0,
    lastRestocked: "2026-08-10",
  },
  {
    id: "ing-04",
    name: "Niter Kibbeh (Clarified Butter)",
    category: "Dairy & Fats",
    unit: "kg",
    stockQty: 2.4,
    lowStockThreshold: 6.0,
    costPerUnit: 520.0,
    lastRestocked: "2026-08-13",
  },
  {
    id: "ing-05",
    name: "Free-Range Chicken Drumsticks",
    category: "Meat & Poultry",
    unit: "kg",
    stockQty: 14.5,
    lowStockThreshold: 10.0,
    costPerUnit: 320.0,
    lastRestocked: "2026-08-15",
  },
  {
    id: "ing-06",
    name: "100% Pure Teff Flour",
    category: "Spices & Grains",
    unit: "kg",
    stockQty: 48.0,
    lowStockThreshold: 20.0,
    costPerUnit: 95.0,
    lastRestocked: "2026-08-14",
  },
  {
    id: "ing-07",
    name: "Fresh Shiro Chickpea Powder",
    category: "Spices & Grains",
    unit: "kg",
    stockQty: 18.0,
    lowStockThreshold: 10.0,
    costPerUnit: 140.0,
    lastRestocked: "2026-08-15",
  },
  {
    id: "ing-08",
    name: "Specialty Yirgacheffe Coffee Beans",
    category: "Beverages & Honey",
    unit: "kg",
    stockQty: 9.5,
    lowStockThreshold: 5.0,
    costPerUnit: 410.0,
    lastRestocked: "2026-08-14",
  },
  {
    id: "ing-09",
    name: "Fresh Ayib Curd Cheese",
    category: "Dairy & Fats",
    unit: "kg",
    stockQty: 6.2,
    lowStockThreshold: 4.0,
    costPerUnit: 180.0,
    lastRestocked: "2026-08-15",
  },
  {
    id: "ing-10",
    name: "Organic Red Onions",
    category: "Produce & Veggies",
    unit: "kg",
    stockQty: 32.0,
    lowStockThreshold: 15.0,
    costPerUnit: 45.0,
    lastRestocked: "2026-08-13",
  },
];

let mockRecipesDb: MockRecipeData[] = [
  {
    id: "rcp-01",
    dishName: "Special Sizzling Awaze Tibs",
    category: "Mains",
    sellingPrice: 520.0,
    calculatedCogs: 168.5,
    foodCostMarginPercent: 32.4,
    ingredients: [
      { name: "Prime Beef Tenderloin", qty: 0.28, unit: "kg", costContribution: 134.4 },
      { name: "Niter Kibbeh", qty: 0.04, unit: "kg", costContribution: 20.8 },
      { name: "Aged Berbere / Awaze", qty: 0.02, unit: "kg", costContribution: 5.8 },
      { name: "Organic Red Onions & Rosemary", qty: 0.15, unit: "kg", costContribution: 7.5 },
    ],
  },
  {
    id: "rcp-02",
    dishName: "Royal Doro Wat Feast",
    category: "Mains",
    sellingPrice: 580.0,
    calculatedCogs: 194.0,
    foodCostMarginPercent: 33.4,
    ingredients: [
      { name: "Free-Range Chicken Drumsticks", qty: 0.35, unit: "kg", costContribution: 112.0 },
      { name: "Organic Red Onions (Slow Caramelized)", qty: 0.5, unit: "kg", costContribution: 22.5 },
      { name: "Aged Berbere Spice Blend", qty: 0.08, unit: "kg", costContribution: 23.2 },
      { name: "Niter Kibbeh", qty: 0.05, unit: "kg", costContribution: 26.0 },
      { name: "Fresh Ayib Curd", qty: 0.06, unit: "kg", costContribution: 10.3 },
    ],
  },
  {
    id: "rcp-03",
    dishName: "Gourmet Kereyu Kitfo Royale",
    category: "Specials",
    sellingPrice: 640.0,
    calculatedCogs: 198.0,
    foodCostMarginPercent: 30.9,
    ingredients: [
      { name: "Prime Beef Tenderloin (Minced)", qty: 0.32, unit: "kg", costContribution: 153.6 },
      { name: "Niter Kibbeh", qty: 0.06, unit: "kg", costContribution: 31.2 },
      { name: "Fresh Ayib Curd", qty: 0.07, unit: "kg", costContribution: 12.6 },
      { name: "Mitmita & Korerima", qty: 0.01, unit: "kg", costContribution: 0.6 },
    ],
  },
  {
    id: "rcp-04",
    dishName: "Claypot Sizzling Shiro Misto",
    category: "Mains",
    sellingPrice: 360.0,
    calculatedCogs: 92.0,
    foodCostMarginPercent: 25.5,
    ingredients: [
      { name: "Fresh Shiro Chickpea Powder", qty: 0.15, unit: "kg", costContribution: 21.0 },
      { name: "Prime Beef Cubes", qty: 0.1, unit: "kg", costContribution: 48.0 },
      { name: "Niter Kibbeh & Garlic", qty: 0.03, unit: "kg", costContribution: 15.6 },
      { name: "Organic Red Onions", qty: 0.16, unit: "kg", costContribution: 7.4 },
    ],
  },
  {
    id: "rcp-05",
    dishName: "Keren Sheba Honey Tej (Decanter)",
    category: "Beverages",
    sellingPrice: 320.0,
    calculatedCogs: 70.0,
    foodCostMarginPercent: 21.8,
    ingredients: [
      { name: "Wild Highland Honey", qty: 0.2, unit: "liter", costContribution: 70.0 },
    ],
  },
];

let mockAuditsDb: MockReconciliationAudit[] = [
  {
    id: "aud-01",
    ingredientName: "Prime Beef Tenderloin",
    unit: "kg",
    expectedStock: 3.5,
    physicalCount: 3.2,
    variance: -0.3,
    lossAmountETB: 144.0,
    auditDate: "2026-08-15",
    loggedBy: "Tigist Haile (Manager)",
    reason: "portioning_error",
  },
  {
    id: "aud-02",
    ingredientName: "Wild Highland Honey",
    unit: "liter",
    expectedStock: 2.0,
    physicalCount: 1.8,
    variance: -0.2,
    lossAmountETB: 70.0,
    auditDate: "2026-08-15",
    loggedBy: "Tigist Haile (Manager)",
    reason: "unrecorded_use",
  },
];

export async function getInventoryData() {
  return {
    ingredients: mockIngredientsDb,
    recipes: mockRecipesDb,
    audits: mockAuditsDb,
  };
}

export async function addIngredientAction(data: {
  name: string;
  category: "Meat & Poultry" | "Dairy & Fats" | "Produce & Veggies" | "Spices & Grains" | "Beverages & Honey";
  unit: "gram" | "ml" | "piece" | "kg" | "liter";
  stockQty: number;
  lowStockThreshold: number;
  costPerUnit: number;
}) {
  const newIng: MockIngredientItem = {
    id: `ing-${Date.now()}`,
    name: data.name,
    category: data.category,
    unit: data.unit,
    stockQty: data.stockQty,
    lowStockThreshold: data.lowStockThreshold,
    costPerUnit: data.costPerUnit,
    lastRestocked: new Date().toISOString().split("T")[0],
  };

  mockIngredientsDb.unshift(newIng);
  revalidatePath("/admin/inventory");
  return { success: true, ingredient: newIng };
}

export async function restockIngredientAction(ingredientId: string, addedQty: number) {
  mockIngredientsDb = mockIngredientsDb.map((ing) => {
    if (ing.id === ingredientId) {
      return {
        ...ing,
        stockQty: ing.stockQty + addedQty,
        lastRestocked: new Date().toISOString().split("T")[0],
      };
    }
    return ing;
  });

  revalidatePath("/admin/inventory");
  return { success: true, ingredients: mockIngredientsDb };
}

export async function submitStockAuditAction(data: {
  ingredientId: string;
  physicalCount: number;
  reason?: "portioning_error" | "spoilage" | "kitchen_waste" | "unrecorded_use";
}) {
  const target = mockIngredientsDb.find((i) => i.id === data.ingredientId);
  if (!target) return { success: false };

  const variance = parseFloat((data.physicalCount - target.stockQty).toFixed(2));
  const lossAmount = Math.abs(variance) * target.costPerUnit;

  const newAudit: MockReconciliationAudit = {
    id: `aud-${Date.now()}`,
    ingredientName: target.name,
    unit: target.unit,
    expectedStock: target.stockQty,
    physicalCount: data.physicalCount,
    variance,
    lossAmountETB: variance < 0 ? lossAmount : 0,
    auditDate: new Date().toISOString().split("T")[0],
    loggedBy: "Tigist Haile (Manager)",
    reason: data.reason || "portioning_error",
  };

  // Adjust stock to match physical count
  mockIngredientsDb = mockIngredientsDb.map((ing) => {
    if (ing.id === data.ingredientId) {
      return { ...ing, stockQty: data.physicalCount };
    }
    return ing;
  });

  mockAuditsDb.unshift(newAudit);
  revalidatePath("/admin/inventory");
  return { success: true, audit: newAudit };
}
