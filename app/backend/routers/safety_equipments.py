from ._crud_factory import make_crud_router
from .. import models, schemas

crud_router = make_crud_router(
    Model=models.SafetyEquipment,
    InSchema=schemas.SafetyEquipmentIn,
    OutSchema=schemas.SafetyEquipmentOut,
    prefix="/safety-equipments",
    tag="Safety Equipment",
    write_roles=["admin"],
)