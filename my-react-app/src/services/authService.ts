import { API_ENDPOINTS } from '../config/api';

export interface LoginResponse {
  token: string;
  role: string;
  roleId: number;
  firstName: string;
  lastName: string;
}

export interface RegisterClientPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

async function readErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (typeof data?.message === 'string') {
      return data.message;
    }
  } catch {
    return '';
  }

  return '';
}

export async function loginWithApi(email: string, password: string): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.authLogin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error('Server error');
  }

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('Invalid data');
    }

    if (response.status === 401) {
      throw new Error('Email or password is incorrect');
    }

    throw new Error('Server error');
  }

  return response.json() as Promise<LoginResponse>;
}

export async function registerClient(payload: RegisterClientPayload): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(API_ENDPOINTS.authRegister, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Server error');
  }

  if (!response.ok) {
    const backendMessage = await readErrorMessage(response);
    const looksLikeDuplicateEmail =
      response.status === 409 ||
      backendMessage.toLowerCase().includes('email already') ||
      backendMessage.toLowerCase().includes('already in use') ||
      backendMessage.toLowerCase().includes('already be in use');

    if (looksLikeDuplicateEmail) {
      throw new Error('Email already exists');
    }

    if (response.status === 400) {
      throw new Error('Invalid data');
    }

    throw new Error('Server error');
  }

  return response.json() as Promise<LoginResponse>;
}
