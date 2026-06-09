import { API_ENDPOINTS } from '../config/api';
import type { Product } from '../types/product';

export interface AdminCategory {
  id: number;
  name: string;
  description?: string;
}

export interface AdminOrder {
  id: number | string;
  createdAt?: string;
  status?: string;
  clientName?: string | null;
  tableNumber?: number | null;
  totalAmount?: number;
  total?: number;
}

export interface AdminUser {
  id: number | string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface AdminReservation {
  id: number | string;
  reservationDate?: string;
  numberOfGuests?: number;
  specialRequests?: string;
  status?: string;
  createdAt?: string;
  clientName?: string | null;
  clientEmail?: string | null;
  tableId?: number | null;
  tableNumber?: number | null;
  tableCapacity?: number | null;
}

function getAuthHeaders(): HeadersInit | undefined {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

async function fetchArray<T>(url: string, withAuth = false): Promise<T[]> {
  const response = await fetch(url, {
    headers: withAuth ? getAuthHeaders() : undefined,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data as T[] : [];
}

export function getAdminProducts() {
  return fetchArray<Product>(API_ENDPOINTS.products);
}

export function getAdminCategories() {
  return fetchArray<AdminCategory>(API_ENDPOINTS.categories);
}

export function getAdminOrders() {
  return fetchArray<AdminOrder>(API_ENDPOINTS.orders, true);
}

export function getAdminReservations() {
  return fetchArray<AdminReservation>(API_ENDPOINTS.reservations, true);
}

export function getAdminUsers() {
  return fetchArray<AdminUser>(API_ENDPOINTS.users, true);
}
