# app/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from .database import get_db
from .security import token as _token
from . import models
from .config import settings

# Use real OAuth2 token scheme (instead of bypass)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """Extract user from JWT token and fetch from DB"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        # Get user id from token
        user_id: int = payload.get("uid")
        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Fetch user from DB
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise credentials_exception

    return user


def require_role(roles):
    """Role-based access guard"""
    def _guard(user: models.User = Depends(get_current_user)):
        # Implement real role logic later
        if roles and getattr(user, "role", None) not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )
        return user
    return _guard