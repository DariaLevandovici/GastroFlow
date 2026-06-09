import { API_ENDPOINTS } from '../config/api';

export interface CreateOrderItemPayload {
  productId: number;
  quantity: number;
}

export interface CreateClientOrderPayload {
  orderType: 'Delivery' | 'Takeaway' | 'DineIn';
  deliveryAddress?: string | null;
  tableId?: number | null;
  items: CreateOrderItemPayload[];
}

export interface ApiOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface ApiOrder {
  id: number;
  createdAt: string;
  status: string;
  orderType: string;
  deliveryAddress?: string | null;
  clientId?: number;
  clientName?: string;
  waiterId?: number;
  waiterName?: string;
  tableId?: number;
  tableNumber?: number;
  totalAmount: number;
  isPaid: boolean;
  items: ApiOrderItem[];
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    if (data?.message && typeof data.message === 'string') return data.message;
    if (data?.error && typeof data.error === 'string') return data.error;
  } catch {
    // Keep the friendly fallback when the API does not return JSON.
  }

  return fallback;
}

export async function createOrder(payload: CreateClientOrderPayload, role?: string): Promise<ApiOrder> {
  const isStaffOrder = role === 'admin' || role === 'waiter';
  const endpoint = isStaffOrder ? `${API_ENDPOINTS.orders}/waiter` : `${API_ENDPOINTS.orders}/client`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error(isStaffOrder
      ? 'Please sign in as Waiter or Admin before placing an order.'
      : 'Please sign in as a Client before placing an order.');
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Could not place order. Please try again.'));
  }

  return response.json() as Promise<ApiOrder>;
}

export async function getOrders(): Promise<ApiOrder[]> {
  const response = await fetch(API_ENDPOINTS.orders, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Could not load orders.'));
  }

  const data = await response.json();
  return Array.isArray(data) ? data as ApiOrder[] : [];
}

export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  const response = await fetch(`${API_ENDPOINTS.orders}/${orderId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Please sign in with a staff account to update order status.');
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Could not update order status.'));
  }
}

export function createClientOrder(payload: CreateClientOrderPayload): Promise<ApiOrder> {
  return createOrder(payload, 'client');
}

export async function updateOrderPayment(orderId: number, isPaid: boolean): Promise<void> {
  const response = await fetch(`${API_ENDPOINTS.orders}/${orderId}/payment`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(isPaid),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Please sign in as Waiter or Admin to close the bill.');
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Could not close the bill.'));
  }
}
