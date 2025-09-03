# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db, require_role
from ..security.hashing import Hash

def _user_create_mutator(data: dict, db: Session) -> dict:
    # uniqueness check
    email = data.get("email")
    if email and db.query(models.User).filter(models.User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already in use")
    pwd = data.pop("password", None)
    if pwd:
        data["password_hash"] = Hash.make(pwd)
    return data

# Factory router → still admin-protected for update/delete
crud = make_crud_router(
    Model=models.User,
    InSchema=schemas.UserIn,
    OutSchema=schemas.UserOut,
    prefix="/users",
    tag="Users",
    list_roles=["admin"],    # only admin can list
    read_roles=["admin"],    # only admin can read specific
    write_roles=None,   # keep PUT/DELETE admin-only
    create_mutator=_user_create_mutator,
)

router = APIRouter()
router.include_router(crud)

# Override POST so it's public (no role dependency)
@router.post("/users", response_model=schemas.UserOut)
def public_register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data = _user_create_mutator(data, db)
    obj = models.User(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj
