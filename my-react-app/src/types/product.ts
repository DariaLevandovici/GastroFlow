export interface ProductIngredient {
  ingredientId: number;
  ingredientName?: string;
  amountNeeded: number;
  unit?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  ingredients: string; // Legacy
  dietary: string;     // Legacy
  productIngredients: ProductIngredient[];
}

/** DTO for create/update — same fields minus id */
export interface ProductFormDto {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  ingredients: string; 
  dietary: string;     
  productIngredients: ProductIngredient[];
}
