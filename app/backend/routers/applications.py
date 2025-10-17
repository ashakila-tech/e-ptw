from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db, get_current_user, require_role

# Factory for list/get/delete
base = make_crud_router(
    Model=models.Application,
    InSchema=schemas.ApplicationIn,
    OutSchema=schemas.ApplicationOut,
    prefix="/applications",
    tag="Applications",
    list_roles=["admin", "user"],
    read_roles=["admin", "user"],
    write_roles=["admin", "user"],
)

router = APIRouter()
router.include_router(base)

# no auth for creating applications
@router.post("/", response_model=schemas.ApplicationOut)
def create_application(
    payload: schemas.ApplicationIn,
    db: Session = Depends(get_db),
):
    obj = models.Application(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{item_id}", response_model=schemas.ApplicationOut,
            dependencies=[Depends(require_role(["admin", "user"]))])
def update_application(
    item_id: int,
    payload: schemas.ApplicationIn,
    db: Session = Depends(get_db),
    me: models.User = Depends(get_current_user),
):
    obj = db.get(models.Application, item_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Application not found")

    # Ensure referenced document exists
    doc = db.get(models.Document, payload.document_id)
    if not doc:
        raise HTTPException(status_code=400, detail="Invalid document_id")

    for k, v in payload.model_dump().items():
        setattr(obj, k, v)
    obj.updated_by = me.id
    db.commit()
    db.refresh(obj)
    return obj