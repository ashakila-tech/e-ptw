from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db

# Create the base router
router = APIRouter(prefix="/department-heads", tags=["Department Heads"])

@router.get("/filter", response_model=list[schemas.DepartmentHeadOut])
def filter_department_heads(
    department_id: int | None = Query(None),
    user_id: int | None = Query(None),
    db: Session = Depends(get_db),
):
    """
    Filter department heads by department_id or user_id.
    """
    query = (
        db.query(models.DepartmentHead)
        .options(joinedload(models.DepartmentHead.user))
    )

    if department_id:
        query = query.filter(models.DepartmentHead.department_id == department_id)
    if user_id:
        query = query.filter(models.DepartmentHead.user_id == user_id)

    return query.all()

# Attach the CRUD routes, GET/POST/PUT/DELETE
crud_router = make_crud_router(
    Model=models.DepartmentHead,
    InSchema=schemas.DepartmentHeadIn,
    OutSchema=schemas.DepartmentHeadOut,
    prefix="",
    tag="Department Heads",
    write_roles=["admin"],
)

router.include_router(crud_router)