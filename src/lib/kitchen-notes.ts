import { ItemCustomization } from "@/types/order-customization";

export function formatKitchenNotes(customization?: ItemCustomization | null): string {
  if (!customization) return "";

  const parts: string[] = [];
  if (customization.omittedIngredients.length > 0) {
    parts.push(`No: ${customization.omittedIngredients.join(", ")}`);
  }
  if (customization.selectedExtras.length > 0) {
    parts.push(
      `Extras: ${customization.selectedExtras.map((e) => `${e.name} (+${e.price})`).join(", ")}`
    );
  }
  if (customization.chefNote?.trim()) {
    parts.push(`Note: ${customization.chefNote.trim()}`);
  }
  return parts.join(" | ");
}

export function extrasTotal(customization?: ItemCustomization | null): number {
  if (!customization?.selectedExtras?.length) return 0;
  return customization.selectedExtras.reduce((sum, e) => sum + Number(e.price || 0), 0);
}
