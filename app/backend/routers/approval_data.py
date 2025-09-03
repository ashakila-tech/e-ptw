# app/routers/approval_data.py
from ._crud_factory import make_crud_router
from .. import models, schemas
router = make_crud_router(
    Model=models.ApprovalData,
    InSchema=schemas.ApprovalDataIn,
    OutSchema=schemas.ApprovalDataOut,
    prefix="/approval-data",
    tag="Approval Data",
    write_roles=["admin"],
)
