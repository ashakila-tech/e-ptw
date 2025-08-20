from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas

router = APIRouter(
  prefix="/workflows",
  tags=["Workflows"]
)

@router.get("/")
def list_workflows(db: Session = Depends(deps.get_db)):
  return db.query(models.Workflow).all()

@router.post("/")
def create_workflow(request: schemas.Workflow, db: Session = Depends(deps.get_db)):
  new_workflow = models.Workflow(company_id=request.company_id,
                                 permit_type_id=request.permit_type_id,
                                 name=request.name)
  db.add(new_workflow)
  db.commit()
  db.refresh(new_workflow)
  return new_workflow