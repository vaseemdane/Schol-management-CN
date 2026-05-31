from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StudentCreate(BaseModel):
    name: str
    mobile: str
    password: str
    roll_number: str
    class_id: int
    section: str
    medium: str
    parent_name: Optional[str] = None
    parent_mobile: Optional[str] = None
    address: Optional[str] = None


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    roll_number: Optional[str] = None
    class_id: Optional[int] = None
    section: Optional[str] = None
    medium: Optional[str] = None
    parent_name: Optional[str] = None
    parent_mobile: Optional[str] = None
    address: Optional[str] = None


class StudentOut(BaseModel):
    id: int
    user_id: int
    name: str
    roll_number: str
    class_id: int
    section: str
    medium: str
    parent_name: Optional[str]
    parent_mobile: Optional[str]
    address: Optional[str]
    mobile: Optional[str] = None
    class_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
