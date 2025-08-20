from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas
from datetime import datetime

router = APIRouter(
  prefix="/documents",
  tags=["Documents"]
)

@router.get("/")
def list_documents(db: Session = Depends(deps.get_db)):
  return db.query(models.Document).all()

@router.post("/")
def create_document(request: schemas.Document, db: Session = Depends(deps.get_db)):
  new_document = models.Document(company_id=request.company_id,
                                 name=request.name,
                                 path=request.path,
                                 time=datetime.utcnow())
  db.add(new_document)
  db.commit()
  db.refresh(new_document)
  return new_document