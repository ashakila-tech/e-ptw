from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db

# Create the base router
router = APIRouter(prefix="/permit-officers", tags=["Permit Officers"])

@router.get("/filter", response_model=list[schemas.PermitOfficerOut])
def filter_permit_officers(
    permit_type_id: int | None = Query(None),
    user_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    """
    Filter permit officers by permit_type_id or user_id.
    Returns all if no filters are provided.
    """
    query = db.query(models.PermitOfficer)

    if permit_type_id:
        query = query.filter(models.PermitOfficer.permit_type_id == permit_type_id)
    if user_id:
        query = query.filter(models.PermitOfficer.user_id == user_id)

    return query.all()

# Attach the CRUD routes, GET/POST/PUT/DELETE
crud_router = make_crud_router(
  Model=models.PermitOfficer,
  InSchema=schemas.PermitOfficerIn,
  OutSchema=schemas.PermitOfficerOut,
  prefix="",
  tag="Permit Officers",
  write_roles=["admin"],
)

router.include_router(crud_router)