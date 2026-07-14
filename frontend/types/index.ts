export interface Stop {
  id: string;
  address: string;
  order: number;
  lat?: number;
  lng?: number;
  placeId?: string;
}

export interface Route {
  id: string;
  date: string;
  stops: Stop[];
}
