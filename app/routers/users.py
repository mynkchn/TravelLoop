from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.models import User
from app.schemas.schemas import UserResponse, UserUpdate
from app.auth import get_current_user, hash_password

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(body: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if body.name is not None:
        current_user.name = body.name
    if body.photo_url is not None:
        current_user.photo_url = body.photo_url
    if body.language is not None:
        current_user.language = body.language
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/me/password")
def change_password(
    old_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.auth import verify_password
    if not verify_password(old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Old password is incorrect")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    current_user.hashed_password = hash_password(new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.delete("/me")
def delete_account(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.is_active = False
    db.commit()
    return {"message": "Account deactivated"}
