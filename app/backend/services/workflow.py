from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from .. import models

def submit_application(db: Session, app_id: int):
    app = db.get(models.Application, app_id)
    if not app: raise HTTPException(status_code=404, detail="Application not found")
    app.status = "SUBMITTED"; app.updated_time = datetime.utcnow()
    db.commit(); db.refresh(app)
    return {"message":"submitted","application_id":app.id,"status":app.status}

def approve_step(db: Session, app_id: int, level: int):
    app = db.get(models.Application, app_id)
    if not app: raise HTTPException(status_code=404, detail="Application not found")
    app.status = "APPROVED"; app.updated_time = datetime.utcnow()
    db.commit(); db.refresh(app)
    return {"message":"approved","application_id":app.id,"status":app.status,"level":level}

def reject_step(db: Session, app_id: int, level: int, reason: str):
    app = db.get(models.Application, app_id)
    if not app: raise HTTPException(status_code=404, detail="Application not found")
    app.status = "REJECTED"; app.updated_time = datetime.utcnow()
    db.commit(); db.refresh(app)
    return {"message":"rejected","application_id":app.id,"status":app.status,"level":level,"reason":reason}
