from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas
from datetime import datetime

router = APIRouter(
  prefix="/workflow-data",
  tags=["Workflow Data"]
)

@router.get("/")
def list_workflow_data(db: Session = Depends(deps.get_db)):
  return db.query(models.WorkflowData).all()

@router.post("/")
def create_workflow_data(request: schemas.WorkflowData, db: Session = Depends(deps.get_db)):
  new_workflow_data = models.WorkflowData(company_id=request.company_id,
                                          workflow_id=request.workflow_id,
                                          start_time=request.start_time,
                                          end_time=request.end_time,
                                          name=request.name)
  db.add(new_workflow_data)
  db.commit()
  db.refresh(new_workflow_data)
  return new_workflow_data