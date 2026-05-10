export const API_BASE_URL = 'http://localhost:5224';

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/api/Products`,
  ingredients: `${API_BASE_URL}/api/Ingredients`,
  images: `${API_BASE_URL}/api/Images`,
  addresses: `${API_BASE_URL}/api/Address`,
} as const;