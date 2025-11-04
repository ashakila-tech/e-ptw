from ._crud_factory import make_crud_router
from .. import models, schemas

crud_router = make_crud_router(
  Model=models.PermitOfficer,
  InSchema=schemas.PermitOfficerIn,
  OutSchema=schemas.PermitOfficerOut,
  prefix="/permit-officers",
  tag="Permit Officers",
  write_roles=["admin"],
)