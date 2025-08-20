from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas

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