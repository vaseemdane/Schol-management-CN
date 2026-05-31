from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class AttendanceCreate(BaseModel):
    student_id: int
    class_id: int
    date: date
    status: str = "present"  # present/absent/late


class AttendanceBulkCreate(BaseModel):
    class_id: int
    date: date
    records: List[dict]  # [{"student_id": 1, "status": "present"}, ...]


class AttendanceUpdate(BaseModel):
    status: str


class AttendanceOut(BaseModel):
    id: int
    student_id: int
    class_id: int
    date: date
    status: str
    student_name: Optional[str] = None
    roll_number: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
