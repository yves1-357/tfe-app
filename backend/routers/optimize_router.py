from fastapi import APIRouter, HTTPException
from schemas import OptimizeRequest, OptimizeResponse

router = APIRouter(prefix="/optimize", tags=["optimize"])


@router.post("", response_model=OptimizeResponse)
async def optimize_route(req: OptimizeRequest):
    """
    Optimise l'ordre des stops via l'algorithme TSP (OR-Tools).
    Nécessite au minimum 2 stops et au maximum 25 stops.

    Implémenté en S4 : matrice de distances (Routes API) + solveur OR-Tools.
    """
    # TODO S4 : matrix = await google_maps.get_duration_matrix(req.stops)
    # TODO S4 : optimal_order = optimizer.solve_tsp(matrix)
    # TODO S4 : polyline = await google_maps.get_route_polyline(ordered_stops)
    raise HTTPException(
        status_code=501,
        detail="L'endpoint /optimize sera implémenté en semaine 4 (OR-Tools + Routes API)"
    )
