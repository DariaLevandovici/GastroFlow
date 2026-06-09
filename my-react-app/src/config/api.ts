export const API_BASE_URL = 'http://localhost:5224';

export const API_ENDPOINTS = {
  authLogin: `${API_BASE_URL}/api/Auth/login`,
  authRegister: `${API_BASE_URL}/api/Auth/register`,
  products: `${API_BASE_URL}/api/Products`,
  categories: `${API_BASE_URL}/api/Categories`,
  ingredients: `${API_BASE_URL}/api/Ingredients`,
  images: `${API_BASE_URL}/api/Images`,
  addresses: `${API_BASE_URL}/api/Address`,
  orders: `${API_BASE_URL}/api/Orders`,
  reservations: `${API_BASE_URL}/api/Reservations`,
  tables: `${API_BASE_URL}/api/Tables`,
  users: `${API_BASE_URL}/api/Users`,
} as const;
