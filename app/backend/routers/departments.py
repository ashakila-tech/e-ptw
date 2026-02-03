from fastapi import APIRouter
from ._crud_factory import make_crud_router
from .. import models, schemas

router = APIRouter(prefix="/departments", tags=["Departments"])

crud_router = make_crud_router(
    Model=models.Department,
    InSchema=schemas.DepartmentIn,
    OutSchema=schemas.DepartmentOut,
    UpdateSchema=schemas.DepartmentUpdate,
    prefix="",
    tag="Departments"
)

router.include_router(crud_router)