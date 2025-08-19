from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from .. import schemas, deps, models
from ..security import hashing, token
from sqlalchemy.orm import Session

router = APIRouter(
  	tags=["Authentication"]
)

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(deps.get_db)):
	user = db.query(models.User).filter(models.User.email == form_data.username).first()
	if not user:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail=f"Invalid Credentials"
		)
	
	if not hashing.Hash.verify(user.password_hash, form_data.password):
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail=f"Incorrect password"
		)

	access_token = token.create_access_token(data={"sub": user.email})

	return {"access_token": access_token, "token_type": "bearer"}