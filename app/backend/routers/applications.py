from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from datetime import datetime

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db, get_current_user, require_role

# Create the base router
router = APIRouter(prefix="/applications", tags=["Applications"])

# No auth for creating applications
@router.post("/", response_model=schemas.ApplicationOut)
def create_application(
    payload: schemas.ApplicationIn,
    db: Session = Depends(get_db),
):
    """
    Create a new application without authentication.
    """
    # Override timestamps with server UTC time
    payload_dict = payload.model_dump()
    payload_dict["created_time"] = datetime.utcnow()
    payload_dict["updated_time"] = None  # new record

    obj = models.Application(**payload_dict)
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
    """
    Specialised update an existing application.
    """
    obj = db.get(models.Application, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Application not found")

    # Ensure referenced document exists
    doc = db.get(models.Document, payload.document_id)
    if not doc:
        raise HTTPException(status_code=400, detail="Invalid document_id")

    # Update fields
    for k, v in payload.model_dump().items():
        setattr(obj, k, v)

    obj.updated_by = me.id
    obj.updated_time = datetime.utcnow()  # server timestamp
    db.commit()
    db.refresh(obj)
    return obj

# Filter Endpoint for Optimized Fetching
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

@router.post("/{app_id}/confirm-security")
def confirm_security_action(
    app_id: int,
    db: Session = Depends(get_db),
    me: models.User = Depends(get_current_user),
):
    """
    Security confirmation endpoint.
    - First press = mark as ACTIVE (entry)
    - Second press = mark as COMPLETED (exit)
    """

    # Fetch user and check if they are in 'Area Owner' group
    user_groups = [g.Group.name for g in me.groups]
    if "Area Owner" not in user_groups:
        raise HTTPException(status_code=403, detail="Only security can perform this action.")

    # Fetch the application
    app = db.get(models.Application, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    # Toggle the status based on current state
    if app.status == "SUBMITTED":
        app.status = "ACTIVE"
        app.updated_time = datetime.utcnow()
        message = "Permit activated successfully (entry confirmed)."

    elif app.status == "ACTIVE":
        app.status = "COMPLETED"
        app.updated_time = datetime.utcnow()
        message = "Permit completed successfully (exit confirmed)."

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot confirm security action for status: {app.status}"
        )

    db.commit()
    db.refresh(app)
    return {"message": message, "status": app.status}

# Attach the CRUD routes, GET/POST/PUT/DELETE
crud_router = make_crud_router(
    Model=models.Application,
    InSchema=schemas.ApplicationIn,
    OutSchema=schemas.ApplicationOut,
    prefix="",
    tag="Applications",
    list_roles=["admin", "user"],
    read_roles=["admin", "user"],
    write_roles=["admin", "user"],
)

router.include_router(crud_router)