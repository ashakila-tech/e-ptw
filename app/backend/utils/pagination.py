from typing import Optional, Type

def paginate(query, page: int = 1, page_size: int = 20, schema: Optional[Type] = None):
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    if schema is not None:
        # SQLAlchemy ORM -> Pydantic model objects
        items = [schema.model_validate(i, from_attributes=True) for i in items]
    return {"total": total, "page": page, "page_size": page_size, "items": items}
