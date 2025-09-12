# # app/routers/documents.py
# from ._crud_factory import make_crud_router
# from .. import models, schemas
# router = make_crud_router(
#     Model=models.Document,
#     InSchema=schemas.DocumentIn,
#     OutSchema=schemas.DocumentOut,
#     prefix="/documents",
#     tag="Documents",
#     write_roles=["admin"],
# )

# app/routers/documents.py
import os, uuid, shutil
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db, require_role

UPLOAD_DIR = "/mnt/data/ptw-uploads"

# --- Generic CRUD (list/get/update/delete) ---
crud_router = make_crud_router(
    Model=models.Document,
    InSchema=schemas.DocumentIn,
    OutSchema=schemas.DocumentOut,
    prefix="/documents",
    tag="Documents",
    write_roles=["admin"],
)

router = APIRouter()
router.include_router(crud_router)


# --- Custom upload endpoint ---
# @router.post("/documents/upload", response_model=schemas.DocumentOut,
#              dependencies=[Depends(require_role(["admin", "user"]))])
# @router.post("/documents/upload", response_model=schemas.DocumentOut)
# def upload_document(
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
# ):
#     now = datetime.utcnow()
#     folder = os.path.join(UPLOAD_DIR, str(now.year), f"{now.month:02d}")
#     os.makedirs(folder, exist_ok=True)

#     ext = os.path.splitext(file.filename)[1]
#     filename = f"{uuid.uuid4().hex}{ext}"
#     filepath = os.path.join(folder, filename)

#     with open(filepath, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     doc = models.Document(
#         name=file.filename,
#         path=filepath,
#         time=now,
#         company_id=1,  # TODO: set properly if multi-company
#     )
#     db.add(doc)
#     db.commit()
#     db.refresh(doc)
#     return schemas.DocumentOut.model_validate(doc, from_attributes=True)

# no auth for uploading documents
@router.post("/documents/upload", response_model=schemas.DocumentOut)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    folder = os.path.join(UPLOAD_DIR, str(now.year), f"{now.month:02d}")
    os.makedirs(folder, exist_ok=True)

    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(folder, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc = models.Document(
        name=file.filename,
        path=filepath,
        time=now,
        company_id=1,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return schemas.DocumentOut.model_validate(doc, from_attributes=True)