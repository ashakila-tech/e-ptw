# app/routers/locations.py
from ._crud_factory import make_crud_router
from .. import models, schemas
router = make_crud_router(
    Model=models.Location,
    InSchema=schemas.LocationIn,
    OutSchema=schemas.LocationOut,
    prefix="/locations",
    tag="Locations",
    write_roles=["admin"],
)
