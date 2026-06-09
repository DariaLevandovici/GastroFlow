import { API_ENDPOINTS } from '../config/api';

export interface CreateReservationPayload {
  reservationDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  tableId?: number | null;
}

export interface ApiReservation {
  id: number;
  reservationDate: string;
  numberOfGuests: number;
  specialRequests: string;
  status: string;
  createdAt: string;
  clientId: number;
  clientName?: string;
  clientEmail?: string;
  tableId?: number;
  tableNumber?: number;
  tableCapacity?: number;
}

export interface ApiReservationTableBlock {
  id: number;
  reservationDate: string;
  numberOfGuests: number;
  status: string;
  clientId: number;
  isMine: boolean;
  clientName?: string;
  clientEmail?: string;
  tableId?: number;
  tableNumber?: number;
  tableCapacity?: number;
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
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }
  } catch {
    // Keep the friendly fallback when the API does not return JSON.
  }

  return fallback;
}

export async function createReservation(payload: CreateReservationPayload): Promise<ApiReservation> {
  const response = await fetch(API_ENDPOINTS.reservations, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Please sign in as a Client before making a reservation.');
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Could not create reservation. Please try again.'));
  }

  return response.json() as Promise<ApiReservation>;
}

export async function getReservations(): Promise<ApiReservation[]> {
  const response = await fetch(API_ENDPOINTS.reservations, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Could not load reservations.'));
  }

  const data = await response.json();
  return Array.isArray(data) ? data as ApiReservation[] : [];
}

export async function getReservationTableBlocks(date?: string): Promise<ApiReservationTableBlock[]> {
  const url = date
    ? `${API_ENDPOINTS.reservations}/table-blocks?date=${encodeURIComponent(date)}`
    : `${API_ENDPOINTS.reservations}/table-blocks`;

  const response = await fetch(url, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Could not load reservation blocks.'));
  }

  const data = await response.json();
  return Array.isArray(data) ? data as ApiReservationTableBlock[] : [];
}
