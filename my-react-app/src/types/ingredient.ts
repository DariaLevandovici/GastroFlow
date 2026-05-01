export interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  category: string;
}

export interface IngredientFormDto {
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
  category: string;
}
