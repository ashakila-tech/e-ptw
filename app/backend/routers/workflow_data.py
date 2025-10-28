from ._crud_factory import make_crud_router
from .. import models, schemas

crud_router = make_crud_router(
    Model=models.WorkflowData,
    InSchema=schemas.WorkflowDataIn,
    OutSchema=schemas.WorkflowDataOut,
    prefix="/workflow-data",
    tag="Workflow Data",
    write_roles=["admin"],
)
