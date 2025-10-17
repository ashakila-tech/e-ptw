# app/routers/approvals.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from ._crud_factory import make_crud_router
from ..deps import get_db
from .. import models, schemas

# Create the base router
router = APIRouter(prefix="/approvals", tags=["Approvals"])

# Custom filter endpoint
@router.get("/filter", response_model=List[schemas.ApprovalOut])
def get_approvals_by_workflow(
    workflow_id: Optional[int] = Query(None, description="Filter by workflow_id"),
    db: Session = Depends(get_db),
):
    """
    Filter approvals records by workflow_data_id.
    """
    query = db.query(models.Approval)
    if workflow_id:
        query = query.filter(models.Approval.workflow_id == workflow_id)
    return query.all()

# Attach the CRUD routes
crud_router = make_crud_router(
    Model=models.Approval,
    InSchema=schemas.ApprovalIn,
    OutSchema=schemas.ApprovalOut,
    prefix="",
    tag="Approvals",
    write_roles=["admin"],
    )

router.include_router(crud_router)