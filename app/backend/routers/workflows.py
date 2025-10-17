from ._crud_factory import make_crud_router
from .. import models, schemas
router = make_crud_router(
    Model=models.Workflow,
    InSchema=schemas.WorkflowIn,
    OutSchema=schemas.WorkflowOut,
    prefix="/workflows",
    tag="Workflows",
    write_roles=["admin"],
)
