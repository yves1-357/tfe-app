import logging
import re
import asyncio
import httpx
from typing import List, Tuple
from config import GOOGLE_MAPS_API_KEY
from schemas import StopIn

logger = logging.getLogger(__name__)

ROUTES_API_BASE = "https://routes.googleapis.com"
_SEMAPHORE_SIZE = 10


def _parse_seconds(duration_str: str) -> int:
    """Parse la durée Google API (ex: '523s', '1234.5s') en entier secondes."""
    match = re.match(r"^(\d+(?:\.\d+)?)s$", duration_str)
    return int(float(match.group(1))) if match else 0


async def _single_route_duration(
    client: httpx.AsyncClient,
    sem: asyncio.Semaphore,
    origin: StopIn,
    destination: StopIn,
) -> int:
    """Retourne la durée en secondes entre origin et destination."""
    async with sem:
        payload = {
            "origin": {"location": {"latLng": {"latitude": origin.lat, "longitude": origin.lng}}},
            "destination": {"location": {"latLng": {"latitude": destination.lat, "longitude": destination.lng}}},
            "travelMode": "DRIVE",
        }
        headers = {
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": "routes.duration",
        }
        try:
            r = await client.post(
                f"{ROUTES_API_BASE}/directions/v2:computeRoutes",
                json=payload,
                headers=headers,
            )
            r.raise_for_status()
            routes = r.json().get("routes", [])
            if routes:
                return _parse_seconds(routes[0].get("duration", "0s"))
            # Réponse 200 mais sans itinéraire trouvé par Google (ex: pas de route
            # routière possible entre les deux points) comportement inchangé
            # (999_999), seule la visibilité change.
            logger.warning(
                "Routes API: aucune route trouvée entre (%.5f,%.5f) et (%.5f,%.5f)",
                origin.lat, origin.lng, destination.lat, destination.lng,
            )
        except Exception as exc:
            # Comportement inchangé (fallback 999_999 pour ne pas faire échouer
            # toute la matrice sur une seule paire) — on journalise simplement
            # la cause pour pouvoir diagnostiquer un incident après coup.
            logger.warning(
                "Routes API: échec pour (%.5f,%.5f) -> (%.5f,%.5f): %s",
                origin.lat, origin.lng, destination.lat, destination.lng, exc,
            )
        return 999_999


async def get_duration_matrix(stops: List[StopIn]) -> List[List[int]]:
    """
    Construit la matrice N×N de durées (secondes) via N×(N-1) appels
    parallèles à computeRoutes, limités à _SEMAPHORE_SIZE concurrents.
    La diagonale vaut 0.
    """
    n = len(stops)
    matrix = [[0] * n for _ in range(n)]
    pairs = [(i, j) for i in range(n) for j in range(n) if i != j]

    sem = asyncio.Semaphore(_SEMAPHORE_SIZE)
    async with httpx.AsyncClient(timeout=20.0) as client:
        results = await asyncio.gather(
            *[_single_route_duration(client, sem, stops[i], stops[j]) for i, j in pairs]
        )

    for (i, j), duration in zip(pairs, results):
        matrix[i][j] = duration

    return matrix


async def get_route_polyline( #Appelle computeroutes pour recuper durée total et distance pyline 
    stops: List[StopIn],
) -> Tuple[str, int, int]:
    """
    Appelle computeRoutes (Routes API v2) pour le trajet complet dans l’ordre donné.
    Retourne (polyline_encoded, total_duration_sec, total_distance_m).
    """
    if len(stops) < 2:
        return "", 0, 0

    origin = stops[0]
    destination = stops[-1]
    intermediates = stops[1:-1]

    payload: dict = {
        "origin": {"location": {"latLng": {"latitude": origin.lat, "longitude": origin.lng}}},
        "destination": {"location": {"latLng": {"latitude": destination.lat, "longitude": destination.lng}}},
        "travelMode": "DRIVE",
    }
    if intermediates:
        payload["intermediates"] = [
            {"location": {"latLng": {"latitude": s.lat, "longitude": s.lng}}}
            for s in intermediates
        ]

    headers = {
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{ROUTES_API_BASE}/directions/v2:computeRoutes",
            json=payload,
            headers=headers,
        )
        response.raise_for_status()
        data = response.json()

    routes = data.get("routes", [])
    if not routes:
        return "", 0, 0

    route = routes[0]
    polyline = route.get("polyline", {}).get("encodedPolyline", "")
    duration_sec = _parse_seconds(route.get("duration", "0s"))
    distance_m = route.get("distanceMeters", 0)

    return polyline, duration_sec, distance_m

