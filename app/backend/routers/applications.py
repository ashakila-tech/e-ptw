from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from datetime import datetime
from datetime import timedelta
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
    # Exclude relationship IDs from the main object creation
    payload_dict = payload.model_dump(exclude={"worker_ids", "safety_equipment_ids"})
    payload_dict["created_time"] = datetime.utcnow()
    payload_dict["updated_time"] = None  # new record

    obj = models.Application(**payload_dict)

    # Handle workers many-to-many relationship
    if payload.worker_ids:
        workers = db.query(models.Worker).filter(models.Worker.id.in_(payload.worker_ids)).all()
        obj.workers = workers

    # Handle safety_equipment many-to-many relationship
    if payload.safety_equipment_ids:
        equipment = db.query(models.SafetyEquipment).filter(models.SafetyEquipment.id.in_(payload.safety_equipment_ids)).all()
        obj.safety_equipment = equipment

    db.add(obj)
    db.commit()
    db.refresh(obj)

    # Eager load relationships for the response
    db.refresh(obj, attribute_names=["workers", "safety_equipment"])
    return obj


@router.put("/{item_id}", response_model=schemas.ApplicationOut,
            dependencies=[Depends(require_role(["admin", "user"]))])
def update_application(
    item_id: int,
    payload: schemas.ApplicationUpdate,
    db: Session = Depends(get_db),
    me: models.User = Depends(get_current_user),
):
    """
    Specialised update an existing application.
    """
    obj = db.get(models.Application, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Application not found")

    # Get payload data, excluding unset fields and relationship IDs
    update_data = payload.model_dump(exclude_unset=True, exclude={"worker_ids", "safety_equipment_ids"})

    # Update fields
    for k, v in update_data.items():
        setattr(obj, k, v)

    # Handle workers update
    if payload.worker_ids is not None:
        if not payload.worker_ids:
            obj.workers = []  # Clear workers if an empty list is provided
        else:
            workers = db.query(models.Worker).filter(models.Worker.id.in_(payload.worker_ids)).all()
            obj.workers = workers

    # Handle safety equipment update
    if payload.safety_equipment_ids is not None:
        if not payload.safety_equipment_ids:
            obj.safety_equipment = [] # Clear equipment if an empty list is provided
        else:
            equipment = db.query(models.SafetyEquipment).filter(models.SafetyEquipment.id.in_(payload.safety_equipment_ids)).all()
            obj.safety_equipment = equipment

    obj.updated_by = me.id
    obj.updated_time = datetime.utcnow()  # server timestamp
    db.commit()
    db.refresh(obj)

    # Eager load relationships for the response
    db.refresh(obj, attribute_names=["workers", "safety_equipment"])
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
        joinedload(models.Application.workers),
        joinedload(models.Application.safety_equipment),
    )

    return query.all()

@router.post("/{app_id}/confirm-security")
def confirm_security_action(
    app_id: int,
    db: Session = Depends(get_db),
):
    """
    Security confirmation endpoint without authentication.
    - First press = mark as ACTIVE (entry)
    - Second press = mark as COMPLETED (exit)
    """
    app = db.get(models.Application, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    if app.status == "APPROVED":
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

@router.get("/{application_id}/check-extension-eligibility", response_model=schemas.PermitExtensionEligibility)
def check_permit_extension_eligibility(application_id: int, db: Session = Depends(get_db)):
    """
    Checks if a permit is eligible for a work time extension based on server time.
    """
    permit = db.query(models.Application).options(
        joinedload(models.Application.workflow_data)
    ).filter(models.Application.id == application_id).first()

    if not permit:
        raise HTTPException(status_code=404, detail="Permit not found")

    # 1. Check if permit status is ACTIVE
    if permit.status != "ACTIVE":
        return {"eligible": False, "reason": f"Permit status is '{permit.status}'."}

    # 2. Check if work end time exists
    if not permit.workflow_data or not permit.workflow_data.end_time:
        return {"eligible": False, "reason": "Permit does not have a work end time."}

    # 3. Perform date comparison using server time
    work_end_time = permit.workflow_data.end_time
    today = datetime.utcnow().date()
    
    # The cutoff date is 3 days before the work_end_time (inclusive)
    cutoff_date = work_end_time.date() - timedelta(days=3)

    if today < cutoff_date:
        return {"eligible": False, "reason": f"Extension window opens on {cutoff_date.strftime('%d %b %Y')}."}

    return {"eligible": True, "reason": "Permit is eligible for extension."}

# Attach the CRUD routes, GET/POST/PUT/DELETE
crud_router = make_crud_router(
    Model=models.Application,
    InSchema=schemas.ApplicationIn,
    OutSchema=schemas.ApplicationOut,
    UpdateSchema=schemas.ApplicationUpdate,
    prefix="",
    tag="Applications",
    list_roles=["admin", "user"],
    read_roles=["admin", "user"],
    write_roles=["admin", "user"],
)

router.include_router(crud_router)