from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class FeeCreate(BaseModel):
    student_id: int
    total_amount: float
    academic_year: str = "2024-25"


class FeeUpdate(BaseModel):
    total_amount: Optional[float] = None
    academic_year: Optional[str] = None


class FeePaymentCreate(BaseModel):
    fee_id: int
    amount: float
    remarks: Optional[str] = None


class FeePaymentUpdate(BaseModel):
    amount: Optional[float] = None
    remarks: Optional[str] = None


class FeePaymentOut(BaseModel):
    id: int
    fee_id: int
    amount: float
    payment_date: datetime
    receipt_number: str
    remarks: Optional[str]

    class Config:
        from_attributes = True


class FeeOut(BaseModel):
    id: int
    student_id: int
    total_amount: float
    academic_year: str
    paid_amount: float = 0
    remaining_amount: float = 0
    student_name: Optional[str] = None
    payments: List[FeePaymentOut] = []

    class Config:
        from_attributes = True


class SalaryCreate(BaseModel):
    teacher_id: int
    monthly_amount: float
    academic_year: str = "2024-25"


class SalaryUpdate(BaseModel):
    monthly_amount: Optional[float] = None
    academic_year: Optional[str] = None


class SalaryPaymentCreate(BaseModel):
    salary_id: int
    amount: float
    month: str


class SalaryPaymentOut(BaseModel):
    id: int
    salary_id: int
    amount: float
    month: str
    payment_date: datetime
    receipt_number: str

    class Config:
        from_attributes = True


class SalaryOut(BaseModel):
    id: int
    teacher_id: int
    monthly_amount: float
    academic_year: str
    total_paid: float = 0
    pending_amount: float = 0
    teacher_name: Optional[str] = None
    payments: List[SalaryPaymentOut] = []

    class Config:
        from_attributes = True
