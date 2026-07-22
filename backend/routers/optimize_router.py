from fastapi import APIRouter, HTTPException
from schemas import OptimizeRequest, OptimizeResponse
from services import google_maps
from services import optimizer

router = APIRouter(prefix="/optimize", tags=["optimize"])


@router.post("", response_model=OptimizeResponse)
async def optimize_route(req: OptimizeRequest):
    """
    Optimise l'ordre des stops via l'algorithme TSP (OR-Tools).
    Nécessite au minimum 2 stops et au maximum 25 stops.

    Flow :
    1. Calcule la matrice N×N de durées via Google Routes API
    2. Résout le TSP avec OR-Tools (Guided Local Search, 2s limit)
    3. Récupère la polyline et les totaux via Google Routes API
    """
    # Étape 1 : matrice de durées
    try:
        matrix = await google_maps.get_duration_matrix(req.stops)
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Erreur Routes API (matrice de durées) : {e}",
        )

    # Étape 2 : résolution TSP
    optimal_order = optimizer.solve_tsp(matrix)

    # Étape 3 : polyline + totaux pour l’ordre optimal
    ordered_stops = [req.stops[i] for i in optimal_order]
    try:
        polyline, total_duration, total_distance = await google_maps.get_route_polyline(
            ordered_stops
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Erreur Routes API (polyline) : {e}",
        )

    return OptimizeResponse(
        optimal_order=optimal_order,
        total_duration_sec=total_duration,
        total_distance_m=total_distance,
        polyline_encoded=polyline,
    )
