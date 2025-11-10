from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..deps import get_db, get_current_user
from ..security import hashing, token
from ..config import settings

from ..utils import roles  # import helper

CONTRACTOR_GROUP_ID = 4 # Assuming 4 is the ID for 'Contractor' group

# Create the base router
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.TokenOut)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    # print (form_data)
    # OAuth2PasswordRequestForm has .username and .password
    user = db.query(models.User).filter(
        func.lower(models.User.email) == form_data.username.lower()
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not user.password_hash or not hashing.Hash.verify(user.password_hash, form_data.password):
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

@router.post("/register-applicant")
def register_applicant(request: schemas.UserCreate, db: Session = Depends(get_db)):
    new_user = models.User(
        company_id=request.company_id,
        name=request.name,
        email=request.email,
        user_type=request.user_type,
        password_hash=hashing.Hash.make(request.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Assign default group (Contractor)
    user_group = models.UserGroup(
        user_id=new_user.id,
        group_id=CONTRACTOR_GROUP_ID,
    )
    db.add(user_group)
    db.commit()
    db.refresh(user_group)

    return {
        "user": new_user,
        "group": user_group,
        "message": "User registered successfully as Contractor.",
    }


@router.get("/me")
def get_me(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Query user’s groups with join
    user_groups = (
        db.query(models.UserGroup, models.Group)
        .join(models.Group, models.UserGroup.group_id == models.Group.id)
        .filter(models.UserGroup.user_id == current_user.id)
        .all()
    )

    # Extract IDs and names
    group_ids = [g.Group.id for g in user_groups]
    group_names = [g.Group.name for g in user_groups]

    # use the centralized role helper
    is_approver = roles.is_user_approver(group_ids, group_names)

    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "groups": [{"id": gid, "name": gname} for gid, gname in zip(group_ids, group_names)],
        "is_approver": is_approver,
    }

# @router.get("/me", response_model=schemas.UserOut)
# def me(current_user: models.User = Depends(get_current_user)):
#     # get_current_user returns the ORM user; FastAPI will serialize via UserOut
#     return current_user