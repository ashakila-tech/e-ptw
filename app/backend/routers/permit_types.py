# app/routers/permit_types.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db

# ---------- CRUD (list/get/post/put/delete) ----------
crud = make_crud_router(
    Model=models.PermitType,
    InSchema=schemas.PermitTypeIn,     # used for PUT (and POST if CreateSchema not given)
    OutSchema=schemas.PermitTypeOut,
    prefix="/permit-types",
    tag="Permit Types",
    # optional: you can restrict writes later with write_roles=["admin"]
    list_roles=None,
    read_roles=None,
    write_roles=None,
)

# ---------- Extra helper endpoints ----------
extra = APIRouter(prefix="/permit-types", tags=["Permit Types"])

@extra.get("/options")
def permit_type_options(
    db: Session = Depends(get_db),
    company_id: int | None = None
):
    q = db.query(models.PermitType)
    if company_id:
        q = q.filter(models.PermitType.company_id == company_id)
    return [{"value": pt.id, "label": pt.name} for pt in q.order_by(models.PermitType.name).all()]

# expose both
router = APIRouter()
router.include_router(crud)
router.include_router(extra)
