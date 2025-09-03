# app/routers/companies.py
from ._crud_factory import make_crud_router
from .. import models, schemas
router = make_crud_router(
    Model=models.Company,
    InSchema=schemas.CompanyIn,
    OutSchema=schemas.CompanyOut,
    prefix="/companies",
    tag="Companies",
    list_roles=None, read_roles=None, write_roles=["admin"],  # adjust as needed
)
