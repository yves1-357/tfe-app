export interface Stop {
  id: string;
  address: string;
  order: number;
}

export interface Route {
  id: string;
  date: string;
  stops: Stop[];
}
