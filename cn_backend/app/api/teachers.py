import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.teacher import Teacher
from app.models.user import User
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherOut
from app.core.deps import get_current_user, require_admin
from app.core.security import get_password_hash

router = APIRouter(prefix="/teachers", tags=["Teachers"])


@router.get("", response_model=List[TeacherOut])
def list_teachers(
    medium: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Teacher)
    if medium:
        query = query.filter(Teacher.medium == medium)
    teachers = query.all()
    result = []
    for t in teachers:
        user = db.query(User).filter(User.id == t.user_id).first()
        result.append(TeacherOut(
            id=t.id, user_id=t.user_id, name=t.name,
            medium=t.medium,
            qualification=t.qualification, monthly_salary=float(t.monthly_salary or 0),
            assigned_classes=t.assigned_classes, assigned_subjects=t.assigned_subjects,
            mobile=user.mobile if user else None, created_at=t.created_at,
        ))
    return result


@router.get("/me")
def get_my_teacher_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    return {
        "id": teacher.id, "name": teacher.name, "qualification": teacher.qualification,
        "monthly_salary": float(teacher.monthly_salary or 0),
        "assigned_classes": json.loads(teacher.assigned_classes or "[]"),
        "assigned_subjects": json.loads(teacher.assigned_subjects or "[]"),
        "mobile": current_user.mobile,
        "medium": teacher.medium,
    }


@router.get("/{teacher_id}", response_model=TeacherOut)
def get_teacher(teacher_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    user = db.query(User).filter(User.id == teacher.user_id).first()
    return TeacherOut(
        id=teacher.id, user_id=teacher.user_id, name=teacher.name,
        medium=teacher.medium,
        qualification=teacher.qualification, monthly_salary=float(teacher.monthly_salary or 0),
        assigned_classes=teacher.assigned_classes, assigned_subjects=teacher.assigned_subjects,
        mobile=user.mobile if user else None, created_at=teacher.created_at,
    )


@router.post("", response_model=TeacherOut)
def create_teacher(data: TeacherCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    existing = db.query(User).filter(User.mobile == data.mobile).first()
    if existing:
        raise HTTPException(status_code=400, detail="Mobile number already registered")

    user = User(mobile=data.mobile, password_hash=get_password_hash(data.password), role="teacher")
    db.add(user)
    db.flush()

    teacher = Teacher(
        user_id=user.id, name=data.name, qualification=data.qualification,
        monthly_salary=data.monthly_salary or 0,
        assigned_classes=json.dumps(data.assigned_classes or []),
        assigned_subjects=json.dumps(data.assigned_subjects or []),
        medium=data.medium,
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return TeacherOut(
        id=teacher.id, user_id=teacher.user_id, name=teacher.name,
        medium=teacher.medium,
        qualification=teacher.qualification, monthly_salary=float(teacher.monthly_salary or 0),
        assigned_classes=teacher.assigned_classes, assigned_subjects=teacher.assigned_subjects,
        mobile=data.mobile, created_at=teacher.created_at,
    )


@router.put("/{teacher_id}", response_model=TeacherOut)
def update_teacher(teacher_id: int, data: TeacherUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    if data.name is not None:
        teacher.name = data.name
    if data.medium is not None:
        teacher.medium = data.medium
    if data.qualification is not None:
        teacher.qualification = data.qualification
    if data.monthly_salary is not None:
        teacher.monthly_salary = data.monthly_salary
    if data.assigned_classes is not None:
        teacher.assigned_classes = json.dumps(data.assigned_classes)
    if data.assigned_subjects is not None:
        teacher.assigned_subjects = json.dumps(data.assigned_subjects)
    if data.password is not None and data.password != "":
        user = db.query(User).filter(User.id == teacher.user_id).first()
        if user:
            user.password_hash = get_password_hash(data.password)

    db.commit()
    db.refresh(teacher)
    user = db.query(User).filter(User.id == teacher.user_id).first()
    return TeacherOut(
        id=teacher.id, user_id=teacher.user_id, name=teacher.name,
        medium=teacher.medium,
        qualification=teacher.qualification, monthly_salary=float(teacher.monthly_salary or 0),
        assigned_classes=teacher.assigned_classes, assigned_subjects=teacher.assigned_subjects,
        mobile=user.mobile if user else None, created_at=teacher.created_at,
    )


@router.delete("/{teacher_id}")
def delete_teacher(teacher_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    user = db.query(User).filter(User.id == teacher.user_id).first()
    db.delete(teacher)
    if user:
        db.delete(user)
    db.commit()
    return {"message": "Teacher deleted successfully"}
