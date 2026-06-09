import type { Translations } from './translations';
import type { MenuItem } from '../services/menuService';

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function lookup(map: Record<string, string>, value: string, fallback = value) {
  return map[normalizeKey(value)] ?? fallback;
}

export function translateCategory(t: Translations, category: string) {
  const normalized = normalizeKey(category);
  const categories: Record<string, string> = {
    all: t.catalog.categories.all,
    breakfast: t.catalog.categories.breakfast,
    starters: t.catalog.categories.starters,
    vegan: t.catalog.categories.vegan,
    'main dishes': t.catalog.categories.mainDishes,
    desserts: t.catalog.categories.desserts,
    drinks: t.catalog.categories.drinks,
    menu: t.catalog.categories.menu,
  };

  return categories[normalized] ?? category;
}

export function translateDietary(t: Translations, value: string) {
  return lookup(t.catalog.dietary as unknown as Record<string, string>, value);
}

export function translateIngredient(t: Translations, value: string) {
  return lookup(t.catalog.ingredients as unknown as Record<string, string>, value);
}

export function translateProductName(t: Translations, value: string) {
  return lookup(t.catalog.productNames as unknown as Record<string, string>, value);
}

export function translateProductDescription(t: Translations, item: Pick<MenuItem, 'name' | 'description'>) {
  return lookup(t.catalog.productDescriptions as unknown as Record<string, string>, item.name, item.description);
}

export function getTranslatedMenuSearchText(t: Translations, item: MenuItem) {
  return [
    item.name,
    item.description,
    item.category,
    translateProductName(t, item.name),
    translateProductDescription(t, item),
    translateCategory(t, item.category),
    ...item.ingredients,
    ...item.ingredients.map((ingredient) => translateIngredient(t, ingredient)),
    ...item.dietary,
    ...item.dietary.map((diet) => translateDietary(t, diet)),
  ]
    .join(' ')
    .toLowerCase();
}
