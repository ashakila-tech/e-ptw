from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db

# Create the base router
router = APIRouter(prefix="/permit-types", tags=["Permit Types"])

@router.get("/options")
def permit_type_options(
    db: Session = Depends(get_db),
    company_id: int | None = None
):
    """
    Get permit types as options for select inputs.
    """
    q = db.query(models.PermitType)
    if company_id:
        q = q.filter(models.PermitType.company_id == company_id)
    return [{"value": pt.id, "label": pt.name} for pt in q.order_by(models.PermitType.name).all()]

# Attach the CRUD routes, GET/POST/PUT/DELETE
crud_router = make_crud_router(
    Model=models.PermitType,
    InSchema=schemas.PermitTypeIn,     # used for PUT (and POST if CreateSchema not given)
    OutSchema=schemas.PermitTypeOut,
    prefix="",
    tag="Permit Types",
    # optional: you can restrict writes later with write_roles=["admin"]
    list_roles=None,
    read_roles=None,
    write_roles=None,
)

router.include_router(crud_router)