from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from ..deps import get_db, get_current_user
from ._crud_factory import make_crud_router

router = APIRouter(prefix="/push-tokens", tags=["Push Tokens"])


def push_token_create_mutator(data: dict, db: Session):
    """
    - Inject authenticated user_id
    - Prevent duplicate token inserts
    - Behaves like UPSERT
    """
    user = get_current_user()

    existing = (
        db.query(models.PushToken)
        .filter(models.PushToken.token == data["token"])
        .first()
    )

    if existing:
        # Return existing model instance
        return existing

    data["user_id"] = user.id
    return data


crud_router = make_crud_router(
    Model=models.PushToken,
    InSchema=schemas.PushTokenIn,
    OutSchema=schemas.PushTokenOut,
    prefix="",
    tag="Push Tokens",
    create_mutator=push_token_create_mutator,

    # 🔒 Lock down routes (recommended)
    enable_list=False,
    enable_get=False,
    enable_update=False,
    enable_delete=False,
)

router.include_router(crud_router)