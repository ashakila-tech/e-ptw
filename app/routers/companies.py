from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas

router = APIRouter(
  prefix="/companies",
  tags=["Companies"]
)

@router.get("/")
def list_companies(db: Session = Depends(deps.get_db)):
  return db.query(models.Company).all()

@router.post("/")
def create_company(request: schemas.Company, db: Session = Depends(deps.get_db)):
  new_company = models.Company(name=request.name)
  db.add(new_company)
  db.commit()
  db.refresh(new_company)
  return new_company