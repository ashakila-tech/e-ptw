# app/routers/documents.py
from ._crud_factory import make_crud_router
from .. import models, schemas
router = make_crud_router(
    Model=models.Document,
    InSchema=schemas.DocumentIn,
    OutSchema=schemas.DocumentOut,
    prefix="/documents",
    tag="Documents",
    write_roles=["admin"],
)
