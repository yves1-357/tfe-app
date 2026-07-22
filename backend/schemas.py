from pydantic import BaseModel, EmailStr, field_validator
from typing import List


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
        if len(v) > 15:
            raise ValueError("Maximum 15 stops allowed")
        return v


class OptimizeResponse(BaseModel):
    optimal_order: List[int]
    total_duration_sec: int
    total_distance_m: int
    polyline_encoded: str | None = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v
