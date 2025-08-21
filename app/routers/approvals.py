from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas
from sqlalchemy.exc import IntegrityError
from .. import schemas
from ..utils.updates import apply_model_update

@router.put("/{approval_id}", response_model=schemas.ApprovalOut)
def update_approval(approval_id: int, payload: schemas.ApprovalIn, db: Session = Depends(get_db)):
    obj = db.get(models.Approval, approval_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Approval not found")
    apply_model_update(obj, payload.model_dump())
    db.commit(); db.refresh(obj)
    return obj

@router.delete("/{approval_id}", status_code=204)
def delete_approval(approval_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Approval, approval_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Approval not found")
    try:
        db.delete(obj); db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Cannot delete: referenced by other records")

router = APIRouter(
  prefix="/approvals",
  tags=["Approvals"]
)

@router.get("/")
def list_approvals(db: Session = Depends(deps.get_db)):
  return db.query(models.Approval).all()

@router.post("/")
def create_approval(request: schemas.Approval, db: Session = Depends(deps.get_db)):
  new_approval = models.Approval(company_id=request.company_id,
                                 workflow_id=request.workflow_id,
                                 user_group_id=request.user_group_id,
                                 user_id=request.user_id,
                                 name=request.name,
                                 role_name=request.role_name,
                                 level=request.level)
  db.add(new_approval)
  db.commit()
  db.refresh(new_approval)
  return new_approval