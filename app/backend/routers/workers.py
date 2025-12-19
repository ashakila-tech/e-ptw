from fastapi import APIRouter, Depends, Query, Form, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import shutil
import uuid
from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db

router = APIRouter(prefix="/workers", tags=["Workers"])

UPLOADS_DIR = "/app/ptw-uploads"

@router.post("/", response_model=schemas.WorkerOut, status_code=status.HTTP_201_CREATED)
def create_worker_with_picture(
    *,
    db: Session = Depends(get_db),
    company_id: int = Form(...),
    name: str = Form(...),
    ic_passport: str = Form(...),
    contact: Optional[str] = Form(None),
    employment_status: Optional[str] = Form(None),
    employment_type: Optional[str] = Form(None),
    position: Optional[str] = Form(None),
    picture: Optional[UploadFile] = File(None),
):
    """
    Create a new worker, with an optional picture upload.
    """
    picture_path = None
    if picture:
        # Define the path: workers/{company_id}/picture/{uuid}_{filename}
        file_dir = os.path.join(UPLOADS_DIR, "workers", str(company_id), "picture")
        os.makedirs(file_dir, exist_ok=True)

        # Create a unique filename to prevent overwrites
        filename = f"{uuid.uuid4()}_{picture.filename}"
        picture_path = os.path.join(file_dir, filename)

        # Save the file
        with open(picture_path, "wb") as buffer:
            shutil.copyfileobj(picture.file, buffer)

        # Store the relative path for API responses
        picture_path = os.path.join("workers", str(company_id), "picture", filename)

    db_worker = models.Worker(company_id=company_id, name=name, ic_passport=ic_passport, contact=contact, employment_status=employment_status, employment_type=employment_type, position=position, picture=picture_path)
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

# Custom filter endpoint
@router.get("/filter", response_model=List[schemas.WorkerOut])
def get_workers_by_company(
    company_id: Optional[int] = Query(None, description="Filter by company_id"),
    db: Session = Depends(get_db),
):
    """Filter workers by company_id."""
    query = db.query(models.Worker)
    if company_id:
        query = query.filter(models.Worker.company_id == company_id)
    return query.all()


# The generic CRUD router is still useful for GET (one), GET (all), DELETE.
crud_router = make_crud_router(
    Model=models.Worker,
    InSchema=schemas.WorkerIn,
    OutSchema=schemas.WorkerOut,
    prefix="",
    tag="Workers",
    write_roles=["admin"],
    methods=["GET", "DELETE"] # Exclude POST, which is now handled above
)

router.include_router(crud_router)