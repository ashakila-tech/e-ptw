from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session, joinedload
from .. import models, schemas

from ._crud_factory import make_crud_router
from ..deps import get_db, get_current_user
from typing import List, Optional

# Create the base router
router = APIRouter(prefix="/feedbacks", tags=["Feedbacks"])

@router.get("/filter", response_model=List[schemas.FeedbackOut])
def filter_feedbacks(
    user_id: int = Query(..., description="Filter feedbacks by user_id"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Fetch feedbacks by user_id.
    """
    query = db.query(models.Feedback).filter(models.Feedback.user_id == user_id)
    
    return query.all()

# Attach the CRUD routes, GET/POST/PUT/DELETE
crud_router = make_crud_router(
    Model=models.Feedback,
    InSchema=schemas.FeedbackIn,
    OutSchema=schemas.FeedbackOut,
    UpdateSchema=schemas.FeedbackUpdate,
    prefix="",
    tag="Feedbacks",
    list_roles=None,    # allow all authenticated users
    read_roles=None,    # allow all authenticated users
    write_roles=None,   # allow all authenticated users (to create feedback)
)

router.include_router(crud_router)