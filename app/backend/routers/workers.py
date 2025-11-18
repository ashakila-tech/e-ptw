from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db

router = APIRouter(prefix="/workers", tags=["Workers"])


# Custom filter endpoint
@router.get("/filter", response_model=List[schemas.WorkerOut])
def get_workers_by_company(
    company_id: Optional[int] = Query(None, description="Filter by company_id"),
    db: Session = Depends(get_db),
):
    """Filter workers by company_id."""
    query = db.query(models.Worker)
    if company_id:
        query = query.filter(models.Worker.company_id == company_id)
    return query.all()


crud_router = make_crud_router(
    Model=models.Worker,
    InSchema=schemas.WorkerIn,
    OutSchema=schemas.WorkerOut,
    prefix="",
    tag="Workers",
    write_roles=["admin"]
)

router.include_router(crud_router)