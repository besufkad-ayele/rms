import { DBMenuItem } from "@/app/admin/menu/actions";
import { MenuItemData, MENU_ITEMS } from "@/data/mockMenu";

// Fallback image maps for rich visuals if DB item lacks image
const DEFAULT_IMAGES: Record<string, string> = {
  main: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  starter: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  drink: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
  dessert: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80",
  side: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
};

export function adaptDBMenuItemToData(dbItem: DBMenuItem): MenuItemData {
  // Check if mock item provides extra rich images or tags
  const matchedMock = MENU_ITEMS.find(
    (m) =>
      m.name.toLowerCase() === dbItem.name.toLowerCase() ||
      (dbItem.amharic_name && m.amharicName === dbItem.amharic_name)
  );

  const rawCat = (dbItem.category || "main").toLowerCase();
  let category: "starters" | "mains" | "beverages" | "desserts" | "specials" = "mains";
  if (rawCat.includes("starter")) category = "starters";
  else if (rawCat.includes("drink") || rawCat.includes("beverage")) category = "beverages";
  else if (rawCat.includes("dessert")) category = "desserts";
  else if (rawCat.includes("special")) category = "specials";

  return {
    id: dbItem.id,
    name: dbItem.name,
    amharicName: dbItem.amharic_name || matchedMock?.amharicName,
    category,
    description: dbItem.description || matchedMock?.description || "Authentic highland delicacy prepared fresh.",
    price: Number(dbItem.price) || 0,
    photoUrl: dbItem.image_url || matchedMock?.photoUrl || DEFAULT_IMAGES[rawCat] || DEFAULT_IMAGES.main,
    isAvailable: dbItem.is_available ?? true,
    status: dbItem.is_available ? "available" : "sold_out",
    isSpicy: dbItem.is_spicy ?? matchedMock?.isSpicy ?? false,
    isVegetarian: matchedMock?.isVegetarian ?? false,
    isGlutenFree: matchedMock?.isGlutenFree ?? true,
    isChefSpecial: matchedMock?.isChefSpecial ?? false,
    preparationMinutes: 15,
    ingredients: matchedMock?.ingredients || ["Highland spices", "Niter Kibbeh", "Fresh herbs"],
  };
}
