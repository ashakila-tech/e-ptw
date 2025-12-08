from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from ._crud_factory import make_crud_router
from ..deps import get_db
from .. import models, schemas

# Create the base router
router = APIRouter(prefix="/approval-data", tags=["Approval Data"])

@router.post("/", response_model=schemas.ApprovalDataOut)
def create_approval_data(payload: schemas.ApprovalDataIn, db: Session = Depends(get_db)):
    """
    Create approval data with server UTC timestamp.
    """
    payload_dict = payload.model_dump()
    payload_dict["time"] = datetime.utcnow()  # override client-provided time

    obj = models.ApprovalData(**payload_dict)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

# --- Custom filter endpoint ---
@router.get("/filter", response_model=List[schemas.ApprovalDataOut])
def filter_approval_data(
    workflow_data_id: Optional[int] = Query(None, description="Filter by workflow_data_id"),
    approval_id: Optional[int] = Query(None, description="Filter by approval_id"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
):
    """
    Filter approval data records by workflow_data_id, approval_id, or status.
    Returns all if no filters are provided.
    """
    query = db.query(models.ApprovalData)
    if workflow_data_id is not None:
        query = query.filter(models.ApprovalData.workflow_data_id == workflow_data_id)
    if approval_id is not None:
        query = query.filter(models.ApprovalData.approval_id == approval_id)
    if status is not None:
        query = query.filter(models.ApprovalData.status == status)

    results = query.all()
    if not results:
        raise HTTPException(status_code=404, detail="No approval data found for given filter")

    return results


# --- Custom update mutator for approval logic ---
def approval_data_update_mutator(obj: models.ApprovalData, data: dict, db: Session):
    """
    Runs before saving during PUT update.
    Handles approval workflow logic:
    - Promotes next level if current level approved
    - Updates Application status to APPROVED if all approvers approved
    - Updates Application status to REJECTED if any approver rejects
    """
    new_status = data.get("status")
    new_remarks = data.get("remarks")

    # Update the ApprovalData object itself
    if new_status in {"APPROVED", "REJECTED"} and obj.status != new_status:
        obj.status = new_status
        obj.time = datetime.utcnow()
        if new_remarks is not None:
            obj.remarks = new_remarks
        db.flush()

    # Fetch all approval data for this workflow
    all_approval_data = db.query(models.ApprovalData).filter(
        models.ApprovalData.workflow_data_id == obj.workflow_data_id
    ).all()

    # If any approver rejected, set application status to REJECTED
    if any(a.status == "REJECTED" for a in all_approval_data):
        application = db.query(models.Application).filter(
            models.Application.workflow_data_id == obj.workflow_data_id
        ).first()
        if application and application.status != "REJECTED":
            application.status = "REJECTED"
            application.updated_time = datetime.utcnow()
            db.commit()
            print(f"Application {application.id} rejected due to an approver rejection!")
        return data  # No need to process further

    # Only run next-level promotion if current approval is APPROVED
    if new_status == "APPROVED":
        # Promote next level if exists
        next_level = db.query(models.ApprovalData).filter(
            models.ApprovalData.workflow_data_id == obj.workflow_data_id,
            models.ApprovalData.level == obj.level + 1
        ).first()

        if next_level and next_level.status == "WAITING":
            next_level.status = "PENDING"

        # If all approvals are approved, update the application status
        if all(a.status == "APPROVED" for a in all_approval_data):
            application = db.query(models.Application).filter(
                models.Application.workflow_data_id == obj.workflow_data_id
            ).first()
            if application and application.status != "APPROVED":
                application.status = "APPROVED"
                application.updated_time = datetime.utcnow()
                db.commit()
                print(f"Application {application.id} fully approved!")

    return data


# --- Attach the CRUD routes ---
crud_router = make_crud_router(
    Model=models.ApprovalData,
    InSchema=schemas.ApprovalDataIn,
    OutSchema=schemas.ApprovalDataOut,
    prefix="",
    tag="Approval Data",
    write_roles=["admin", "supervisor", "safety", "manager"],
    update_mutator=approval_data_update_mutator,  # attach custom logic
)

router.include_router(crud_router)