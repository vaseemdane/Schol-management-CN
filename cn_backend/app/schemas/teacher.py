from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TeacherCreate(BaseModel):
    name: str
    mobile: str
    password: str
    medium: str
    qualification: Optional[str] = None
    monthly_salary: Optional[float] = 0
    assigned_classes: Optional[List[int]] = []
    assigned_subjects: Optional[List[int]] = []


class TeacherUpdate(BaseModel):
    name: Optional[str] = None
    medium: Optional[str] = None
    qualification: Optional[str] = None
    monthly_salary: Optional[float] = None
    assigned_classes: Optional[List[int]] = None
    assigned_subjects: Optional[List[int]] = None
    password: Optional[str] = None


class TeacherOut(BaseModel):
    id: int
    user_id: int
    name: str
    medium: str
    qualification: Optional[str]
    monthly_salary: float
    assigned_classes: Optional[str]
    assigned_subjects: Optional[str]
    mobile: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
