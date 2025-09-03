# app/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from .database import get_db  # <- import directly now
from .security import token as _token
from . import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = _token.decode_token(token)
        email: str = payload.get("sub")
    except JWTError:
        raise credentials_exception

    if not email:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise credentials_exception

    return user

def require_role(roles):
    def _guard(user: models.User = Depends(get_current_user)):
        if not roles:
            return user
        if getattr(user, "role", None) in roles:
            return user
        raise HTTPException(status_code=403, detail="Forbidden")
    return _guard
