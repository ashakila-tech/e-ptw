from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas
from ..security import hashing, oauth2

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/")
def list_users(db: Session = Depends(deps.get_db), current_user: schemas.User = Depends(oauth2.get_current_user)):
    return db.query(models.User).all()

@router.post("/")
def create_user(request: schemas.User, db: Session = Depends(deps.get_db)):
    new_user = models.User(company_id=request.company_id,
                           name=request.name,
                           email=request.email,
                           password_hash=hashing.Hash.bcrypt(request.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user