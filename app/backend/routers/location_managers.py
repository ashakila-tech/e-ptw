from ._crud_factory import make_crud_router
from .. import models, schemas

crud_router = make_crud_router(
  Model=models.LocationManager,
  InSchema=schemas.LocationManagerIn,
  OutSchema=schemas.LocationManagerOut,
  prefix="/location-managers",
  tag="Location Managers",
  write_roles=["admin"],
)