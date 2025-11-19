from ._crud_factory import make_crud_router
from .. import models, schemas

crud_router = make_crud_router(
    Model=models.ApplicationWorker,
    InSchema=schemas.ApplicationWorkerIn,
    OutSchema=schemas.ApplicationWorkerOut,
    prefix="/application-workers", # Standardized to plural
    tag="Application Workers",
    write_roles=["admin"],
)

# You can add custom routes here if needed, for example:
# from fastapi import APIRouter
# router = APIRouter()
# router.include_router(crud_router)