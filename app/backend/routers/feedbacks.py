from fastapi import APIRouter
from ._crud_factory import make_crud_router
from .. import models, schemas

# Create the base router
router = APIRouter(prefix="/feedbacks", tags=["Feedbacks"])

# Attach the CRUD routes, GET/POST/PUT/DELETE
crud_router = make_crud_router(
    Model=models.Feedback,
    InSchema=schemas.FeedbackIn,
    OutSchema=schemas.FeedbackOut,
    UpdateSchema=schemas.FeedbackUpdate,
    prefix="",
    tag="Feedbacks",
    list_roles=None,    # allow all authenticated users
    read_roles=None,    # allow all authenticated users
    write_roles=None,   # allow all authenticated users (to create feedback)
)

router.include_router(crud_router)