# Squelette — implémenté en S4 avec la Routes API Google
# Ce service appellera l'API Routes de Google pour calculer
# la matrice de durées entre chaque paire de stops.

from typing import List
from schemas import StopIn


async def get_duration_matrix(stops: List[StopIn]) -> List[List[int]]:
    """
    Retourne une matrice N×N de durées en secondes entre chaque paire de stops.
    Utilise la Routes API de Google (computeRouteMatrix).
    Implémenté en S4.
    """
    raise NotImplementedError("get_duration_matrix sera implémenté en S4")


async def get_route_polyline(stops: List[StopIn]) -> str:
    """
    Retourne la polyline encodée du trajet dans l'ordre donné.
    Utilise la Routes API de Google (computeRoutes).
    Implémenté en S4.
    """
    raise NotImplementedError("get_route_polyline sera implémenté en S4")
