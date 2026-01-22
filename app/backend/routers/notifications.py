from fastapi import APIRouter, Depends, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from ._crud_factory import make_crud_router
from ..deps import get_db
from .. import models, schemas
from ..utils.email import send_notification_email

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

@router.post("/send", response_model=schemas.NotificationOut)
def send_notification(
    notification_in: schemas.NotificationIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Create a notification in the database and send an email to the user.
    """
    # 1. Create Notification in DB
    db_notification = models.Notification(**notification_in.model_dump())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    # 2. Fetch User Email
    user = db.query(models.User).filter(models.User.id == notification_in.user_id).first()
    
    # 3. Send Email (Background Task)
    if user and user.email:
        background_tasks.add_task(
            send_notification_email,
            subject=notification_in.title,
            recipients=[user.email],
            body=notification_in.message
        )

    return db_notification

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