from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import FRONTEND_ORIGIN
from routers.optimize_router import router as optimize_router

app = FastAPI(
    title="NextStop API",
    description="Backend de l'application de planification de tournées multi-arrêts",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(optimize_router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "version": "0.1.0"}