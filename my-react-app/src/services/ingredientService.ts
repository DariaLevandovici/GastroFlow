import { API_ENDPOINTS } from '../config/api';
import type { Ingredient, IngredientFormDto } from '../types/ingredient';

/** GET /api/Ingredients */
export async function getIngredients(): Promise<Ingredient[]> {
  const response = await fetch(API_ENDPOINTS.ingredients);
  if (!response.ok) {
    throw new Error(`Failed to fetch ingredients: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<Ingredient[]>;
}

/** POST /api/Ingredients */
export async function createIngredient(dto: IngredientFormDto): Promise<Ingredient> {
  const response = await fetch(API_ENDPOINTS.ingredients, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    throw new Error(`Failed to create ingredient: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<Ingredient>;
}

/** PUT /api/Ingredients/{id} */
export async function updateIngredient(id: number, dto: IngredientFormDto): Promise<void> {
  const response = await fetch(`${API_ENDPOINTS.ingredients}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...dto }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update ingredient: ${response.status} ${response.statusText}`);
  }
}

/** DELETE /api/Ingredients/{id} */
export async function deleteIngredient(id: number): Promise<void> {
  const response = await fetch(`${API_ENDPOINTS.ingredients}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete ingredient: ${response.status} ${response.statusText}`);
  }
}
