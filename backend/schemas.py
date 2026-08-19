from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import List
from datetime import datetime


class StopIn(BaseModel):
    address: str
    lat: float
    lng: float
    place_id: str | None = None

    @field_validator("lat")
    @classmethod
    def validate_lat(cls, v: float) -> float:
        if not -90 <= v <= 90:
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("lng")
    @classmethod
    def validate_lng(cls, v: float) -> float:
        if not -180 <= v <= 180:
            raise ValueError("Longitude must be between -180 and 180")
        return v


class OptimizeRequest(BaseModel):
    stops: List[StopIn]

    @field_validator("stops")
    @classmethod
    def validate_stops(cls, v: List[StopIn]) -> List[StopIn]:
        if len(v) < 2:
            raise ValueError("At least 2 stops are required")
        if len(v) > 16:
            raise ValueError("Maximum 16 stops allowed")
        return v


class OptimizeResponse(BaseModel):
    optimal_order: List[int]
    total_duration_sec: int
    total_distance_m: int
    polyline_encoded: str | None = None


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        value = v.strip()
        if len(value) < 2:
            raise ValueError("Name must be at least 2 characters")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 72:
            raise ValueError("Password must be at most 72 characters (bcrypt limit)")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Saved routes ────────────────────────────────────────────────────────────

class StopForSave(BaseModel):
    address: str
    order: int
    lat: float | None = None
    lng: float | None = None


class SavedRouteCreate(BaseModel):
    name: str
    stops: List[StopForSave]
    optimized_order: List[int]
    total_duration_sec: int | None = None
    total_distance_m: int | None = None


class SavedRouteRead(BaseModel):
    id: int
    name: str
    created_at: datetime
    total_duration_sec: int | None = None
    total_distance_m: int | None = None
    stops_json: list
    optimized_order: list[int] = []

    model_config = {"from_attributes": True}

    @model_validator(mode='before')
    @classmethod
    def map_from_orm(cls, obj):
        # quand on valide a SQLAlchemy ORM instance, remap optimized_order_json → optimized_order
        if hasattr(obj, 'optimized_order_json'):
            return {
                'id': obj.id,
                'name': obj.name,
                'created_at': obj.created_at,
                'total_duration_sec': obj.total_duration_sec,
                'total_distance_m': obj.total_distance_m,
                'stops_json': obj.stops_json,
                'optimized_order': obj.optimized_order_json or [],
            }
        return obj
