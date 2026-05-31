from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.exam import Exam, Mark
from app.models.student import Student
from app.models.class_subject import Subject, Class
from app.schemas.exam import ExamCreate, ExamOut, MarkCreate, MarkUpdate, MarkOut
from app.core.deps import get_current_user, require_teacher, require_admin

router = APIRouter(tags=["Exams & Marks"])


def calculate_grade(percentage: float) -> str:
    if percentage >= 90:
        return "A+"
    elif percentage >= 80:
        return "A"
    elif percentage >= 70:
        return "B+"
    elif percentage >= 60:
        return "B"
    elif percentage >= 50:
        return "C"
    elif percentage >= 40:
        return "D"
    else:
        return "F"


# Exams
@router.get("/exams", response_model=List[ExamOut])
def list_exams(class_id: Optional[int] = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(Exam)
    if class_id:
        query = query.filter(Exam.class_id == class_id)
    exams = query.all()
    result = []
    for e in exams:
        subject = db.query(Subject).filter(Subject.id == e.subject_id).first()
        cls = db.query(Class).filter(Class.id == e.class_id).first()
        result.append(ExamOut(
            id=e.id, name=e.name, class_id=e.class_id, subject_id=e.subject_id,
            exam_date=e.exam_date, total_marks=e.total_marks,
            subject_name=subject.name if subject else None,
            class_name=f"{cls.name} {cls.section}" if cls else None,
        ))
    return result


@router.post("/exams", response_model=ExamOut)
def create_exam(data: ExamCreate, db: Session = Depends(get_db), current_user=Depends(require_teacher)):
    exam = Exam(**data.dict())
    db.add(exam)
    db.commit()
    db.refresh(exam)
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    cls = db.query(Class).filter(Class.id == exam.class_id).first()
    return ExamOut(
        id=exam.id, name=exam.name, class_id=exam.class_id, subject_id=exam.subject_id,
        exam_date=exam.exam_date, total_marks=exam.total_marks,
        subject_name=subject.name if subject else None,
        class_name=f"{cls.name} {cls.section}" if cls else None,
    )


# Marks
@router.get("/marks", response_model=List[MarkOut])
def list_marks(
    student_id: Optional[int] = None,
    exam_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Mark)
    if student_id:
        query = query.filter(Mark.student_id == student_id)
    if exam_id:
        query = query.filter(Mark.exam_id == exam_id)
    marks = query.all()
    result = []
    for m in marks:
        student = db.query(Student).filter(Student.id == m.student_id).first()
        exam = db.query(Exam).filter(Exam.id == m.exam_id).first()
        subject = db.query(Subject).filter(Subject.id == exam.subject_id).first() if exam else None
        result.append(MarkOut(
            id=m.id, student_id=m.student_id, exam_id=m.exam_id,
            marks_obtained=float(m.marks_obtained), grade=m.grade, remarks=m.remarks,
            student_name=student.name if student else None,
            exam_name=exam.name if exam else None,
            subject_name=subject.name if subject else None,
            total_marks=exam.total_marks if exam else None,
            created_at=m.created_at,
        ))
    return result


@router.post("/marks", response_model=MarkOut)
def add_marks(data: MarkCreate, db: Session = Depends(get_db), current_user=Depends(require_teacher)):
    exam = db.query(Exam).filter(Exam.id == data.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    if data.marks_obtained > exam.total_marks:
        raise HTTPException(status_code=400, detail="Marks exceed total marks")

    percentage = (data.marks_obtained / exam.total_marks) * 100
    grade = data.grade or calculate_grade(percentage)

    mark = Mark(
        student_id=data.student_id, exam_id=data.exam_id,
        marks_obtained=data.marks_obtained, grade=grade,
        remarks=data.remarks, entered_by=current_user.id,
    )
    db.add(mark)
    db.commit()
    db.refresh(mark)

    student = db.query(Student).filter(Student.id == mark.student_id).first()
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    return MarkOut(
        id=mark.id, student_id=mark.student_id, exam_id=mark.exam_id,
        marks_obtained=float(mark.marks_obtained), grade=mark.grade, remarks=mark.remarks,
        student_name=student.name if student else None,
        exam_name=exam.name, subject_name=subject.name if subject else None,
        total_marks=exam.total_marks, created_at=mark.created_at,
    )


@router.put("/marks/{mark_id}", response_model=MarkOut)
def update_marks(mark_id: int, data: MarkUpdate, db: Session = Depends(get_db), current_user=Depends(require_teacher)):
    mark = db.query(Mark).filter(Mark.id == mark_id).first()
    if not mark:
        raise HTTPException(status_code=404, detail="Mark record not found")

    if data.marks_obtained is not None:
        mark.marks_obtained = data.marks_obtained
    if data.grade is not None:
        mark.grade = data.grade
    if data.remarks is not None:
        mark.remarks = data.remarks

    db.commit()
    db.refresh(mark)
    exam = db.query(Exam).filter(Exam.id == mark.exam_id).first()
    student = db.query(Student).filter(Student.id == mark.student_id).first()
    subject = db.query(Subject).filter(Subject.id == exam.subject_id).first() if exam else None
    return MarkOut(
        id=mark.id, student_id=mark.student_id, exam_id=mark.exam_id,
        marks_obtained=float(mark.marks_obtained), grade=mark.grade, remarks=mark.remarks,
        student_name=student.name if student else None,
        exam_name=exam.name if exam else None,
        subject_name=subject.name if subject else None,
        total_marks=exam.total_marks if exam else None,
        created_at=mark.created_at,
    )


@router.delete("/marks/{mark_id}")
def delete_marks(mark_id: int, db: Session = Depends(get_db), current_user=Depends(require_teacher)):
    mark = db.query(Mark).filter(Mark.id == mark_id).first()
    if not mark:
        raise HTTPException(status_code=404, detail="Mark record not found")
    db.delete(mark)
    db.commit()
    return {"message": "Mark deleted successfully"}


@router.get("/marks/student/{student_id}/performance")
def get_student_performance(student_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    marks = db.query(Mark).filter(Mark.student_id == student_id).all()
    result = []
    for m in marks:
        exam = db.query(Exam).filter(Exam.id == m.exam_id).first()
        subject = db.query(Subject).filter(Subject.id == exam.subject_id).first() if exam else None
        percentage = round((float(m.marks_obtained) / exam.total_marks) * 100, 2) if exam else 0
        result.append({
            "subject": subject.name if subject else "Unknown",
            "exam": exam.name if exam else "Unknown",
            "marks_obtained": float(m.marks_obtained),
            "total_marks": exam.total_marks if exam else 0,
            "percentage": percentage,
            "grade": m.grade,
        })
    return result
