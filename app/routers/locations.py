from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas
from sqlalchemy.exc import IntegrityError
from .. import schemas
from ..utils.updates import apply_model_update

@router.put("/{location_id}", response_model=schemas.LocationOut)
def update_location(location_id: int, payload: schemas.LocationIn, db: Session = Depends(get_db)):
    obj = db.get(models.Location, location_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Location not found")
    apply_model_update(obj, payload.model_dump())
    db.commit(); db.refresh(obj)
    return obj

@router.delete("/{location_id}", status_code=204)
def delete_location(location_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Location, location_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Location not found")
    try:
        db.delete(obj); db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Cannot delete: referenced by other records")

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