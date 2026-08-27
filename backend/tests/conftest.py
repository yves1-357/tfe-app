"""
Fixtures partagées pour la suite pytest du backend NextStop.

Chaque test utilise une base SQLite en mémoire dédiée (créée et détruite à
chaque test), afin de ne jamais toucher à la base Postgres de développement
ou de production. La dépendance FastAPI `get_db` est surchargée via
`app.dependency_overrides`, le mécanisme standard recommandé par FastAPI
pour isoler les tests d'intégration de la vraie base de données.
"""
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app


@pytest.fixture()
def db_session_factory():
    """Crée un moteur SQLite en mémoire frais, avec toutes les tables du modèle.

    StaticPool force SQLAlchemy à réutiliser une unique connexion SQLite
    physique pour tout le moteur : une base ":memory:" n'existe que le temps
    d'une connexion, donc sans ce pool chaque nouvelle session ouvrirait une
    base vide différente (les tables créées ci-dessous deviendraient
    invisibles dès le premier `get_db` appelé par une requête FastAPI).
    """
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    yield TestingSessionLocal
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture()
def client(db_session_factory) -> Generator[TestClient, None, None]:
    """Client de test FastAPI, avec get_db pointé vers la base SQLite en mémoire."""

    def _override_get_db():
        db = db_session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
