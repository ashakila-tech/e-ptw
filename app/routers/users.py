from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import deps, models, schemas
from ..security import hashing, oauth2
from sqlalchemy.exc import IntegrityError
from .. import schemas
from ..utils.updates import apply_model_update

@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, payload: schemas.UserIn, db: Session = Depends(get_db)):
    obj = db.get(models.User, user_id)
    if not obj:
        raise HTTPException(status_code=404, detail="User not found")
    apply_model_update(obj, payload.model_dump())
    db.commit(); db.refresh(obj)
    return obj

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    obj = db.get(models.User, user_id)
    if not obj:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        db.delete(obj); db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Cannot delete: referenced by other records")

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