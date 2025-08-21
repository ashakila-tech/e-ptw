
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Type, Callable
from ..deps import get_db
from ..utils.pagination import paginate
from ..utils.updates import apply_model_update

def make_crud_router(
    *,
    Model: Type,
    InSchema: Type,
    OutSchema: Type,
    prefix: str,
    tag: str,
    id_name: str = "id",
    get_query: Callable[[Session], any] = None,  # optional: customize base query (e.g., filter by company)
):
    router = APIRouter(prefix=prefix, tags=[tag])

    def _q(db: Session):
        return get_query(db) if get_query else db.query(Model)

    @router.get("/", response_model=dict)
    def list_items(page: int = 1, page_size: int = 20, db: Session = Depends(get_db)):
        return paginate(_q(db), page, page_size, schema=OutSchema)

    @router.get(f"/{{{id_name}}}", response_model=OutSchema)
    def get_item(item_id: int, db: Session = Depends(get_db)):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{tag[:-1] if tag.endswith('s') else tag} not found")
        return obj

    @router.post("/", response_model=OutSchema)
    def create_item(payload: InSchema, db: Session = Depends(get_db)):
        obj = Model(**payload.model_dump())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @router.put(f"/{{{id_name}}}", response_model=OutSchema)
    def update_item(item_id: int, payload: InSchema, db: Session = Depends(get_db)):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{tag[:-1] if tag.endswith('s') else tag} not found")
        apply_model_update(obj, payload.model_dump())
        db.commit()
        db.refresh(obj)
        return obj

    @router.delete(f"/{{{id_name}}}", status_code=204)
    def delete_item(item_id: int, db: Session = Depends(get_db)):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{tag[:-1] if tag.endswith('s') else tag} not found")
        try:
            db.delete(obj)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Cannot delete: referenced by other records")

    return router
