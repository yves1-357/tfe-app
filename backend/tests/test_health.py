"""
Test de l'endpoint de santé (ENF-18), utilisé par Render pour les health
checks et par le frontend pour anticiper le réveil du backend (ENF-04).
"""


def test_health_returns_ok(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
