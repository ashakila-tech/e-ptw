from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from ._crud_factory import make_crud_router
from ..deps import get_db
from .. import models, schemas

# Create the base router
router = APIRouter(prefix="/approval-data", tags=["Approval Data"])

# Custom filter endpoint
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

# Attach the CRUD routes
crud_router = make_crud_router(
    Model=models.ApprovalData,
    InSchema=schemas.ApprovalDataIn,
    OutSchema=schemas.ApprovalDataOut,
    prefix="",
    tag="Approval Data",
    write_roles=["admin"],
)

router.include_router(crud_router)