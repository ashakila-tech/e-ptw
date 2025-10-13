# app/routers/approvals.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from ._crud_factory import make_crud_router
from ..deps import get_db
from .. import models, schemas

#router = make_crud_router(
    #model=models.Approval,  
    #schema_in=schemas.ApprovalIn,
    #schema_out=schemas.ApprovalOut,
    #prefix="/approvals",
    #tags=["approvals"]
    #)
    
router = make_crud_router(
    Model=models.Approval,
    InSchema=schemas.ApprovalIn,     # must be ApprovalIn
    OutSchema=schemas.ApprovalOut,   # and ApprovalOut
    prefix="/approvals",
    tag="Approvals",
    write_roles=["admin"],
    )

@router.get("/filter", response_model=List[schemas.ApprovalOut])
def get_approvals_by_workflow(
    workflow_id: Optional[int] = Query(None, description="Filter by workflow_id"),
    db: Session = Depends(get_db),
):
    query = db.query(models.Approval)
    if workflow_id:
        query = query.filter(models.Approval.workflow_id == workflow_id)
    return query.all()