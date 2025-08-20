from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas
from datetime import datetime

router = APIRouter(
  prefix="/approval-data",
  tags=["Approval Data"]
)

@router.get("/")
def list_approval_data(db: Session = Depends(deps.get_db)):
  return db.query(models.ApprovalData).all()

@router.post("/")
def create_approval_data(request: schemas.ApprovalData, db: Session = Depends(deps.get_db)):
  new_approval_data = models.ApprovalData(company_id=request.company_id,
                                          approval_id=request.approval_id,
                                          workflow_data_id=request.workflow_data_id,
                                          status=request.status,
                                          approver_name=request.approver_name,
                                          time=datetime.utcnow(),
                                          role_name=request.role_name,
                                          level=request.level)
  db.add(new_approval_data)
  db.commit()
  db.refresh(new_approval_data)
  return new_approval_data