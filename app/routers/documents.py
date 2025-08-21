from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from .. import schemas
from ..utils.updates import apply_model_update

@router.put("/{document_id}", response_model=schemas.DocumentOut)
def update_document(document_id: int, payload: schemas.DocumentIn, db: Session = Depends(get_db)):
    obj = db.get(models.Document, document_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Document not found")
    apply_model_update(obj, payload.model_dump())
    db.commit(); db.refresh(obj)
    return obj

@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Document, document_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Document not found")
    try:
        db.delete(obj); db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Cannot delete: referenced by other records")

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