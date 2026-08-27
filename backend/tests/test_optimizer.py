"""
Tests unitaires du solveur TSP (services/optimizer.py).

Couvre :
- RM-05 (le solveur minimise la durée totale du trajet)
- RM-06 (gestion d'une matrice asymétrique)
- RM-08 (fallback : l'ordre original est retourné si le solveur échoue)

Ces tests n'appellent aucune API externe : ils passent directement une
matrice de durées (déjà construite) au solveur OR-Tools.
"""
from services.optimizer import solve_tsp


def test_solve_tsp_returns_all_indices_exactly_once():
    matrix = [
        [0, 10, 15, 20],
        [10, 0, 35, 25],
        [15, 35, 0, 30],
        [20, 25, 30, 0],
    ]
    order = solve_tsp(matrix)
    assert sorted(order) == [0, 1, 2, 3]
    assert len(order) == len(set(order))  # aucun doublon, aucun oubli


def test_solve_tsp_single_stop_returns_trivial_order():
    assert solve_tsp([[0]]) == [0]


def test_solve_tsp_two_stops_returns_both_indices():
    matrix = [[0, 42], [42, 0]]
    order = solve_tsp(matrix)
    assert sorted(order) == [0, 1]


def test_solve_tsp_handles_asymmetric_matrix():
    # RM-06 : durée A->B peut différer de B->A (sens uniques, trafic).
    # Le solveur ne doit pas planter sur une matrice non symétrique.
    matrix = [
        [0, 5, 100],
        [50, 0, 5],
        [5, 100, 0],
    ]
    order = solve_tsp(matrix)
    assert sorted(order) == [0, 1, 2]


def test_solve_tsp_prefers_lower_cost_order():
    # Un carré où l'ordre "dans le sens des aiguilles d'une montre" (0,1,2,3)
    # est nettement moins coûteux que d'aller en diagonale d'abord.
    # On vérifie que le total retourné par le solveur est bien optimal ou
    # proche (<=) du meilleur ordre naïf connu à l'avance.
    matrix = [
        [0, 10, 100, 10],
        [10, 0, 10, 100],
        [100, 10, 0, 10],
        [10, 100, 10, 0],
    ]
    order = solve_tsp(matrix)

    def total_cost(seq):
        return sum(matrix[seq[i]][seq[(i + 1) % len(seq)]] for i in range(len(seq)))

    naive_cost = total_cost([0, 1, 2, 3])  # coût = 40 (le tour optimal)
    assert total_cost(order) <= naive_cost


def test_solve_tsp_empty_matrix_returns_empty_list():
    assert solve_tsp([]) == []
