import { API_ENDPOINTS } from '../config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Raw shape returned by GET /api/Products.
 * Ingredients and Dietary are JSON array strings (e.g. '["eggs","bacon"]').
 */
interface BackendProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  ingredients: string; // JSON array string from backend
  dietary: string;     // JSON array string from backend
}

/**
 * The MenuItem shape used throughout the UI.
 * Ingredients and dietary are already parsed to string[].
 */
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  ingredients: string[];
  dietary: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Safely parse a JSON array string into string[]. Returns [] on any error. */
function safeParseArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

/** Map a raw backend product to the richer MenuItem shape used by the UI. */
function mapToMenuItem(p: BackendProduct): MenuItem {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    price: p.price,
    category: p.category || 'Menu',
    image: p.image || '',
    ingredients: safeParseArray(p.ingredients),
    dietary: safeParseArray(p.dietary),
  };
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Fetches all products from the real backend.
 * GET http://localhost:5224/api/Products
 */
export async function getMenuItems(): Promise<MenuItem[]> {
  const response = await fetch(API_ENDPOINTS.products);
  if (!response.ok) {
    throw new Error(`Backend error: ${response.status} ${response.statusText}`);
  }
  const products: BackendProduct[] = await response.json();
  return products.map(mapToMenuItem);
}

/**
 * Returns the distinct categories present in the fetched products.
 */
export async function getMenuCategories(): Promise<string[]> {
  const items = await getMenuItems();
  const categoryOrder = ['Breakfast', 'Starters', 'Vegan', 'Main Dishes', 'Desserts', 'Drinks'];
  const present = new Set(items.map((i) => i.category));
  // Return in the canonical order if found, otherwise append unknown categories
  const ordered = categoryOrder.filter((c) => present.has(c));
  const extra = Array.from(present).filter((c) => !categoryOrder.includes(c));
  return [...ordered, ...extra];
}

/**
 * Returns the first `limit` products — used by home-page featured sections.
 */
export async function getFeaturedItems(limit = 8): Promise<MenuItem[]> {
  const items = await getMenuItems();
  return items.slice(0, limit);
}

