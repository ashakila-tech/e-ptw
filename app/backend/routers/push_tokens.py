from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_user
from ._crud_factory import make_crud_router

router = APIRouter(prefix="/push-tokens", tags=["Push Tokens"])

crud_router = make_crud_router(
    Model=models.PushToken,
    InSchema=schemas.PushTokenIn,
    OutSchema=schemas.PushTokenOut,
    prefix="",
    tag="Push Tokens",
    enable_create=False,
    enable_list=False,
    enable_get=False,
    enable_update=False,
    enable_delete=False,
)

@router.post("/", response_model=schemas.PushTokenOut)
def create_push_token(
    data: schemas.PushTokenIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Register a push token for the current user.
    Behaves like UPSERT (returns existing if found).
    """
    existing = (
        db.query(models.PushToken)
        .filter(models.PushToken.token == data.token)
        .first()
    )
    if existing:
        return existing

    new_token = models.PushToken(
        user_id=current_user.id,
        token=data.token,
        platform=data.platform
    )
    db.add(new_token)
    db.commit()
    db.refresh(new_token)
    return new_token

router.include_router(crud_router)