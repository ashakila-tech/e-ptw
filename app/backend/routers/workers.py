from fastapi import APIRouter
from ._crud_factory import make_crud_router
from .. import models, schemas

router = APIRouter(prefix="/workers", tags=["Workers"])

crud_router = make_crud_router(
    Model=models.Worker,
    InSchema=schemas.WorkerIn,
    OutSchema=schemas.WorkerOut,
    prefix="",
    tag="Workers",
    write_roles=["admin"]
)

router.include_router(crud_router)