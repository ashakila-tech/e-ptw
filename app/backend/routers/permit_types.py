# app/routers/permit_types.py
from ._crud_factory import make_crud_router
from .. import models, schemas
router = make_crud_router(
    Model=models.PermitType,
    InSchema=schemas.PermitTypeIn,
    OutSchema=schemas.PermitTypeOut,
    prefix="/permit-types",
    tag="Permit Types",
    write_roles=["admin"],
)

