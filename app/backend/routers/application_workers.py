from ._crud_factory import make_crud_router
from .. import models, schemas

crud_router = make_crud_router(
    Model=models.ApplicationWorker,
    InSchema=schemas.ApplicationWorkerIn,
    OutSchema=schemas.ApplicationWorkerOut,
    prefix="/application-workers",
    tag="Application Workers",
    write_roles=["admin"],
)