from typing import Optional, Type, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..deps import get_db, require_role  # keep your existing stubs for now
from ..utils.pagination import paginate
from ..utils.updates import apply_model_update

def make_crud_router(
    *,
    Model: Type,              # SQLAlchemy model class
    InSchema: Type,           # Pydantic input schema (POST/PUT)
    OutSchema: Type,          # Pydantic output schema
    prefix: str,              # "/companies"
    tag: str,                 # "Companies"
    list_roles: Optional[List[str]] = None,   # e.g. ["admin","user"]
    read_roles: Optional[List[str]] = None,
    write_roles: Optional[List[str]] = None,  # POST/PUT/DELETE roles
):
    """
    Generates: GET /, GET /{id}, POST /, PUT /{id}, DELETE /{id}
    - List endpoint is paginated and returns {"total","page","page_size","items":[OutSchema,...]}
    - POST/PUT return OutSchema
    - DELETE returns 204 or 409 on FK constraint
    """

    router = APIRouter(prefix=prefix, tags=[tag])

    # Dependencies
    list_deps = [Depends(require_role(list_roles))] if list_roles else []
    read_deps = [Depends(require_role(read_roles))] if read_roles else []
    write_deps = [Depends(require_role(write_roles))] if write_roles else []

    @router.get("/", response_model=dict, dependencies=list_deps)
    def list_items(
        page: int = Query(1, ge=1),
        page_size: int = Query(20, ge=1, le=200),
        db: Session = Depends(get_db),
    ):
        q = db.query(Model)
        return paginate(q, page, page_size, schema=OutSchema)

    @router.get("/{item_id}", response_model=OutSchema, dependencies=read_deps)
    def get_item(item_id: int, db: Session = Depends(get_db)):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{Model.__name__} not found")
        return obj

    @router.post("/", response_model=OutSchema, dependencies=write_deps)
    def create_item(payload: InSchema, db: Session = Depends(get_db)):
        obj = Model(**payload.model_dump())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @router.put("/{item_id}", response_model=OutSchema, dependencies=write_deps)
    def update_item(item_id: int, payload: InSchema, db: Session = Depends(get_db)):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{Model.__name__} not found")
        apply_model_update(obj, payload.model_dump())
        db.commit()
        db.refresh(obj)
        return obj

    @router.delete("/{item_id}", status_code=204, dependencies=write_deps)
    def delete_item(item_id: int, db: Session = Depends(get_db)):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(status_code=404, detail=f"{Model.__name__} not found")
        try:
            db.delete(obj)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Cannot delete: referenced by other records")

    return router
