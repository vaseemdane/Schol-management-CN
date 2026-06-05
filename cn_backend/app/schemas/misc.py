from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CertificateCreate(BaseModel):
    student_id: int
    certificate_type: str  # bonafide, study, transfer


class CertificateUpdate(BaseModel):
    content: str


class CertificateOut(BaseModel):
    id: int
    student_id: int
    certificate_type: str
    issued_date: datetime
    content: Optional[str]
    student_name: Optional[str] = None

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    title: str
    message: str
    target_role: Optional[str] = None
    notification_type: str = "general"


class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    target_role: Optional[str]
    notification_type: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ClassCreate(BaseModel):
    name: str
    section: str
    medium: str
    teacher_id: Optional[int] = None


class ClassOut(BaseModel):
    id: int
    name: str
    section: str
    medium: str
    teacher_id: Optional[int]

    class Config:
        from_attributes = True


class SubjectCreate(BaseModel):
    name: str
    class_id: int


class SubjectOut(BaseModel):
    id: int
    name: str
    class_id: int

    class Config:
        from_attributes = True
