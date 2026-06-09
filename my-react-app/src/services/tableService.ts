import { API_ENDPOINTS } from '../config/api';

export interface ApiTable {
  id: number;
  tableNumber: number;
  capacity: number;
  isOccupied: boolean;
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getTables(): Promise<ApiTable[]> {
  const response = await fetch(API_ENDPOINTS.tables, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error('Could not load tables.');
  }

  const data = await response.json();
  return Array.isArray(data) ? data as ApiTable[] : [];
}
