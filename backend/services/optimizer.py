from typing import List
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp


def solve_tsp(distance_matrix: List[List[int]]) -> List[int]:
    """
    Résout le TSP avec le solveur OR-Tools Routing Library.

    Args:
        distance_matrix: matrice N×N de durées en secondes.
            Peut être asymétrique (A→B ≠ B→A à cause des sens uniques).

    Returns:
        Liste d’indices dans l’ordre optimal (ex: [0, 3, 1, 2]).
        En cas d’échec du solver, retourne l’ordre original [0, 1, ..., N-1].
    """
    n = len(distance_matrix)

    if n <= 1:
        return list(range(n))

    # Gestionnaire de nœuds : N stops, 1 véhicule, dépôt au noeud 0
    manager = pywrapcp.RoutingIndexManager(n, 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index: int, to_index: int) -> int:
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]

    transit_idx = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_idx)

    # Paramètres de recherche :
    # - PATH_CHEAPEST_ARC : solution initiale rapide (greedy)
    # - GUIDED_LOCAL_SEARCH : amélioration locale (meta-heuristique)
    # - time_limit 2s : garantit une réponse rapide même pour N=25
    params = pywrapcp.DefaultRoutingSearchParameters()
    params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    params.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    params.time_limit.seconds = 2

    solution = routing.SolveWithParameters(params)

    if not solution:
        # Fallback : ordre original si le solver échoue
        return list(range(n))

    # Extraire l’ordre optimal depuis la solution
    index = routing.Start(0)
    route: List[int] = []
    while not routing.IsEnd(index):
        route.append(manager.IndexToNode(index))
        index = solution.Value(routing.NextVar(index))

    return route

