from ._crud_factory import make_crud_router
from .. import models, schemas

crud_router = make_crud_router(
    Model=models.Location,
    InSchema=schemas.LocationIn,
    OutSchema=schemas.LocationOut,
    prefix="/locations",
    tag="Locations",
    write_roles=["admin"],
)
