from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.class_subject import Class, Subject
from app.models.attendance import Attendance
from app.models.exam import Exam, Mark
from app.models.fee import Fee, FeePayment
from app.models.salary import Salary, SalaryPayment
from app.core.deps import get_current_user, require_admin

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
def get_admin_dashboard(medium: Optional[str] = None, db: Session = Depends(get_db), _=Depends(require_admin)):
    students_query = db.query(Student)
    teachers_query = db.query(Teacher)
    classes_query = db.query(Class)
    if medium:
        students_query = students_query.filter(Student.medium == medium)
        teachers_query = teachers_query.filter(Teacher.medium == medium)
        classes_query = classes_query.filter(Class.medium == medium)

    total_students = students_query.count()
    total_teachers = teachers_query.count()
    total_classes = classes_query.count()

    fees_query = db.query(func.sum(Fee.total_amount))
    paid_query = db.query(func.sum(FeePayment.amount))
    if medium:
        fees_query = fees_query.join(Student).filter(Student.medium == medium)
        paid_query = paid_query.join(Fee).join(Student).filter(Student.medium == medium)

    total_fees = fees_query.scalar() or 0
    total_paid = paid_query.scalar() or 0
    pending_fees = float(total_fees) - float(total_paid)

    attendance_query = db.query(Attendance)
    present_query = db.query(Attendance).filter(Attendance.status == "present")
    if medium:
        attendance_query = attendance_query.join(Student).filter(Student.medium == medium)
        present_query = present_query.join(Student).filter(Student.medium == medium)

    total_attendance = attendance_query.count()
    present_attendance = present_query.count()
    attendance_pct = round((present_attendance / total_attendance * 100), 2) if total_attendance > 0 else 0

    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_classes": total_classes,
        "fees_collected": float(total_paid),
        "pending_fees": float(pending_fees),
        "attendance_percentage": attendance_pct,
    }


@router.get("/students")
def get_student_analytics(medium: Optional[str] = None, db: Session = Depends(get_db), _=Depends(require_admin)):
    classes_query = db.query(Class)
    if medium:
        classes_query = classes_query.filter(Class.medium == medium)
    classes = classes_query.all()
    class_data = []
    for cls in classes:
        students = db.query(Student).filter(Student.class_id == cls.id).all()
        marks = []
        for s in students:
            student_marks = db.query(Mark).filter(Mark.student_id == s.id).all()
            if student_marks:
                avg = sum(float(m.marks_obtained) for m in student_marks) / len(student_marks)
                marks.append({"name": s.name, "average": round(avg, 2)})
        class_data.append({
            "class": f"{cls.name} {cls.section}",
            "total_students": len(students),
            "marks": sorted(marks, key=lambda x: x["average"], reverse=True)[:5],
        })

    marks_query = db.query(Mark)
    if medium:
        marks_query = marks_query.join(Student).filter(Student.medium == medium)
    all_marks = marks_query.all()
    top_students = []
    student_avgs = {}
    for m in all_marks:
        sid = m.student_id
        if sid not in student_avgs:
            student_avgs[sid] = []
        student_avgs[sid].append(float(m.marks_obtained))

    for sid, marks_list in student_avgs.items():
        student = db.query(Student).filter(Student.id == sid).first()
        if student:
            top_students.append({
                "name": student.name,
                "roll_number": student.roll_number,
                "average": round(sum(marks_list) / len(marks_list), 2),
            })

    top_students = sorted(top_students, key=lambda x: x["average"], reverse=True)[:10]

    return {"class_data": class_data, "top_students": top_students}


@router.get("/financial")
def get_financial_analytics(medium: Optional[str] = None, db: Session = Depends(get_db), _=Depends(require_admin)):
    fees_query = db.query(Fee)
    if medium:
        fees_query = fees_query.join(Student).filter(Student.medium == medium)
    fees = fees_query.all()
    fee_data = []
    total_fee = 0
    total_collected = 0
    for f in fees:
        paid = sum(float(p.amount) for p in f.payments)
        total_fee += float(f.total_amount)
        total_collected += paid
        fee_data.append({
            "student_id": f.student_id,
            "total": float(f.total_amount),
            "paid": paid,
            "pending": float(f.total_amount) - paid,
        })

    salary_payments_query = db.query(SalaryPayment)
    if medium:
        salary_payments_query = salary_payments_query.join(Salary).join(Teacher).filter(Teacher.medium == medium)
    salary_payments = salary_payments_query.all()
    monthly_salary = {}
    for sp in salary_payments:
        m = sp.month
        if m not in monthly_salary:
            monthly_salary[m] = 0
        monthly_salary[m] += float(sp.amount)

    return {
        "total_fee_amount": total_fee,
        "total_collected": total_collected,
        "total_pending": total_fee - total_collected,
        "collection_percentage": round((total_collected / total_fee * 100), 2) if total_fee > 0 else 0,
        "fee_breakdown": fee_data[:20],
        "salary_expenses": [{"month": k, "amount": v} for k, v in monthly_salary.items()],
    }


@router.get("/attendance-overview")
def get_attendance_overview(medium: Optional[str] = None, db: Session = Depends(get_db), _=Depends(require_admin)):
    classes_query = db.query(Class)
    if medium:
        classes_query = classes_query.filter(Class.medium == medium)
    classes = classes_query.all()
    result = []
    for cls in classes:
        records = db.query(Attendance).filter(Attendance.class_id == cls.id).all()
        total = len(records)
        present = sum(1 for r in records if r.status == "present")
        pct = round((present / total * 100), 2) if total > 0 else 0
        result.append({
            "class": f"{cls.name} {cls.section}",
            "total": total,
            "present": present,
            "absent": total - present,
            "percentage": pct,
        })
    return result
