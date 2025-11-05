from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from ._crud_factory import make_crud_router
from ..deps import get_db
from .. import models, schemas

# Create the base router
router = APIRouter(prefix="/approval-data", tags=["Approval Data"])


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
    Used to trigger the next level approval once current level is approved.
    """
    new_status = data.get("status")

    # Only run logic when current approval is set to APPROVED
    if new_status == "APPROVED" and obj.status != "APPROVED":
        next_level = db.query(models.ApprovalData).filter(
            models.ApprovalData.workflow_data_id == obj.workflow_data_id,
            models.ApprovalData.level == obj.level + 1
        ).first()

        if next_level and next_level.status == "WAITING":
            next_level.status = "PENDING"

        # Optional: if this is the last level, mark something as fully approved
        last_level = db.query(models.ApprovalData).filter(
            models.ApprovalData.workflow_data_id == obj.workflow_data_id
        ).order_by(models.ApprovalData.level.desc()).first()

        if last_level and obj.id == last_level.id:
            print(f"Workflow {obj.workflow_data_id} fully approved!")
            # Optionally: mark workflow or document as APPROVED here if needed

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