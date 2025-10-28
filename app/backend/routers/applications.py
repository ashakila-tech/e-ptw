from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db, get_current_user, require_role

# Factory for list/get/delete
crud = make_crud_router(
    Model=models.Application,
    InSchema=schemas.ApplicationIn,
    OutSchema=schemas.ApplicationOut,
    prefix="/applications",
    tag="Applications",
    list_roles=["admin", "user"],
    read_roles=["admin", "user"],
    write_roles=["admin", "user"],
)

router = APIRouter(prefix="/applications", tags=["Applications"])
router.include_router(crud, tags=["Applications"])

# no auth for creating applications
@router.post("/", response_model=schemas.ApplicationOut)
def create_application(
    payload: schemas.ApplicationIn,
    db: Session = Depends(get_db),
):
    obj = models.Application(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{item_id}", response_model=schemas.ApplicationOut,
            dependencies=[Depends(require_role(["admin", "user"]))])
def update_application(
    item_id: int,
    payload: schemas.ApplicationIn,
    db: Session = Depends(get_db),
    me: models.User = Depends(get_current_user),
):
    obj = db.get(models.Application, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Application not found")

    # Ensure referenced document exists
    doc = db.get(models.Document, payload.document_id)
    if not doc:
        raise HTTPException(status_code=400, detail="Invalid document_id")

    for k, v in payload.model_dump().items():
        setattr(obj, k, v)
    obj.updated_by = me.id
    db.commit()
    db.refresh(obj)
    return obj

# --- Filter Endpoint for Optimized Fetching ---
@router.get("/filter", response_model=List[schemas.ApplicationOut])
def filter_applications(
    applicant_id: Optional[int] = Query(None, description="Filter by applicant_id"),
    company_id: Optional[int] = Query(None, description="Filter by company_id"),
    workflow_data_id: Optional[int] = Query(None, description="Filter by workflow_data_id"),
    db: Session = Depends(get_db),
):
    """
    Optimized backend-side filtering for application list.
    This lets the frontend load only relevant permits instead of fetching everything.
    """

    query = db.query(models.Application)

    # Simple filters
    if applicant_id:
        query = query.filter(models.Application.applicant_id == applicant_id)
    if company_id:
        query = query.filter(models.Application.company_id == company_id)
    if workflow_data_id:
        query = query.filter(models.Application.workflow_data_id == workflow_data_id)

    # Eager-load related models to avoid N+1 queries (optional but faster)
    query = query.options(
        joinedload(models.Application.document),
        joinedload(models.Application.location),
        joinedload(models.Application.permit_type),
        joinedload(models.Application.workflow_data),
    )

    return query.all()