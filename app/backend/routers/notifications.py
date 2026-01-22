from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from ._crud_factory import make_crud_router
from ..deps import get_db
from .. import models, schemas

# Create the base router
router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/filter", response_model=List[schemas.NotificationOut])
def filter_notifications(
    user_id: int = Query(..., description="Filter notifications by user_id"),
    db: Session = Depends(get_db),
):
    """
    Fetch notifications by user_id.
    """
    query = db.query(models.Notification).filter(models.Notification.user_id == user_id)
    
    return query.order_by(models.Notification.created_at.desc()).all()

# Attach the CRUD routes, GET/POST/PUT/DELETE
crud_router = make_crud_router(
    Model=models.Notification,
    InSchema=schemas.NotificationIn,
    OutSchema=schemas.NotificationOut,
    UpdateSchema=schemas.NotificationUpdate,
    prefix="",
    tag="Notifications",
    list_roles=None,    # allow all authenticated users
    read_roles=None,    # allow all authenticated users
    write_roles=None,   # allow all authenticated users
)

router.include_router(crud_router)