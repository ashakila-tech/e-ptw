# app/routers/_crud_factory.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Type, Optional, Callable, Any

from ..deps import get_db, require_role

def make_crud_router(
    *,
    Model: Type[Any],
    InSchema: Type[Any],             # default schema for PUT
    OutSchema: Type[Any],
    prefix: str,
    tag: str,
    CreateSchema: Optional[Type[Any]] = None,   # schema for POST
    UpdateSchema: Optional[Type[Any]] = None,   # schema for PUT (partial)
    create_mutator: Optional[Callable[[dict, Session], dict]] = None,
    update_mutator: Optional[Callable[[Any, dict, Session], dict]] = None,
    list_roles: Optional[list[str]] = None,
    read_roles: Optional[list[str]] = None,
    write_roles: Optional[list[str]] = None,
) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=[tag])

    # --- LIST ---
    @router.get("/", response_model=list[OutSchema])
    def list_items(db: Session = Depends(get_db), page: int = 1, page_size: int = 20):
        q = db.query(Model).offset((page - 1) * page_size).limit(page_size)
        return [OutSchema.model_validate(x, from_attributes=True) for x in q.all()]

    # --- GET ---
    @router.get("/{item_id}", response_model=OutSchema)
    def get_item(item_id: int, db: Session = Depends(get_db)):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(404, f"{Model.__name__} not found")
        return OutSchema.model_validate(obj, from_attributes=True)

    # --- CREATE ---
    _CreateSchema = CreateSchema or InSchema

    @router.post("/", response_model=OutSchema)
    def create_item(payload: _CreateSchema, db: Session = Depends(get_db)):
        data = payload.model_dump()
        if create_mutator:
            data = create_mutator(data, db)
        obj = Model(**data)
        db.add(obj); db.commit(); db.refresh(obj)
        return obj

    # --- UPDATE ---
    _UpdateSchema = UpdateSchema or InSchema

    @router.put("/{item_id}", response_model=OutSchema)
    def update_item(item_id: int, payload: _UpdateSchema, db: Session = Depends(get_db)):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(404, f"{Model.__name__} not found")
        data = payload.model_dump(exclude_unset=True)  # only update provided fields
        if update_mutator:
            data = update_mutator(obj, data, db)
        for k, v in data.items():
            setattr(obj, k, v)
        db.commit(); db.refresh(obj)
        return obj

    # --- DELETE ---
    @router.delete("/{item_id}", status_code=204)
    def delete_item(item_id: int, db: Session = Depends(get_db)):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(404, f"{Model.__name__} not found")
        db.delete(obj); db.commit()
        return

    return router
