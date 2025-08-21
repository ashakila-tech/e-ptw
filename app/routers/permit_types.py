from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..deps import get_db, require_role
from ..utils.pagination import paginate
from sqlalchemy.exc import IntegrityError
from ..utils.updates import apply_model_update

@router.put("/{permit_type_id}", response_model=schemas.PermitTypeOut, dependencies=[Depends(require_role(["admin"]))])
def update_permit_type(permit_type_id: int, payload: schemas.PermitTypeIn, db: Session = Depends(get_db)):
    obj = db.get(models.PermitType, permit_type_id)
    if not obj:
        raise HTTPException(status_code=404, detail="PermitType not found")
    apply_model_update(obj, payload.model_dump())
    db.commit(); db.refresh(obj)
    return obj

@router.delete("/{permit_type_id}", status_code=204, dependencies=[Depends(require_role(["admin"]))])
def delete_permit_type(permit_type_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.PermitType, permit_type_id)
    if not obj:
        raise HTTPException(status_code=404, detail="PermitType not found")
    try:
        db.delete(obj); db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Cannot delete: referenced by other records")

router = APIRouter(prefix="/permit-types", tags=["Permit Types"])

@router.get("/", response_model=dict)
def list_permit_types(page: int = 1, page_size: int = 20, db: Session = Depends(get_db)):
    q = db.query(models.PermitType)
    return paginate(q, page, page_size)

@router.post("/", response_model=schemas.PermitTypeOut, dependencies=[Depends(require_role(["admin"]))])
def create_permit_type(payload: schemas.PermitTypeIn, db: Session = Depends(get_db)):
    pt = models.PermitType(**payload.dict())
    db.add(pt); db.commit(); db.refresh(pt)
    return pt
