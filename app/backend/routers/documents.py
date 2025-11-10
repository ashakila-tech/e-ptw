from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os, shutil, mimetypes
from datetime import datetime

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db

UPLOAD_DIR = "uploads"

# Create the base router
router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=schemas.DocumentOut)
def upload_document(
    company_id: int,
    name: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a document and store it in the server.
    """
    allowed = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/jpeg",
        "image/png",
    }
    if file.content_type not in allowed:
        raise HTTPException(400, detail=f"Unsupported file type: {file.content_type}")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    safe_name = file.filename.replace("/", "_").replace("\\", "_")
    path = os.path.join(UPLOAD_DIR, safe_name)

    with open(path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    # Set server time
    doc = models.Document(
        company_id=company_id,
        name=name,
        path=path,
        time=datetime.utcnow()   # store current UTC time
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

# @router.post("/upload", response_model=schemas.DocumentOut)
# def upload_document(
#     company_id: int,
#     name: str,
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db),
# ):
#     """
#     Upload a document and store it in the server.
#     """
#     allowed = {
#         "application/pdf",
#         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
#         "application/vnd.openxmlformats-officedocument.presentationml.presentation",
#         "image/jpeg",
#         "image/png",
#     }
#     if file.content_type not in allowed:
#         raise HTTPException(400, detail=f"Unsupported file type: {file.content_type}")

#     os.makedirs(UPLOAD_DIR, exist_ok=True)
#     safe_name = file.filename.replace("/", "_").replace("\\", "_")
#     path = os.path.join(UPLOAD_DIR, safe_name)

#     with open(path, "wb") as buf:
#         shutil.copyfileobj(file.file, buf)

#     doc = models.Document(company_id=company_id, name=name, path=path)
#     db.add(doc); db.commit(); db.refresh(doc)
#     return doc

@router.get("/{doc_id}/download")
def download_document(doc_id: int, db: Session = Depends(get_db)):
    """
    Download a document from the server by its ID.
    """
    doc = db.get(models.Document, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    if not os.path.exists(doc.path):
        raise HTTPException(410, "File missing on server")
    ctype = mimetypes.guess_type(doc.path)[0] or "application/octet-stream"
    return FileResponse(path=doc.path, media_type=ctype, filename=os.path.basename(doc.path))

@router.delete("/{doc_id}", status_code=204)
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    """
    Delete a document record and its file from the server.
    """
    doc = db.get(models.Document, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    try:
        if doc.path and os.path.exists(doc.path):
            os.remove(doc.path)
    except Exception:
        pass
    db.delete(doc); db.commit()
    return

# Attach the CRUD routes, GET/POST/PUT/DELETE
crud_router = make_crud_router(
    Model=models.Document,
    InSchema=schemas.DocumentUpdate,   # used for PUT (partial)
    OutSchema=schemas.DocumentOut,
    prefix="",
    tag="Documents",
    list_roles=None,
    read_roles=None,
    write_roles=None,                  # open for now; tighten later
)

router.include_router(crud_router)    # GET list/get, PUT
