from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from .. import models
from ..deps import get_db

# Create the base router
router = APIRouter(prefix="/groups", tags=["Groups"])

@router.get("/options")
def group_options(
    company_id: int | None = Query(None),
    q: str | None = Query(None),
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(models.Group)
    if company_id:
        query = query.filter(models.Group.company_id == company_id)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(models.Group.name.ilike(like))
    rows = (
        query.order_by(models.Group.name.asc())
             .offset((page - 1) * page_size)
             .limit(page_size)
             .all()
    )
    return [{"value": g.id, "label": g.name} for g in rows]
