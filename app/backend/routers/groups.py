# app/routers/groups.py
from ._crud_factory import make_crud_router
from .. import models, schemas
router = make_crud_router(
    Model=models.Group,
    InSchema=schemas.GroupIn,
    OutSchema=schemas.GroupOut,
    prefix="/groups",
    tag="Groups",
    write_roles=["admin"],
)
