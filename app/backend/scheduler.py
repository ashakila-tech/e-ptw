from sqlalchemy.orm import Session, joinedload
from datetime import datetime
import logging

from . import models
from .database import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def check_and_complete_expired_permits():
    """
    Scheduled job to find active permits where the work end time has passed
    and update their status to COMPLETED.
    """
    db: Session = SessionLocal()
    try:
        now = datetime.utcnow()
        
        # Query for active applications and eager-load workflow_data
        expired_permits = db.query(models.Application).options(
            joinedload(models.Application.workflow_data)
        ).filter(
            models.Application.status == "ACTIVE",
            models.Application.workflow_data.has(models.WorkflowData.end_time < now)
        ).all()

        for permit in expired_permits:
            permit.status = "COMPLETED"
            permit.updated_time = now
            logger.info(f"Permit ID {permit.id} automatically set to COMPLETED.")

        db.commit()
    finally:
        db.close()
