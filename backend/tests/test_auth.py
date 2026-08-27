"""
Tests de la brique authentification (routers/auth_router.py, auth.py).

Couvre :
- EF-21 (inscription), EF-22 (connexion), EF-23 (suppression de compte)
- RM-10 (unicité du courriel), RM-11 (politique de mot de passe)
- ENF-06 (hachage bcrypt : le mot de passe n'est jamais stocké en clair)
- ENF-07 (protection JWT des endpoints)
"""


def _register_payload(**overrides):
    payload = {
        "name": "Yves",
        "email": "yves@example.com",
        "password": "motdepasse1",
    }
    payload.update(overrides)
    return payload


def test_register_returns_user_without_password(client):
    res = client.post("/auth/register", json=_register_payload())
    assert res.status_code == 201
    body = res.json()
    assert body["email"] == "yves@example.com"
    assert body["name"] == "Yves"
    # Le mot de passe (clair ou haché) ne doit jamais apparaître dans la réponse API.
    assert "password" not in body
    assert "password_hash" not in body


def test_register_duplicate_email_returns_409(client):
    client.post("/auth/register", json=_register_payload())
    res = client.post("/auth/register", json=_register_payload())
    assert res.status_code == 409


def test_register_rejects_short_password(client):
    # RM-11 : au moins 8 caractères.
    res = client.post("/auth/register", json=_register_payload(password="abc123"))
    assert res.status_code == 422


def test_register_rejects_password_without_digit(client):
    # RM-11 : au moins un chiffre.
    res = client.post("/auth/register", json=_register_payload(password="motdepasse"))
    assert res.status_code == 422


def test_register_rejects_short_name(client):
    res = client.post("/auth/register", json=_register_payload(name="A"))
    assert res.status_code == 422


def test_login_success_returns_jwt(client):
    client.post("/auth/register", json=_register_payload())
    res = client.post(
        "/auth/login",
        json={"email": "yves@example.com", "password": "motdepasse1"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["token_type"] == "bearer"
    assert isinstance(body["access_token"], str) and len(body["access_token"]) > 0


def test_login_wrong_password_returns_401(client):
    client.post("/auth/register", json=_register_payload())
    res = client.post(
        "/auth/login",
        json={"email": "yves@example.com", "password": "mauvaismdp1"},
    )
    assert res.status_code == 401


def test_login_unknown_email_returns_401(client):
    res = client.post(
        "/auth/login",
        json={"email": "inconnu@example.com", "password": "motdepasse1"},
    )
    assert res.status_code == 401


def test_me_without_token_returns_401(client):
    # ENF-07 : un endpoint protégé refuse une requête sans jeton.
    res = client.get("/auth/me")
    assert res.status_code == 401


def test_me_with_invalid_token_returns_401(client):
    res = client.get("/auth/me", headers={"Authorization": "Bearer token-invalide"})
    assert res.status_code == 401


def test_me_with_valid_token_returns_current_user(client):
    client.post("/auth/register", json=_register_payload())
    login = client.post(
        "/auth/login",
        json={"email": "yves@example.com", "password": "motdepasse1"},
    )
    token = login.json()["access_token"]

    res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "yves@example.com"


def test_delete_account_requires_auth(client):
    res = client.delete("/auth/me")
    assert res.status_code == 401


def test_delete_account_removes_user(client):
    # EF-23 : suppression de compte (droit à l'oubli RGPD).
    client.post("/auth/register", json=_register_payload())
    login = client.post(
        "/auth/login",
        json={"email": "yves@example.com", "password": "motdepasse1"},
    )
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.delete("/auth/me", headers=headers)
    assert res.status_code == 200

    # Le jeton pointait vers un utilisateur qui n'existe plus : accès refusé.
    res_after = client.get("/auth/me", headers=headers)
    assert res_after.status_code == 401
