from fastapi import APIRouter, Depends, Query, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ._crud_factory import make_crud_router
from ..deps import get_db
from .. import models, schemas
from ..utils.email import send_notification_email
from ..config import settings

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

@router.post("/send-to-user/{user_id}", response_model=schemas.NotificationOut)
def send_notification(
    user_id: int,
    notification_in: schemas.NotificationIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Create a notification in the database and send an email to the user.
    """
    # 1. Create Notification in DB
    data = notification_in.model_dump()
    data["user_id"] = user_id
    db_notification = models.Notification(**data)
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    # 2. Fetch User Email
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    # 3. Send Email (Background Task)
    if user and user.email:
        background_tasks.add_task(
            send_notification_email,
            subject=notification_in.title,
            recipients=[user.email],
            body=notification_in.message
        )

    return db_notification

@router.post("/send-to-admin", response_model=schemas.NotificationOut)
def send_notification_to_admin(
    notification_in: schemas.AdminNotificationIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Create a notification in the database and send an email to the admin.
    """
    # Find the admin user to link the notification to
    # Try matching MAIL_ADMIN email first
    admin_user = db.query(models.User).filter(models.User.email == settings.MAIL_ADMIN).first()
    
    # If not found, try finding any user with admin privileges (user_type=9)
    if not admin_user:
        admin_user = db.query(models.User).filter(models.User.user_type == 9).first()
        
    if not admin_user:
        raise HTTPException(status_code=404, detail="Admin user not found in database. Cannot save notification.")

    # 1. Create Notification in DB
    db_notification = models.Notification(
        user_id=admin_user.id,
        title=notification_in.title,
        message=notification_in.message
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    # 2. Send Email (Background Task)
    if settings.MAIL_ADMIN:
        background_tasks.add_task(
            send_notification_email,
            subject=notification_in.title,
            recipients=[settings.MAIL_ADMIN],
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