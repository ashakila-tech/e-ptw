# app/routers/approvals.py
from ._crud_factory import make_crud_router
from .. import models, schemas

#router = make_crud_router(
    #model=models.Approval,  
    #schema_in=schemas.ApprovalIn,
    #schema_out=schemas.ApprovalOut,
    #prefix="/approvals",
    #tags=["approvals"]
    #)

router = make_crud_router(
    Model=models.Approval,
    InSchema=schemas.ApprovalIn,      # ✅ correct
    OutSchema=schemas.ApprovalOut,    # ✅ correct
    prefix="/approvals",
    tags=["approvals"],
    write_roles=["admin"],
    )