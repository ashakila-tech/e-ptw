from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_user
from ..security import hashing, token
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.TokenOut)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
   # print (form_data)
    # OAuth2PasswordRequestForm has .username and .password
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not user.password_hash or not hashing.Hash.verify(user.password_hash, form_data.password):
   #if not hashing.Hash.verify(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = token.create_access_token(
        data={"sub": user.email, "uid": user.id, "company_id": getattr(user, "company_id", None)},
        expires_delta=access_token_expires,
    )
    return schemas.TokenOut(access_token=access_token, token_type="bearer")

@router.post("/register")
def create(request: schemas.UserCreate, db: Session = Depends(get_db)):
    new_user = models.User(company_id=request.company_id,
                           name=request.name,
                           email=request.email,
                           user_type=request.user_type,
                           password_hash=hashing.Hash.make(request.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    # get_current_user returns the ORM user; FastAPI will serialize via UserOut
    return current_user