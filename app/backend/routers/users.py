from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db
from ..security.hashing import Hash

def _user_create_mutator(data: dict, db: Session) -> dict:
    # email uniqueness
    email = data.get("email")
    if email and db.query(models.User).filter(models.User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already in use")
    # hash password if provided
    pwd = data.pop("password", None)
    if pwd:
        data["password_hash"] = Hash.make(pwd)
    return data

def _user_update_mutator(obj: models.User, data: dict, db: Session) -> dict:
    # if email changed, enforce uniqueness
    new_email = data.get("email")
    if new_email and new_email != obj.email:
        exists = db.query(models.User).filter(models.User.email == new_email).first()
        if exists:
            raise HTTPException(status_code=409, detail="Email already in use")
    # hash password if provided
    pwd = data.pop("password", None)
    if pwd:
        data["password_hash"] = Hash.make(pwd)
    return data

# Everyone can list/get/create/update/delete (authenticated guard handled elsewhere in your factory/deps)
crud = make_crud_router(
    Model=models.User,
    InSchema=schemas.UserCreate,        # POST schema
    OutSchema=schemas.UserOut,
    UpdateSchema=schemas.UserUpdate,    # PUT/PATCH schema (partial)
    prefix="/users",
    tag="Users",
    list_roles=None,    # ← allow all authenticated users
    read_roles=None,    # ← allow all authenticated users
    write_roles=None,   # ← allow all authenticated users (PUT/PATCH/DELETE)
    create_mutator=_user_create_mutator,
    update_mutator=_user_update_mutator,
)

router = APIRouter()
router.include_router(crud)