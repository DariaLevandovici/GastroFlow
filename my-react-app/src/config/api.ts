
export const API_BASE_URL = 'http://localhost:5224';

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/api/Products`,
  ingredients: "http://localhost:5224/api/Ingredients",
} as const;
