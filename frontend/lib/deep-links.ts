import { Stop } from '@/types';

/** Origin → destination unique (utilise dans TripMode) */
export function buildPointToPointUrl(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number }
): string {
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lng}`,
    destination: `${dest.lat},${dest.lng}`,
    travelmode: 'driving',
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Construit l'URL Google Maps pour naviguer via tous les stops.
 * Supporte origin + destination + waypoints (max 8 intermédiaires sans clé premium).
 */
export function buildGoogleMapsUrl(stops: Stop[]): string {
  if (stops.length < 2) return 'https://maps.google.com';

  const [origin, ...rest] = stops;
  const destination = rest[rest.length - 1];
  const intermediates = rest.slice(0, -1);

  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: 'driving',
  });

  if (intermediates.length > 0) {
    params.set('waypoints', intermediates.map(s => `${s.lat},${s.lng}`).join('|'));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Construit l'URL Waze vers le prochain arrêt.
 * Waze ne supporte qu'une seule destination à la fois.
 */
export function buildWazeUrl(nextStop: Stop): string {
  return `https://waze.com/ul?ll=${nextStop.lat},${nextStop.lng}&navigate=yes`;
}
