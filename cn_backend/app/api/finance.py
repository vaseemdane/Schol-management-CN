import random
import string
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.fee import Fee, FeePayment
from app.models.salary import Salary, SalaryPayment
from app.models.student import Student
from app.models.teacher import Teacher
from app.schemas.finance import (
    FeeCreate, FeeUpdate, FeePaymentCreate, FeePaymentUpdate, FeeOut, FeePaymentOut,
    SalaryCreate, SalaryUpdate, SalaryPaymentCreate, SalaryOut, SalaryPaymentOut,
)
from app.core.deps import get_current_user, require_admin

router = APIRouter(tags=["Finance"])


def generate_receipt() -> str:
    return "RCP" + "".join(random.choices(string.digits, k=8))


# ─── FEES ──────────────────────────────────────────────────────────────────────

@router.get("/fees", response_model=List[FeeOut])
def list_fees(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    fees = db.query(Fee).all()
    result = []
    for f in fees:
        student = db.query(Student).filter(Student.id == f.student_id).first()
        paid = sum(float(p.amount) for p in f.payments)
        remaining = float(f.total_amount) - paid
        result.append(FeeOut(
            id=f.id, student_id=f.student_id, total_amount=float(f.total_amount),
            academic_year=f.academic_year, paid_amount=paid, remaining_amount=remaining,
            student_name=student.name if student else None,
            payments=[FeePaymentOut(
                id=p.id, fee_id=p.fee_id, amount=float(p.amount),
                payment_date=p.payment_date, receipt_number=p.receipt_number, remarks=p.remarks
            ) for p in f.payments],
        ))
    return result


@router.get("/fees/student/{student_id}", response_model=FeeOut)
def get_student_fee(student_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    fee = db.query(Fee).filter(Fee.student_id == student_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")
    student = db.query(Student).filter(Student.id == student_id).first()
    paid = sum(float(p.amount) for p in fee.payments)
    remaining = float(fee.total_amount) - paid
    return FeeOut(
        id=fee.id, student_id=fee.student_id, total_amount=float(fee.total_amount),
        academic_year=fee.academic_year, paid_amount=paid, remaining_amount=remaining,
        student_name=student.name if student else None,
        payments=[FeePaymentOut(
            id=p.id, fee_id=p.fee_id, amount=float(p.amount),
            payment_date=p.payment_date, receipt_number=p.receipt_number, remarks=p.remarks
        ) for p in fee.payments],
    )


@router.post("/fees", response_model=FeeOut)
def create_fee(data: FeeCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    existing = db.query(Fee).filter(Fee.student_id == data.student_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Fee record already exists for this student")
    fee = Fee(student_id=data.student_id, total_amount=data.total_amount, academic_year=data.academic_year)
    db.add(fee)
    db.commit()
    db.refresh(fee)
    student = db.query(Student).filter(Student.id == data.student_id).first()
    return FeeOut(
        id=fee.id, student_id=fee.student_id, total_amount=float(fee.total_amount),
        academic_year=fee.academic_year, paid_amount=0, remaining_amount=float(fee.total_amount),
        student_name=student.name if student else None, payments=[],
    )


@router.put("/fees/{fee_id}", response_model=FeeOut)
def update_fee(fee_id: int, data: FeeUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    fee = db.query(Fee).filter(Fee.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")

    paid = sum(float(p.amount) for p in fee.payments)

    if data.total_amount is not None:
        if data.total_amount < paid:
            raise HTTPException(status_code=400, detail=f"Total amount cannot be less than already paid amount ({paid})")
        fee.total_amount = data.total_amount
    if data.academic_year is not None:
        fee.academic_year = data.academic_year

    db.commit()
    db.refresh(fee)
    student = db.query(Student).filter(Student.id == fee.student_id).first()
    remaining = float(fee.total_amount) - paid
    return FeeOut(
        id=fee.id, student_id=fee.student_id, total_amount=float(fee.total_amount),
        academic_year=fee.academic_year, paid_amount=paid, remaining_amount=remaining,
        student_name=student.name if student else None,
        payments=[FeePaymentOut(
            id=p.id, fee_id=p.fee_id, amount=float(p.amount),
            payment_date=p.payment_date, receipt_number=p.receipt_number, remarks=p.remarks
        ) for p in fee.payments],
    )


@router.post("/fees/payment", response_model=FeePaymentOut)
def add_fee_payment(data: FeePaymentCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    fee = db.query(Fee).filter(Fee.id == data.fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")
    paid = sum(float(p.amount) for p in fee.payments)
    if paid + data.amount > float(fee.total_amount):
        raise HTTPException(status_code=400, detail="Payment exceeds remaining fee amount")

    payment = FeePayment(
        fee_id=data.fee_id, amount=data.amount,
        receipt_number=generate_receipt(), remarks=data.remarks,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return FeePaymentOut(
        id=payment.id, fee_id=payment.fee_id, amount=float(payment.amount),
        payment_date=payment.payment_date, receipt_number=payment.receipt_number,
        remarks=payment.remarks,
    )


@router.put("/fees/payment/{payment_id}", response_model=FeePaymentOut)
def update_fee_payment(
    payment_id: int,
    data: FeePaymentUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    payment = db.query(FeePayment).filter(FeePayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    if data.amount is not None:
        fee = db.query(Fee).filter(Fee.id == payment.fee_id).first()
        if not fee:
            raise HTTPException(status_code=404, detail="Fee record not found")
        projected_paid = sum(float(p.amount) for p in fee.payments if p.id != payment_id) + data.amount
        if projected_paid > float(fee.total_amount):
            raise HTTPException(status_code=400, detail="Updated payment amount exceeds total fee amount")
        payment.amount = data.amount
        
    if data.remarks is not None:
        payment.remarks = data.remarks
        
    db.commit()
    db.refresh(payment)
    return FeePaymentOut(
        id=payment.id, fee_id=payment.fee_id, amount=float(payment.amount),
        payment_date=payment.payment_date, receipt_number=payment.receipt_number, remarks=payment.remarks
    )


@router.delete("/fees/payment/{payment_id}")
def delete_fee_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    payment = db.query(FeePayment).filter(FeePayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    db.delete(payment)
    db.commit()
    return {"message": "Payment record deleted successfully"}


# ─── SALARY ────────────────────────────────────────────────────────────────────

@router.get("/salary", response_model=List[SalaryOut])
def list_salaries(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    salaries = db.query(Salary).all()
    result = []
    for s in salaries:
        teacher = db.query(Teacher).filter(Teacher.id == s.teacher_id).first()
        total_paid = sum(float(p.amount) for p in s.payments)
        pending = float(s.monthly_amount) * 12 - total_paid
        result.append(SalaryOut(
            id=s.id, teacher_id=s.teacher_id, monthly_amount=float(s.monthly_amount),
            academic_year=s.academic_year, total_paid=total_paid,
            pending_amount=max(0, pending),
            teacher_name=teacher.name if teacher else None,
            payments=[SalaryPaymentOut(
                id=p.id, salary_id=p.salary_id, amount=float(p.amount),
                month=p.month, payment_date=p.payment_date, receipt_number=p.receipt_number,
            ) for p in s.payments],
        ))
    return result


@router.get("/salary/teacher/{teacher_id}", response_model=SalaryOut)
def get_teacher_salary(teacher_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    salary = db.query(Salary).filter(Salary.teacher_id == teacher_id).first()
    if not salary:
        raise HTTPException(status_code=404, detail="Salary record not found")
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    total_paid = sum(float(p.amount) for p in salary.payments)
    pending = float(salary.monthly_amount) * 12 - total_paid
    return SalaryOut(
        id=salary.id, teacher_id=salary.teacher_id, monthly_amount=float(salary.monthly_amount),
        academic_year=salary.academic_year, total_paid=total_paid,
        pending_amount=max(0, pending),
        teacher_name=teacher.name if teacher else None,
        payments=[SalaryPaymentOut(
            id=p.id, salary_id=p.salary_id, amount=float(p.amount),
            month=p.month, payment_date=p.payment_date, receipt_number=p.receipt_number,
        ) for p in salary.payments],
    )


@router.post("/salary", response_model=SalaryOut)
def create_salary(data: SalaryCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    existing = db.query(Salary).filter(Salary.teacher_id == data.teacher_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Salary record already exists for this teacher")
    salary = Salary(teacher_id=data.teacher_id, monthly_amount=data.monthly_amount, academic_year=data.academic_year)
    db.add(salary)
    db.commit()
    db.refresh(salary)
    teacher = db.query(Teacher).filter(Teacher.id == data.teacher_id).first()
    return SalaryOut(
        id=salary.id, teacher_id=salary.teacher_id, monthly_amount=float(salary.monthly_amount),
        academic_year=salary.academic_year, total_paid=0,
        pending_amount=float(salary.monthly_amount) * 12,
        teacher_name=teacher.name if teacher else None, payments=[],
    )


@router.put("/salary/{salary_id}", response_model=SalaryOut)
def update_salary(salary_id: int, data: SalaryUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    salary = db.query(Salary).filter(Salary.id == salary_id).first()
    if not salary:
        raise HTTPException(status_code=404, detail="Salary record not found")

    total_paid = sum(float(p.amount) for p in salary.payments)

    if data.monthly_amount is not None:
        if data.monthly_amount * 12 < total_paid:
            raise HTTPException(
                status_code=400,
                detail=f"New monthly amount would make annual salary less than already paid amount ({total_paid})"
            )
        salary.monthly_amount = data.monthly_amount
    if data.academic_year is not None:
        salary.academic_year = data.academic_year

    db.commit()
    db.refresh(salary)
    
    teacher = db.query(Teacher).filter(Teacher.id == salary.teacher_id).first()
    pending = float(salary.monthly_amount) * 12 - total_paid
    return SalaryOut(
        id=salary.id, teacher_id=salary.teacher_id, monthly_amount=float(salary.monthly_amount),
        academic_year=salary.academic_year, total_paid=total_paid,
        pending_amount=max(0, pending),
        teacher_name=teacher.name if teacher else None,
        payments=[SalaryPaymentOut(
            id=p.id, salary_id=p.salary_id, amount=float(p.amount),
            month=p.month, payment_date=p.payment_date, receipt_number=p.receipt_number,
        ) for p in salary.payments],
    )



@router.post("/salary/payment", response_model=SalaryPaymentOut)
def add_salary_payment(data: SalaryPaymentCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    salary = db.query(Salary).filter(Salary.id == data.salary_id).first()
    if not salary:
        raise HTTPException(status_code=404, detail="Salary record not found")
    payment = SalaryPayment(
        salary_id=data.salary_id, amount=data.amount, month=data.month,
        receipt_number=generate_receipt(),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return SalaryPaymentOut(
        id=payment.id, salary_id=payment.salary_id, amount=float(payment.amount),
        month=payment.month, payment_date=payment.payment_date, receipt_number=payment.receipt_number,
    )
