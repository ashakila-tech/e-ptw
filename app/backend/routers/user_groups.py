from ._crud_factory import make_crud_router
from .. import models, schemas

crud_router = make_crud_router(
    Model=models.UserGroup,
    InSchema=schemas.UserGroupIn,
    OutSchema=schemas.UserGroupOut,
    prefix="/user-groups",
    tag="User Groups",
    write_roles=["admin"],
)
