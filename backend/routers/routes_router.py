from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import SavedRoute, User
from schemas import SavedRouteCreate, SavedRouteRead

router = APIRouter(prefix="/routes", tags=["routes"])


@router.post("", response_model=SavedRouteRead, status_code=status.HTTP_201_CREATED)
def create_route(
    payload: SavedRouteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    route = SavedRoute(
        user_id=current_user.id,
        name=payload.name.strip() or "Route sans nom",
        stops_json=[s.model_dump() for s in payload.stops],
        optimized_order_json=payload.optimized_order,
        total_duration_sec=payload.total_duration_sec,
        total_distance_m=payload.total_distance_m,
    )
    db.add(route)
    db.commit()
    db.refresh(route)
    return route


@router.get("", response_model=list[SavedRouteRead])
def list_routes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(SavedRoute)
        .filter(SavedRoute.user_id == current_user.id)
        .order_by(SavedRoute.created_at.desc())
        .all()
    )


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_route(
    route_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    route = db.query(SavedRoute).filter(
        SavedRoute.id == route_id,
        SavedRoute.user_id == current_user.id,
    ).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    db.delete(route)
    db.commit()
