import { AuthTokenResponse, AuthUser } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const AUTH_TOKEN_KEY = 'nextstop_auth_token';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function parseErrorDetail(payload: unknown, fallback: string): string {
  if (typeof payload !== 'object' || payload === null) return fallback;
  const { detail } = payload as { detail?: unknown };
  if (typeof detail === 'string') return detail;
  // Pydantic 422 returns detail as an array of {msg, loc}
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string };
    if (typeof first.msg === 'string') {
      // strip the "Value error, " prefix Pydantic adds
      return first.msg.replace(/^Value error,\s*/i, '');
    }
  }
  return fallback;
}

async function parseJsonOrNull(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function hasAuthToken(): boolean {
  return !!getAuthToken();
}

export function setAuthToken(token: string): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const payload = await parseJsonOrNull(response);
  if (!response.ok) {
    throw new Error(parseErrorDetail(payload, 'Registration failed'));
  }

  return payload as AuthUser;
}

export async function loginUser(email: string, password: string): Promise<AuthTokenResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const payload = await parseJsonOrNull(response);
  if (!response.ok) {
    throw new Error(parseErrorDetail(payload, 'Login failed'));
  }

  const tokenPayload = payload as AuthTokenResponse;
  setAuthToken(tokenPayload.access_token);
  return tokenPayload;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No auth token found');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseJsonOrNull(response);

  if (response.status === 401) {
    clearAuthToken();
    throw new Error('Session expired, please login again');
  }

  if (!response.ok) {
    throw new Error(parseErrorDetail(payload, 'Failed to load profile'));
  }

  return payload as AuthUser;
}

export async function deleteCurrentUser(): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No auth token found');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseJsonOrNull(response);
  if (!response.ok) {
    throw new Error(parseErrorDetail(payload, 'Failed to delete account'));
  }

  clearAuthToken();
}

export function logoutUser(): void {
  clearAuthToken();
}
