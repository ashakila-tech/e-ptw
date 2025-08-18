from fastapi import Depends, Header, HTTPException
from .database import SessionLocal

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def require_role(roles: list[str]):
    async def _guard(x_role: str | None = Header(default=None)):
        if x_role is None or x_role.lower() not in [r.lower() for r in roles]:
            raise HTTPException(status_code=403, detail="Forbidden")
    return _guard
