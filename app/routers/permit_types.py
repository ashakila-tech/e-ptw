from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..deps import get_db, require_role
from ..utils.pagination import paginate

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
