from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas

router = APIRouter(
  prefix="/locations",
  tags=["Locations"]
)

@router.get("/")
def list_locations(db: Session = Depends(deps.get_db)):
  return db.query(models.Location).all()

@router.post("/")
def create_location(request: schemas.Location, db: Session = Depends(deps.get_db)):
  new_location = models.Location(company_id=request.company_id,
                                 name=request.name)
  db.add(new_location)
  db.commit()
  db.refresh(new_location)
  return new_location