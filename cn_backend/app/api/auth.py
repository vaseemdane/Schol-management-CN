import json
import random
import string
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, verify_password, get_password_hash
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest, Token, UserCreate, UserOut,
    ForgotPasswordResetRequest, UpdateUsernameRequest,
    UpdatePasswordRequest, UpdateSecurityQuestionRequest
)
from app.core.deps import get_current_user, require_admin

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.mobile == request.mobile).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid mobile or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account deactivated")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id), "role": user.role})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.role,
        user_id=user.id,
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/users", response_model=UserOut)
def create_user(data: UserCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    existing = db.query(User).filter(User.mobile == data.mobile).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mobile number already registered")
    user = User(
        mobile=data.mobile,
        password_hash=get_password_hash(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/forgot-password/question")
def get_forgot_password_question(mobile: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.mobile == mobile).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "admin":
        raise HTTPException(status_code=400, detail="Forgot password is only available for Admin accounts")
    if not user.security_question:
        raise HTTPException(status_code=400, detail="Security question not set for this account")
    return {"security_question": user.security_question}


@router.post("/forgot-password/reset")
def reset_password(data: ForgotPasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.mobile == data.mobile).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "admin":
        raise HTTPException(status_code=400, detail="Forgot password is only available for Admin accounts")
    if not user.security_answer:
        raise HTTPException(status_code=400, detail="Security question/answer is not set for this account")
    
    ans = data.security_answer.strip().lower()
    if not verify_password(ans, user.security_answer):
        raise HTTPException(status_code=400, detail="Incorrect security answer")
    
    if len(data.new_password.strip()) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
    user.password_hash = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password reset successful"}


@router.put("/settings/username", response_model=UserOut)
def update_username(
    data: UpdateUsernameRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    new_username = data.new_username.strip()
    if not new_username.isdigit() or not (10 <= len(new_username) <= 15):
        raise HTTPException(status_code=400, detail="Username must be a valid 10-15 digit mobile number")
        
    existing = db.query(User).filter(User.mobile == new_username).first()
    if existing and existing.id != current_user.id:
        raise HTTPException(status_code=400, detail="Username (mobile number) is already taken")
        
    current_user.mobile = new_username
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/settings/password")
def update_password(
    data: UpdatePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    if len(data.new_password.strip()) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
        
    current_user.password_hash = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.put("/settings/security-question")
def update_security_question(
    data: UpdateSecurityQuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    question = data.security_question.strip()
    answer = data.security_answer.strip().lower()
    
    if not question:
        raise HTTPException(status_code=400, detail="Security question cannot be empty")
    if not answer:
        raise HTTPException(status_code=400, detail="Security answer cannot be empty")
        
    current_user.security_question = question
    current_user.security_answer = get_password_hash(answer)
    db.commit()
    return {"message": "Security question and answer updated successfully"}
