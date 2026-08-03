import { Stop, OptimizeResponse, SavedRouteItem } from '@/types';
import { getAuthToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function optimizeRoute(stops: Stop[]): Promise<OptimizeResponse> {
  const res = await fetch(`${API_URL}/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stops: stops.map(s => ({
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        place_id: s.placeId ?? null,
      })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export async function saveRoute(payload: {
  name: string;
  stops: Stop[];
  optimized_order: number[];
  total_duration_sec?: number;
  total_distance_m?: number;
}): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/routes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      name: payload.name,
      stops: payload.stops.map(s => ({ address: s.address, order: s.order, lat: s.lat ?? null, lng: s.lng ?? null })),
      optimized_order: payload.optimized_order,
      total_duration_sec: payload.total_duration_sec ?? null,
      total_distance_m: payload.total_distance_m ?? null,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
}

export async function getSavedRoutes(): Promise<SavedRouteItem[]> {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/routes`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteSavedRoute(id: number): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_URL}/routes/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
}
