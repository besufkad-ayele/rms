export interface MenuItemData {
  id: string;
  name: string;
  amharicName?: string;
  category: "starters" | "mains" | "beverages" | "desserts" | "specials";
  description: string;
  price: number;
  photoUrl: string;
  isAvailable: boolean;
  status: "available" | "limited" | "sold_out";
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isChefSpecial?: boolean;
  preparationMinutes: number;
  calories?: number;
  ingredients: string[];
}

export interface TableInfo {
  code: string;
  displayNumber: number;
  capacity: number;
  section: string;
  serverName: string;
  serverPhoto?: string;
}

export const RESTAURANT_INFO = {
  name: "Keren Addis",
  amharicName: "ከረን አዲስ",
  tagline: "Artisan Ethiopian Gastronomy & Living Hospitality",
  description:
    "An elevated homage to ancient Ethiopian culinary traditions reimagined with contemporary culinary mastery, wood-fired hearth cooking, and legendary highland warmth in the heart of Addis Ababa.",
  address: "Keren Addis, Cape Verde Street, Addis Ababa, Ethiopia",
  latitude: 9.0611313959925,
  longitude: 38.762250376615036,
  phone: "+251 911 234 567",
  email: "reservations@kerenaddis.et",
  googleBusinessUrl: "https://www.google.com/maps/search/?api=1&query=9.0611313959925,38.762250376615036",
  cbeAccount: {
    bankName: "Commercial Bank of Ethiopia (CBE)",
    accountName: "KEREN ADDIS RESTAURANT & LOUNGE PLC",
    accountNumber: "1000 4829 1948 2",
    branch: "Keren Addis Branch",
  },
  openingHours: [
    { day: "Monday – Thursday", hours: "11:30 AM – 11:00 PM" },
    { day: "Friday – Saturday", hours: "11:30 AM – 01:00 AM" },
    { day: "Sunday", hours: "10:00 AM – 10:30 PM (Brunch & Dinner)" },
  ],
};

export const MENU_CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "starters", label: "Starters & Bites" },
  { id: "mains", label: "Heritage Mains" },
  { id: "specials", label: "Chef's Hearth Specials" },
  { id: "beverages", label: "Beverages & Tej" },
  { id: "desserts", label: "Sweets & Pastries" },
] as const;

export const MENU_ITEMS: MenuItemData[] = [
  {
    id: "dish-01",
    name: "Special Sizzling Awaze Tibs",
    amharicName: "ልዩ አዋዜ ጥብስ",
    category: "mains",
    description:
      "Tender prime beef tenderloin pan-seared in spiced clarified butter (niter kibbeh), infused with rosemary sprigs, garlic, shallots, and fiery stone-ground awaze sauce on a sizzling cast-iron skillet.",
    price: 520,
    photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    status: "available",
    isSpicy: true,
    isChefSpecial: true,
    preparationMinutes: 14,
    ingredients: ["Prime Beef Tenderloin", "Niter Kibbeh", "House Awaze", "Fresh Rosemary", "Shallots", "Jalapeño"],
  },
  {
    id: "dish-02",
    name: "Royal Doro Wat Feast",
    amharicName: "የበዓል ዶሮ ወጥ",
    category: "mains",
    description:
      "Slow-simmered for 8 hours with caramelized red onions, rich berbere spice blend, tender chicken drumstick, hard-boiled farm egg, and homemade ayib cheese accompaniment.",
    price: 580,
    photoUrl: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    status: "available",
    isSpicy: true,
    isChefSpecial: true,
    preparationMinutes: 18,
    ingredients: ["Free-Range Chicken", "Aged Berbere", "Slow-Caramelized Onions", "Farm Egg", "Fresh Ayib"],
  },
  {
    id: "dish-03",
    name: "Yetsom Beyaynetu (Fasting Platter)",
    amharicName: "የጾም በያይነቱ",
    category: "mains",
    description:
      "A vibrant rainbow sampler of Misir Wat (red lentils), Kik Alicha (yellow split peas), Gomen (collard greens), Shiro Tagamino, Atkilt Wot, and beet salad served on freshly baked 100% pure teff injera.",
    price: 440,
    photoUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    status: "available",
    isVegetarian: true,
    isGlutenFree: true,
    preparationMinutes: 10,
    ingredients: ["Split Red Lentils", "Yellow Split Peas", "Organic Collard Greens", "Claypot Shiro", "Teff Injera"],
  },
  {
    id: "dish-04",
    name: "Gourmet Kereyu Kitfo Royale",
    amharicName: "ክብርት ክትፎ",
    category: "specials",
    description:
      "Minced lean top-round beef warmed in fragrant cardamom-infused niter kibbeh and hot mitmita chili, accompanied by house-made ayib curd and seasoned gomen kitfo.",
    price: 640,
    photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    status: "available",
    isSpicy: true,
    isChefSpecial: true,
    preparationMinutes: 12,
    ingredients: ["Fresh Minced Beef", "Korerima Cardamom", "Niter Kibbeh", "Mitmita Chili", "Gomen", "Ayib"],
  },
  {
    id: "dish-05",
    name: "Crispy Lentil & Beef Sambusa Trio",
    amharicName: "ሳምቡሳ ጥንድ",
    category: "starters",
    description:
      "Golden hand-rolled pastry triangles filled with spiced brown lentils, minced lamb, minced green chili, and cumin, served with sweet tomato-chili dip.",
    price: 220,
    photoUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    status: "available",
    isSpicy: false,
    preparationMinutes: 8,
    ingredients: ["Handmade Pastry", "Brown Lentils", "Cumin & Coriander", "Fresh Herbs", "House Dip"],
  },
  {
    id: "dish-06",
    name: "Claypot Sizzling Shiro Misto",
    amharicName: "ሽሮ ሚስቶ በሸክላ",
    category: "mains",
    description:
      "Creamy, bubbling sun-dried chickpea flour stew enriched with diced beef cubes, spiced clarified butter, and whole jalapeño peppers cooked inside traditional Ethiopian red clayware.",
    price: 360,
    photoUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    status: "available",
    isSpicy: false,
    preparationMinutes: 12,
    ingredients: ["Sun-Dried Chickpea Flour", "Beef Cubes", "Garlic & Ginger", "Niter Kibbeh", "Red Clay Pot"],
  },
  {
    id: "dish-07",
    name: "Keren Sheba Honey Tej (Decanter)",
    amharicName: "የሸባ ንብ ጠጅ",
    category: "beverages",
    description:
      "Traditional Ethiopian golden mead naturally fermented with pure highland raw forest honey and gesho hops. Balanced floral sweetness with a dry wine-like finish.",
    price: 320,
    photoUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    status: "available",
    isChefSpecial: true,
    preparationMinutes: 3,
    ingredients: ["Wild Highland Honey", "Gesho (Rhamnus prinoides)", "Spring Water", "Natural Yeast"],
  },
  {
    id: "dish-08",
    name: "Single-Origin Yirgacheffe Pour-Over",
    amharicName: "ይርጋጨፌ ቡና",
    category: "beverages",
    description:
      "Freshly roasted specialty Yirgacheffe beans with notes of jasmine blossom, bergamot citrus, and honey. Brewed tableside and served with frankincense smoke & roasted barley (kolo).",
    price: 160,
    photoUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    status: "available",
    preparationMinutes: 6,
    ingredients: ["100% Grade 1 Yirgacheffe Beans", "Pure Mineral Water", "Frankincense Resin", "Spiced Kolo"],
  },
  {
    id: "dish-09",
    name: "Spiced Cardamom & Honey Baklava",
    amharicName: "ባቅላቫ በቅመም",
    category: "desserts",
    description:
      "Crisp flaky phyllo pastry layered with crushed pistachios, Ethiopian korerima cardamom, and drenched in fragrant orange-blossom highland honey syrup.",
    price: 240,
    photoUrl: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    status: "available",
    isVegetarian: true,
    preparationMinutes: 5,
    ingredients: ["Phyllo Layers", "Pistachio & Almonds", "Highland Honey", "Korerima Cardamom", "Rosewater"],
  },
  {
    id: "dish-10",
    name: "Wood-Fired Lamb Derek Tibs",
    amharicName: "ደረቅ የበግ ጥብስ",
    category: "specials",
    description:
      "Charred prime mutton crisped over open acacia coals, seasoned with kosher sea salt, roasted rosemary sprigs, and served alongside spicy awaze and mitmita.",
    price: 590,
    photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
    status: "limited",
    isSpicy: true,
    preparationMinutes: 16,
    ingredients: ["Acacia-Smoked Lamb", "Sea Salt", "Fresh Rosemary", "Awaze Paste", "Fresh Inset"],
  },
];

export const MOCK_TABLES: Record<string, TableInfo> = {
  "T-01": { code: "T-01", displayNumber: 1, capacity: 2, section: "Terrace Garden", serverName: "Sara Mengistu" },
  "T-02": { code: "T-02", displayNumber: 2, capacity: 4, section: "Terrace Garden", serverName: "Sara Mengistu" },
  "T-03": { code: "T-03", displayNumber: 3, capacity: 4, section: "Main Dining Hall", serverName: "Michael Tadesse" },
  "T-04": { code: "T-04", displayNumber: 4, capacity: 4, section: "Main Dining Hall", serverName: "Michael Tadesse" },
  "T-05": { code: "T-05", displayNumber: 5, capacity: 6, section: "Main Dining Hall", serverName: "Michael Tadesse" },
  "T-06": { code: "T-06", displayNumber: 6, capacity: 2, section: "Lounge & Bar", serverName: "Eden Haile" },
  "T-07": { code: "T-07", displayNumber: 7, capacity: 4, section: "Lounge & Bar", serverName: "Eden Haile" },
  "T-08": { code: "T-08", displayNumber: 8, capacity: 8, section: "Private VIP Alcove", serverName: "Dawit Bekele" },
  "T-09": { code: "T-09", displayNumber: 9, capacity: 4, section: "Main Dining Hall", serverName: "Michael Tadesse" },
  "T-10": { code: "T-10", displayNumber: 10, capacity: 2, section: "Courtyard Hearth", serverName: "Sara Mengistu" },
};

export function getTableDetails(code: string): TableInfo {
  const normalized = code.toUpperCase();
  if (MOCK_TABLES[normalized]) {
    return MOCK_TABLES[normalized];
  }
  // Fallback for any other table number
  const numMatch = normalized.replace(/\D/g, "") || "4";
  const num = parseInt(numMatch, 10) || 4;
  return {
    code: `T-${num.toString().padStart(2, "0")}`,
    displayNumber: num,
    capacity: 4,
    section: "Main Dining Room",
    serverName: "Michael Tadesse",
  };
}
