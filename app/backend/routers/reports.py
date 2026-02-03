from fastapi import APIRouter
from ._crud_factory import make_crud_router
from .. import models, schemas

router = APIRouter(prefix="/reports", tags=["Reports"])

crud_router = make_crud_router(
    Model=models.Report,
    InSchema=schemas.ReportIn,
    OutSchema=schemas.ReportOut,
    UpdateSchema=schemas.ReportUpdate,
    prefix="",
    tag="Reports"
)

router.include_router(crud_router)