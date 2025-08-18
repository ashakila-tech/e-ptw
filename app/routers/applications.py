from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from .. import models, schemas
from ..deps import get_db, require_role
from ..utils.pagination import paginate
from ..services.workflow import submit_application, approve_step, reject_step

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.get("/", response_model=dict)
def list_applications(page: int = 1, page_size: int = 20, db: Session = Depends(get_db)):
    q = db.query(models.Application)
    return paginate(q, page, page_size)

@router.get("/{app_id}", response_model=schemas.ApplicationOut)
def get_application(app_id: int, db: Session = Depends(get_db)):
    app = db.get(models.Application, app_id)
    if not app: raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.post("/", response_model=schemas.ApplicationOut, dependencies=[Depends(require_role(["user","admin"]))])
def create_application(payload: schemas.ApplicationIn, db: Session = Depends(get_db)):
    app = models.Application(**payload.dict(), created_by=payload.applicant_id, created_time=datetime.utcnow())
    db.add(app); db.commit(); db.refresh(app)
    return app

@router.post("/{app_id}/submit", dependencies=[Depends(require_role(["user","admin"]))])
def submit(app_id: int, db: Session = Depends(get_db)):
    return submit_application(db, app_id)

@router.post("/{app_id}/approve", dependencies=[Depends(require_role(["admin"]))])
def approve(app_id: int, level: int = Query(..., description="Approval level"), db: Session = Depends(get_db)):
    return approve_step(db, app_id, level)

@router.post("/{app_id}/reject", dependencies=[Depends(require_role(["admin"]))])
def reject(app_id: int, level: int = Query(...), reason: str = Query(""), db: Session = Depends(get_db)):
    return reject_step(db, app_id, level, reason)
