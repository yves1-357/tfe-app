import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
DATABASE_URL: str = os.getenv(
	"DATABASE_URL",
	"postgresql+psycopg2://postgres:dev@localhost:5432/nextstop",
)
JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRES_DAYS: int = int(os.getenv("JWT_EXPIRES_DAYS", "7"))
