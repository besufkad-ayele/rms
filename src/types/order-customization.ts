export interface MenuExtraOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuIngredientOption {
  id: string;
  name: string;
  required: boolean;
}

export interface ItemCustomization {
  omittedIngredients: string[];
  selectedExtras: MenuExtraOption[];
  chefNote?: string;
}

export interface CartItemCustomization extends ItemCustomization {}
