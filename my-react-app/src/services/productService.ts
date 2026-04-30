import { API_ENDPOINTS } from '../config/api';
import type { Product, ProductFormDto } from '../types/product';

/** GET /api/Products */
export async function getProducts(): Promise<Product[]> {
  const response = await fetch(API_ENDPOINTS.products);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<Product[]>;
}

/** POST /api/Products */
export async function createProduct(dto: ProductFormDto): Promise<Product> {
  const response = await fetch(API_ENDPOINTS.products, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!response.ok) {
    throw new Error(`Failed to create product: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<Product>;
}

/** PUT /api/Products/{id} */
export async function updateProduct(id: number, dto: ProductFormDto): Promise<void> {
  const response = await fetch(`${API_ENDPOINTS.products}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...dto }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update product: ${response.status} ${response.statusText}`);
  }
}

/** DELETE /api/Products/{id} */
export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`${API_ENDPOINTS.products}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete product: ${response.status} ${response.statusText}`);
  }
}
