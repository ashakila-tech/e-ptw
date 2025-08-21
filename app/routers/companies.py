# app/routers/companies.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from .. import models, schemas
from ..deps import get_db
from ..utils.pagination import paginate
from ..utils.updates import apply_model_update

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.get("/", response_model=dict)
def list_companies(page: int = 1, page_size: int = 20, db: Session = Depends(get_db)):
    q = db.query(models.Company)
    return paginate(q, page, page_size, schema=schemas.CompanyOut)

@router.get("/{company_id}", response_model=schemas.CompanyOut)
def get_company(company_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Company, company_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Company not found")
    return obj

@router.post("/", response_model=schemas.CompanyOut)
def create_company(payload: schemas.CompanyIn, db: Session = Depends(get_db)):
    obj = models.Company(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/{company_id}", response_model=schemas.CompanyOut)
def update_company(company_id: int, payload: schemas.CompanyIn, db: Session = Depends(get_db)):
    obj = db.get(models.Company, company_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Company not found")
    apply_model_update(obj, payload.model_dump())
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{company_id}", status_code=204)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Company, company_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Company not found")
    try:
        db.delete(obj)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Cannot delete: referenced by other records")
