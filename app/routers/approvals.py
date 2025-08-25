# app/routers/approvals.py
from ._crud_factory import make_crud_router
from .. import models, schemas
router = make_crud_router(
    Model=models.Approval,
    InSchema=schemas.ApprovalIn,
    OutSchema=schemas.ApprovalOut,
    prefix="/approvals",
    tag="Approvals",
    write_roles=["admin"],
)
