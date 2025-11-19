from ._crud_factory import make_crud_router
from .. import models, schemas

crud_router = make_crud_router(
    Model=models.ApplicationSafetyEquipment,
    InSchema=schemas.ApplicationSafetyEquipmentIn,
    OutSchema=schemas.ApplicationSafetyEquipmentOut,
    prefix="/application-safety-equipments",
    tag="Application Safety Equipment",
    write_roles=["admin"],
)