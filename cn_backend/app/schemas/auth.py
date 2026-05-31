from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: int


class LoginRequest(BaseModel):
    mobile: str
    password: str


class UserOut(BaseModel):
    id: int
    mobile: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    mobile: str
    password: str
    role: str


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


class ForgotPasswordResetRequest(BaseModel):
    mobile: str
    security_answer: str
    new_password: str


class UpdateUsernameRequest(BaseModel):
    new_username: str


class UpdatePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UpdateSecurityQuestionRequest(BaseModel):
    security_question: str
    security_answer: str
