# app/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from .database import get_db  # <- import directly now
from .security import token as _token
from . import models

# Bypass token requirement
def oauth2_scheme():
    return None

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    # Temporarily bypass authentication - return first user
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No users in database",
        )
    return user

def require_role(roles):
    def _guard(user: models.User = Depends(get_current_user)):
        # Temporarily bypass role checks
        return user
    return _guard
