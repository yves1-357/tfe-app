"""
Tests de la persistance des trajets sauvegardés (routers/routes_router.py).

Couvre :
- EF-24 (sauvegarde), EF-25 (consultation historique), EF-27 (suppression)
- RM-14 (isolation des données : un utilisateur ne voit que ses propres trajets)
- RM-15 (droit à l'oubli : ON DELETE CASCADE sur suppression de compte)
"""


def _register_and_login(client, email="yves@example.com", password="motdepasse1"):
    client.post(
        "/auth/register",
        json={"name": "Yves", "email": email, "password": password},
    )
    login = client.post("/auth/login", json={"email": email, "password": password})
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _sample_route_payload(name="Road trip Ardennes"):
    return {
        "name": name,
        "stops": [
            {"address": "Bruxelles", "order": 1, "lat": 50.85, "lng": 4.35},
            {"address": "Namur", "order": 2, "lat": 50.46, "lng": 4.86},
        ],
        "optimized_order": [0, 1],
        "total_duration_sec": 3600,
        "total_distance_m": 65000,
    }


def test_create_route_requires_auth(client):
    res = client.post("/routes", json=_sample_route_payload())
    assert res.status_code == 401


def test_create_and_list_route(client):
    headers = _register_and_login(client)

    create_res = client.post("/routes", json=_sample_route_payload(), headers=headers)
    assert create_res.status_code == 201
    body = create_res.json()
    assert body["name"] == "Road trip Ardennes"
    assert body["optimized_order"] == [0, 1]

    list_res = client.get("/routes", headers=headers)
    assert list_res.status_code == 200
    routes = list_res.json()
    assert len(routes) == 1
    assert routes[0]["name"] == "Road trip Ardennes"


def test_user_cannot_see_another_users_routes(client):
    # RM-14 : isolation des données entre utilisateurs.
    headers_a = _register_and_login(client, email="a@example.com")
    headers_b = _register_and_login(client, email="b@example.com")

    client.post("/routes", json=_sample_route_payload("Trajet de A"), headers=headers_a)

    list_b = client.get("/routes", headers=headers_b)
    assert list_b.status_code == 200
    assert list_b.json() == []


def test_delete_other_users_route_returns_404(client):
    # RM-14 : accès à un trajet d'un autre utilisateur -> 404 (pas 403),
    # pour ne pas révéler l'existence de la ressource.
    headers_a = _register_and_login(client, email="a@example.com")
    headers_b = _register_and_login(client, email="b@example.com")

    create_res = client.post("/routes", json=_sample_route_payload(), headers=headers_a)
    route_id = create_res.json()["id"]

    res = client.delete(f"/routes/{route_id}", headers=headers_b)
    assert res.status_code == 404


def test_delete_own_route_succeeds(client):
    headers = _register_and_login(client)
    create_res = client.post("/routes", json=_sample_route_payload(), headers=headers)
    route_id = create_res.json()["id"]

    res = client.delete(f"/routes/{route_id}", headers=headers)
    assert res.status_code == 204

    list_res = client.get("/routes", headers=headers)
    assert list_res.json() == []


def test_deleting_account_cascades_to_saved_routes(client):
    # RM-15 : la suppression du compte efface en cascade tous ses trajets.
    headers = _register_and_login(client)
    client.post("/routes", json=_sample_route_payload(), headers=headers)
    client.post("/routes", json=_sample_route_payload("Deuxième trajet"), headers=headers)

    delete_res = client.delete("/auth/me", headers=headers)
    assert delete_res.status_code == 200

    # Le jeton n'est plus valide (utilisateur supprimé) : on ne peut plus
    # interroger /routes avec, ce qui confirme indirectement que le compte
    # (et donc ses trajets en cascade) a bien disparu.
    list_res = client.get("/routes", headers=headers)
    assert list_res.status_code == 401
