from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db

# Create the base router
router = APIRouter(prefix="/location-managers", tags=["Location Managers"])

@router.get("/filter", response_model=list[schemas.LocationManagerOut])
def filter_location_managers(
    location_id: int | None = Query(None),
    user_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    """
    Filter location managers by location_id or user_id.
    Returns manager + user + group info.
    """
    query = (
        db.query(models.LocationManager)
        .options(
            joinedload(models.LocationManager.user)
            .joinedload(models.User.user_groups)
            .joinedload(models.UserGroup.group)
        )
    )

    if location_id:
        query = query.filter(models.LocationManager.location_id == location_id)
    if user_id:
        query = query.filter(models.LocationManager.user_id == user_id)

    results = query.all()

    if not results:
        raise HTTPException(status_code=404, detail="Not Found")

    return results

# Attach the CRUD routes, GET/POST/PUT/DELETE
crud_router = make_crud_router(
    Model=models.LocationManager,
    InSchema=schemas.LocationManagerIn,
    OutSchema=schemas.LocationManagerOut,
    prefix="",
    tag="Location Managers",
    write_roles=["admin"],
)

router.include_router(crud_router)