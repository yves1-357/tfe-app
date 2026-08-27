"""
Tests de validation Pydantic sur l'endpoint /optimize (schemas.py).

Couvre :
- ENF-09 (validation stricte des entrées : plages GPS, bornes de stops)
- RM-01 (nombre d'arrêts : minimum 2)
- RM-02 (structure d'un arrêt : latitude/longitude dans les plages valides)
- CT-05 (entrées invalides -> HTTP 422)

Ces tests appellent directement /optimize ; comme aucune clé Google réelle
n'est configurée en environnement de test, seule la validation Pydantic
(exécutée avant tout appel réseau externe) est exercée ici.
"""

VALID_STOP_A = {"address": "Bruxelles", "lat": 50.85, "lng": 4.35, "place_id": "a"}
VALID_STOP_B = {"address": "Namur", "lat": 50.46, "lng": 4.86, "place_id": "b"}


def test_optimize_rejects_single_stop(client):
    # RM-01 : au moins 2 arrêts requis.
    res = client.post("/optimize", json={"stops": [VALID_STOP_A]})
    assert res.status_code == 422


def test_optimize_rejects_too_many_stops(client):
    stops = [{**VALID_STOP_A, "place_id": str(i)} for i in range(17)]
    res = client.post("/optimize", json={"stops": stops})
    assert res.status_code == 422


def test_optimize_accepts_boundary_stop_count(client):
    # La borne haute acceptée par le backend (16 stops) ne doit pas être rejetée
    # par la validation Pydantic elle-même (un éventuel échec réseau derrière
    # renverrait 502, pas 422).
    stops = [{**VALID_STOP_A, "place_id": str(i)} for i in range(16)]
    res = client.post("/optimize", json={"stops": stops})
    assert res.status_code != 422


def test_optimize_rejects_latitude_out_of_range(client):
    # RM-02 / ENF-09 : -90 <= lat <= 90.
    bad_stop = {**VALID_STOP_A, "lat": 500.0}
    res = client.post("/optimize", json={"stops": [bad_stop, VALID_STOP_B]})
    assert res.status_code == 422
    detail = res.json()["detail"]
    assert any("Latitude" in str(err.get("msg", "")) for err in detail)


def test_optimize_rejects_longitude_out_of_range(client):
    # RM-02 / ENF-09 : -180 <= lng <= 180.
    bad_stop = {**VALID_STOP_A, "lng": -200.0}
    res = client.post("/optimize", json={"stops": [bad_stop, VALID_STOP_B]})
    assert res.status_code == 422
    detail = res.json()["detail"]
    assert any("Longitude" in str(err.get("msg", "")) for err in detail)


def test_optimize_rejects_missing_required_field(client):
    incomplete_stop = {"address": "Bruxelles", "lat": 50.85}  # lng manquant
    res = client.post("/optimize", json={"stops": [incomplete_stop, VALID_STOP_B]})
    assert res.status_code == 422


def test_register_rejects_invalid_email_format(client):
    # ENF-09 : format courriel RFC 5322 validé par Pydantic (EmailStr).
    res = client.post(
        "/auth/register",
        json={"name": "Yves", "email": "pas-un-email", "password": "motdepasse1"},
    )
    assert res.status_code == 422
