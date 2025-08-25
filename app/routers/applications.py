# app/routers/applications.py
# Keep factory CRUD for base operations; your custom endpoints remain in this module.
from fastapi import APIRouter
from ._crud_factory import make_crud_router
from .. import models, schemas

crud = make_crud_router(
    Model=models.Application,
    InSchema=schemas.ApplicationIn,
    OutSchema=schemas.ApplicationOut,
    prefix="/applications",
    tag="Applications",
    write_roles=["user","admin"],
)

router = APIRouter()
router.include_router(crud)

# (Optional) add your custom endpoints below, e.g. /submit, /approve, /reject
# router.post("/{id}/submit") ...
