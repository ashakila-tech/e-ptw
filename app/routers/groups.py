from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas

router = APIRouter(
  prefix="/groups",
  tags=["Groups"]
)

@router.get("/")
def list_groups(db: Session = Depends(deps.get_db)):
  return db.query(models.Group).all()

@router.post("/")
def create_group(request: schemas.Group, db: Session = Depends(deps.get_db)):
  new_group = models.Group(company_id=request.company_id,
                           name=request.name)
  db.add(new_group)
  db.commit()
  db.refresh(new_group)
  return new_group