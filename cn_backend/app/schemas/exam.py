from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class ExamCreate(BaseModel):
    name: str
    class_id: int
    subject_id: int
    exam_date: Optional[date] = None
    total_marks: int = 100


class ExamOut(BaseModel):
    id: int
    name: str
    class_id: int
    subject_id: int
    exam_date: Optional[date]
    total_marks: int
    subject_name: Optional[str] = None
    class_name: Optional[str] = None

    class Config:
        from_attributes = True


class MarkCreate(BaseModel):
    student_id: int
    exam_id: int
    marks_obtained: float
    grade: Optional[str] = None
    remarks: Optional[str] = None


class MarkUpdate(BaseModel):
    marks_obtained: Optional[float] = None
    grade: Optional[str] = None
    remarks: Optional[str] = None


class MarkOut(BaseModel):
    id: int
    student_id: int
    exam_id: int
    marks_obtained: float
    grade: Optional[str]
    remarks: Optional[str]
    student_name: Optional[str] = None
    exam_name: Optional[str] = None
    subject_name: Optional[str] = None
    total_marks: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
