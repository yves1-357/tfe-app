export interface Stop {
  id: string;
  address: string;
  order: number;
  lat?: number;
  lng?: number;
  placeId?: string;
}

export interface OptimizeResponse {
  optimal_order: number[];
  total_duration_sec: number;
  total_distance_m: number;
  polyline_encoded: string | null;
}

export interface AuthUser {
  id: number;
  email: string;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface Route {
  id: string;
  date: string;
  stops: Stop[];
}

export interface SavedRouteStop {
  address: string;
  order: number;
  lat: number | null;
  lng: number | null;
}

export interface SavedRouteItem {
  id: number;
  name: string;
  created_at: string;
  total_duration_sec: number | null;
  total_distance_m: number | null;
  stops_json: SavedRouteStop[];
  optimized_order: number[];
}
