# Squelette — implémenté en S4 avec OR-Tools (CP-SAT solver de Google)
# Ce service résout le Travelling Salesman Problem (TSP) à partir
# d'une matrice de durées fournie par google_maps.py.

from typing import List


def solve_tsp(distance_matrix: List[List[int]]) -> List[int]:
    """
    Résout le TSP et retourne la liste des indices dans l'ordre optimal.

    Args:
        distance_matrix: matrice N×N de durées en secondes (symétrique ou asymétrique).

    Returns:
        Liste d'indices (ex: [0, 3, 1, 2]) représentant l'ordre optimal des stops.

    Implémenté en S4 avec OR-Tools.
    """
    raise NotImplementedError("solve_tsp sera implémenté en S4 avec OR-Tools")
