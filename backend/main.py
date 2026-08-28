from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import FRONTEND_ORIGIN
import models  # noqa: F401 — enregistre les classes ORM (User, SavedRoute) sur Base
from routers.auth_router import router as auth_router
from routers.optimize_router import router as optimize_router
from routers.routes_router import router as routes_router


# Les 3 imports  pour slowapi :
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter

app = FastAPI(
    title="NextStop API",
    description="Backend de l'application de planification de tournées multi-arrêts",
    version="0.1.0",
)

# attache limiteur a l'application pour gère l'erreur 429
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_origins = list({
    FRONTEND_ORIGIN,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
})

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(optimize_router)
app.include_router(auth_router)
app.include_router(routes_router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "version": "0.1.0"}