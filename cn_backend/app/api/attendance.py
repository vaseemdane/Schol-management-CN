from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.db.session import get_db
from app.models.attendance import Attendance
from app.models.student import Student
from app.schemas.attendance import AttendanceCreate, AttendanceBulkCreate, AttendanceUpdate, AttendanceOut
from app.core.deps import get_current_user, require_teacher

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("", response_model=List[AttendanceOut])
def get_attendance(
    class_id: Optional[int] = None,
    student_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Attendance)
    if class_id:
        query = query.filter(Attendance.class_id == class_id)
    if student_id:
        query = query.filter(Attendance.student_id == student_id)
    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)

    records = query.order_by(Attendance.date.desc()).all()
    result = []
    for r in records:
        student = db.query(Student).filter(Student.id == r.student_id).first()
        result.append(AttendanceOut(
            id=r.id, student_id=r.student_id, class_id=r.class_id,
            date=r.date, status=r.status, created_at=r.created_at,
            student_name=student.name if student else None,
            roll_number=student.roll_number if student else None,
        ))
    return result


@router.post("", response_model=AttendanceOut)
def mark_attendance(data: AttendanceCreate, db: Session = Depends(get_db), current_user=Depends(require_teacher)):
    existing = db.query(Attendance).filter(
        and_(Attendance.student_id == data.student_id, Attendance.date == data.date)
    ).first()
    if existing:
        existing.status = data.status
        existing.marked_by = current_user.id
        db.commit()
        db.refresh(existing)
        record = existing
    else:
        record = Attendance(
            student_id=data.student_id, class_id=data.class_id,
            date=data.date, status=data.status, marked_by=current_user.id,
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    student = db.query(Student).filter(Student.id == record.student_id).first()
    return AttendanceOut(
        id=record.id, student_id=record.student_id, class_id=record.class_id,
        date=record.date, status=record.status, created_at=record.created_at,
        student_name=student.name if student else None,
        roll_number=student.roll_number if student else None,
    )


@router.post("/bulk")
def bulk_mark_attendance(data: AttendanceBulkCreate, db: Session = Depends(get_db), current_user=Depends(require_teacher)):
    created = 0
    for rec in data.records:
        student_id = rec.get("student_id")
        status = rec.get("status", "present")
        existing = db.query(Attendance).filter(
            and_(Attendance.student_id == student_id, Attendance.date == data.date)
        ).first()
        if existing:
            existing.status = status
            existing.marked_by = current_user.id
        else:
            att = Attendance(
                student_id=student_id, class_id=data.class_id,
                date=data.date, status=status, marked_by=current_user.id,
            )
            db.add(att)
            created += 1
    db.commit()
    return {"message": f"Attendance marked for {len(data.records)} students"}


@router.put("/{attendance_id}", response_model=AttendanceOut)
def update_attendance(
    attendance_id: int, data: AttendanceUpdate,
    db: Session = Depends(get_db), current_user=Depends(require_teacher),
):
    record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    record.status = data.status
    db.commit()
    db.refresh(record)
    student = db.query(Student).filter(Student.id == record.student_id).first()
    return AttendanceOut(
        id=record.id, student_id=record.student_id, class_id=record.class_id,
        date=record.date, status=record.status, created_at=record.created_at,
        student_name=student.name if student else None,
        roll_number=student.roll_number if student else None,
    )


@router.get("/student/{student_id}/summary")
def get_student_attendance_summary(
    student_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    total = len(records)
    present = sum(1 for r in records if r.status == "present")
    absent = sum(1 for r in records if r.status == "absent")
    late = sum(1 for r in records if r.status == "late")
    percentage = round((present / total * 100), 2) if total > 0 else 0
    return {
        "total": total, "present": present, "absent": absent, "late": late,
        "percentage": percentage,
        "monthly": _get_monthly_summary(records),
    }


def _get_monthly_summary(records):
    monthly = {}
    for r in records:
        key = r.date.strftime("%b %Y")
        if key not in monthly:
            monthly[key] = {"present": 0, "absent": 0, "late": 0}
        monthly[key][r.status] = monthly[key].get(r.status, 0) + 1
    return [{"month": k, **v} for k, v in monthly.items()]
