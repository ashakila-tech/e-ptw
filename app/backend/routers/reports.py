from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ._crud_factory import make_crud_router
from ..deps import get_db
from .. import models, schemas

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/filter", response_model=List[schemas.ReportOut])
def filter_reports(
    user_id: Optional[int] = Query(None, description="Filter reports by user_id"),
    db: Session = Depends(get_db),
):
    """
    Fetch reports, optionally filtered by user_id.
    """
    query = db.query(models.Report)

    if user_id:
        query = query.filter(models.Report.user_id == user_id)

    query = query.options(
        joinedload(models.Report.department),
        joinedload(models.Report.user),
        joinedload(models.Report.location),
        joinedload(models.Report.document)
    )

    return query.order_by(models.Report.id.desc()).all()

crud_router = make_crud_router(
    Model=models.Report,
    InSchema=schemas.ReportIn,
    OutSchema=schemas.ReportOut,
    UpdateSchema=schemas.ReportUpdate,
    prefix="",
    tag="Reports"
)

router.include_router(crud_router)