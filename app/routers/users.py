# app/routers/users.py
from ._crud_factory import make_crud_router
from .. import models, schemas
router = make_crud_router(
    Model=models.User,
    InSchema=schemas.UserIn,
    OutSchema=schemas.UserOut,
    prefix="/users",
    tag="Users",
    write_roles=["admin"],
)
