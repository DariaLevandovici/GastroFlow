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
  role?: string | number;
}

export interface CreateStaffAccountPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'Waiter' | 'Cook' | 'Manager' | 'Admin';
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

async function readErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.error === 'string') return data.error;
  } catch {
    return '';
  }

  return '';
}

export async function createStaffAccount(payload: CreateStaffAccountPayload): Promise<AdminUser> {
  const authHeaders = getAuthHeaders() ?? {};
  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.users, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Server error');
  }

  if (!response.ok) {
    const backendMessage = await readErrorMessage(response);
    const normalizedMessage = backendMessage.toLowerCase();

    if (response.status === 409 || normalizedMessage.includes('email already')) {
      throw new Error('Email already exists.');
    }

    if (response.status === 400) {
      throw new Error('Invalid data.');
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('Access denied.');
    }

    throw new Error('Server error');
  }

  return response.json() as Promise<AdminUser>;
}
