from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os, shutil, mimetypes, uuid
from datetime import datetime

from ._crud_factory import make_crud_router
from .. import models, schemas
from ..deps import get_db

UPLOAD_DIR = "/app/ptw-uploads"

# Create the base router
router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload", response_model=schemas.DocumentOut)
def upload_document(
    company_id: int = Form(...),
    name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a document and store it in /uploads/<year>/<month>/.
    """

    allowed = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # .docx
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",        # .xlsx
        "application/vnd.ms-excel",                                                # .xls
        "text/csv",                                                                # .csv
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",# .pptx
        "image/jpeg",
        "image/png",
    }

    if file.content_type not in allowed:
        raise HTTPException(400, detail=f"Unsupported file type: {file.content_type}")

    # Build year/month path
    now = datetime.utcnow()
    year = now.strftime("%Y")
    month = now.strftime("%m")

    base_upload_dir = UPLOAD_DIR
    target_dir = os.path.join(base_upload_dir, year, month)

    os.makedirs(target_dir, exist_ok=True)

    # Create safe + unique filename
    base, ext = os.path.splitext(file.filename)
    safe_base = "".join(c for c in base if c.isalnum() or c in (" ", "_", "-")).rstrip()

    unique_id = uuid.uuid4().hex[:8]
    timestamp = now.strftime("%Y%m%d%H%M%S")
    unique_filename = f"{timestamp}_{unique_id}_{safe_base}{ext}"

    full_path = os.path.join(target_dir, unique_filename)

    # Write the file
    with open(full_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save DB record
    doc = models.Document(
        company_id=company_id,
        name=name,
        path=full_path,
        time=now,
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    return doc

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

    # Ensure the filename for download has the correct extension
    download_name = doc.name
    _, stored_ext = os.path.splitext(doc.path)
    # If the display name doesn't have an extension, append the one from the stored file
    if stored_ext and not download_name.lower().endswith(stored_ext.lower()):
        download_name += stored_ext

    return FileResponse(path=doc.path, media_type=ctype, filename=download_name)

@router.get("/{doc_id}/view")
def view_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.get(models.Document, doc_id)
    if not doc:
        raise HTTPException(404, "Document not found")

    if not os.path.exists(doc.path):
        raise HTTPException(410, "File missing")

    ctype = mimetypes.guess_type(doc.path)[0] or "application/octet-stream"
    filename = os.path.basename(doc.path)

    return FileResponse(
        path=doc.path,
        media_type=ctype,
        filename=filename,
        headers={
            # CRITICAL for Android intents
            "Content-Disposition": f'inline; filename="{filename}"'
        }
    )

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
    read_roles=None, # GET / and GET /{id}
    write_roles=None, # PUT /{id}
    enable_create=False, # Disable POST /
    enable_delete=False, # Disable DELETE /{id}
)

router.include_router(crud_router)    # GET list/get, PUT
