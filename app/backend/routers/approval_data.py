from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
import asyncio
from typing import Optional, List
from datetime import datetime

from ._crud_factory import make_crud_router
from ..deps import get_db
from .. import models, schemas
from ..utils.email import send_notification_email


# Create the base router
router = APIRouter(prefix="/approval-data", tags=["Approval Data"])

@router.post("/", response_model=schemas.ApprovalDataOut)
def create_approval_data(payload: schemas.ApprovalDataIn, db: Session = Depends(get_db)):
    """
    Create approval data with server UTC timestamp.
    """
    payload_dict = payload.model_dump()
    payload_dict["time"] = datetime.utcnow()  # override client-provided time

    obj = models.ApprovalData(**payload_dict)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

# --- Custom filter endpoint ---
@router.get("/filter", response_model=List[schemas.ApprovalDataOut])
def filter_approval_data(
    workflow_data_id: Optional[int] = Query(None, description="Filter by workflow_data_id"),
    approval_id: Optional[int] = Query(None, description="Filter by approval_id"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
):
    """
    Filter approval data records by workflow_data_id, approval_id, or status.
    Returns all if no filters are provided.
    """
    query = db.query(models.ApprovalData)
    if workflow_data_id is not None:
        query = query.filter(models.ApprovalData.workflow_data_id == workflow_data_id)
        query = query.filter(models.ApprovalData.workflow_data_id == workflow_data_id) 
    if approval_id is not None:
        query = query.filter(models.ApprovalData.approval_id == approval_id)
    if status is not None:
        query = query.filter(models.ApprovalData.status == status)

    results = query.all()
    if not results:
        raise HTTPException(status_code=404, detail="No approval data found for given filter")

    return results

@router.post("/create-completion-flow", response_model=List[schemas.ApprovalDataOut])
def create_completion_flow(
    db: Session = Depends(get_db), application_id: int = Query(..., description="The ID of the application to create completion flow for")
):
    """
    Create 'Job Done' and 'Exit Confirmation' approval data for a given application
    when it becomes ACTIVE.
    """ 
    application = db.get(models.Application, application_id)
    if not application:
        raise HTTPException(status_code=404, detail=f"Application with ID {application_id} not found")

    if not application.workflow_data_id:
        raise HTTPException(status_code=400, detail="Application has no workflow data.")

    # 1. Supervisor "Job Done" confirmation
    supervisor_approval = db.query(models.Approval).filter(
        models.Approval.workflow_id == application.workflow_data.workflow_id,
        models.Approval.role_name == "supervisor"
    ).first()

    if not supervisor_approval:
        raise HTTPException(status_code=404, detail="Supervisor role not found in workflow approvals.")

    job_done_data = models.ApprovalData(
        workflow_data_id=application.workflow_data_id,
        approval_id=supervisor_approval.id,
        level=98, # Special level for completion flow
        status="PENDING"
    )
    db.add(job_done_data)
    db.commit()
    db.refresh(job_done_data)

    return [job_done_data]


def _send_notification(db: Session, user_id: int, title: str, message: str):
    """
    Helper to create a notification record and send an email synchronously.
    """
    # 1. Create Notification in DB
    db_notification = models.Notification(
        user_id=user_id,
        title=title,
        message=message
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)

    # 2. Fetch User Email
    user = db.query(models.User).filter(models.User.id == user_id).first()

    # 3. Send Email
    if user and user.email:
        try:
            asyncio.run(send_notification_email(
                subject=title,
                recipients=[user.email],
                body=message
            ))
        except Exception as e:
            print(f"Failed to send email to {user.email}: {e}")


# --- Custom update mutator for approval logic ---
def approval_data_update_mutator(obj: models.ApprovalData, data: dict, db: Session):
    """
    Runs before saving during PUT update.
    Handles approval workflow logic:
    - Promotes next level if current level approved
    - Updates Application status to APPROVED if all approvers approved
    - Updates Application status to REJECTED if any approver rejects
    """
    new_status = data.get("status")
    new_remarks = data.get("remarks")
    approver_name = data.get("approver_name", "System")

    # Update the ApprovalData object itself
    if new_status in {"APPROVED", "REJECTED"} and obj.status != new_status:
        obj.status = new_status
        obj.time = datetime.utcnow()
        if new_remarks is not None:
            obj.remarks = new_remarks
        db.flush()

    # Eagerly load the application to get its details for notifications
    application = db.query(models.Application).filter(
        models.Application.workflow_data_id == obj.workflow_data_id
    ).first()

    # Fetch all approval data for this workflow
    all_approval_data = db.query(models.ApprovalData).filter(
        models.ApprovalData.workflow_data_id == obj.workflow_data_id
    ).all()

    # If any approver rejected, set application status to REJECTED
    if any(a.status == "REJECTED" for a in all_approval_data):
        if application and application.status != "REJECTED":
            application.status = "REJECTED"
            application.updated_time = datetime.utcnow()
            db.commit()
            print(f"Application {application.id} rejected due to an approver rejection!")

            # Notify Applicant of Rejection
            if application.applicant_id:
                title = f"Permit Application Rejected: {application.name}"
                message = f"""
                    <p>DO NOT REPLY TO THIS EMAIL.</p>
                    <p>Your permit application <strong>{application.name}</strong> has been <strong>REJECTED</strong>.</p>
                    <p>
                        <strong>Approver:</strong> {approver_name}<br/>
                        <strong>Remarks:</strong> {new_remarks or "N/A"}
                    </p>
                    <p>Please check the app for more details.</p>
                """
                _send_notification(db, user_id=application.applicant_id, title=title, message=message)
        return data

    # Only run next-level promotion if current approval is APPROVED
    if new_status == "APPROVED":
        # Promote next level if exists
        next_level = db.query(models.ApprovalData).filter(
            models.ApprovalData.workflow_data_id == obj.workflow_data_id,
            models.ApprovalData.level == obj.level + 1
        ).first()

        if next_level and next_level.status == "WAITING":
            next_level.status = "PENDING"
            db.flush()

            # Notify Next Approver
            next_approver_user_id = next_level.approval.user_id
            if next_approver_user_id:
                title = f"Permit Pending Approval: {application.name}"
                message = f"""
                    <p>DO NOT REPLY TO THIS EMAIL.</p>
                    <p>A permit application, <strong>{application.name}</strong>, requires your approval.</p>
                    <p>Please log in to the application to review and take action.</p>
                """
                _send_notification(db, user_id=next_approver_user_id, title=title, message=message)

        # If all approvals are approved, update the application status
        if all(a.status == "APPROVED" for a in all_approval_data):
            if application and application.status != "APPROVED":
                application.status = "APPROVED"
                application.updated_time = datetime.utcnow()
                db.commit()
                print(f"Application {application.id} fully approved!")

                # Notify Applicant of Final Approval
                if application.applicant_id:
                    title = f"Permit Application Approved: {application.name}"
                    message = f"""
                        <p>DO NOT REPLY TO THIS EMAIL.</p>
                        <p>Congratulations! Your permit application <strong>{application.name}</strong> has been fully <strong>APPROVED</strong>.</p>
                        <p>Please check the app for more details.</p>
                    """
                    _send_notification(db, user_id=application.applicant_id, title=title, message=message)
        
        # Custom logic for completion flow
        if obj.level == 98: # Check for special completion flow level
            if application:
                application.status = "EXIT_PENDING"
                application.updated_time = datetime.utcnow()
                db.commit()

    return data


# --- Attach the CRUD routes ---
crud_router = make_crud_router(
    Model=models.ApprovalData,
    InSchema=schemas.ApprovalDataIn,
    OutSchema=schemas.ApprovalDataOut,
    prefix="",
    tag="Approval Data",
    write_roles=["admin", "supervisor", "safety", "manager"],
    update_mutator=approval_data_update_mutator,  # attach custom logic
)

router.include_router(crud_router)