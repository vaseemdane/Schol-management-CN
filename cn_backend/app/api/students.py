import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.student import Student
from app.models.user import User
from app.models.class_subject import Class
from app.schemas.student import StudentCreate, StudentUpdate, StudentOut
from app.core.deps import get_current_user, require_admin
from app.core.security import get_password_hash

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("", response_model=List[StudentOut])
def list_students(
    class_id: Optional[int] = None,
    medium: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Student)
    if class_id:
        query = query.filter(Student.class_id == class_id)
    if medium:
        query = query.filter(Student.medium == medium)
    students = query.offset(skip).limit(limit).all()
    result = []
    for s in students:
        user = db.query(User).filter(User.id == s.user_id).first()
        cls = db.query(Class).filter(Class.id == s.class_id).first()
        out = StudentOut(
            id=s.id, user_id=s.user_id, name=s.name, roll_number=s.roll_number,
            class_id=s.class_id, section=s.section, parent_name=s.parent_name,
            parent_mobile=s.parent_mobile, address=s.address,
            dob=s.dob,
            mobile=user.mobile if user else None,
            class_name=f"{cls.name} {cls.section}" if cls else None,
            medium=s.medium,
            created_at=s.created_at,
        )
        result.append(out)
    return result


@router.get("/me")
def get_my_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    cls = db.query(Class).filter(Class.id == student.class_id).first()
    return {
        "id": student.id, "name": student.name, "roll_number": student.roll_number,
        "class_name": f"{cls.name} {cls.section}" if cls else None,
        "class_id": student.class_id, "section": student.section,
        "parent_name": student.parent_name, "parent_mobile": student.parent_mobile,
        "address": student.address, "mobile": current_user.mobile,
        "medium": student.medium, "dob": student.dob,
    }


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    user = db.query(User).filter(User.id == student.user_id).first()
    cls = db.query(Class).filter(Class.id == student.class_id).first()
    return StudentOut(
        id=student.id, user_id=student.user_id, name=student.name,
        roll_number=student.roll_number, class_id=student.class_id, section=student.section,
        parent_name=student.parent_name, parent_mobile=student.parent_mobile,
        address=student.address, dob=student.dob, mobile=user.mobile if user else None,
        class_name=f"{cls.name} {cls.section}" if cls else None,
        medium=student.medium,
        created_at=student.created_at,
    )


@router.post("", response_model=StudentOut)
def create_student(data: StudentCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    existing_user = db.query(User).filter(User.mobile == data.mobile).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Mobile number already registered")
    existing_roll = db.query(Student).filter(Student.roll_number == data.roll_number).first()
    if existing_roll:
        raise HTTPException(status_code=400, detail="Roll number already exists")

    cls = db.query(Class).filter(Class.id == data.class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    if cls.medium != data.medium:
        raise HTTPException(status_code=400, detail="Student medium must match class medium")

    user = User(mobile=data.mobile, password_hash=get_password_hash(data.password), role="student")
    db.add(user)
    db.flush()

    student = Student(
        user_id=user.id, name=data.name, roll_number=data.roll_number,
        class_id=data.class_id, section=data.section, parent_name=data.parent_name,
        parent_mobile=data.parent_mobile, address=data.address,
        medium=data.medium, dob=data.dob,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return StudentOut(
        id=student.id, user_id=student.user_id, name=student.name,
        roll_number=student.roll_number, class_id=student.class_id, section=student.section,
        parent_name=student.parent_name, parent_mobile=student.parent_mobile,
        address=student.address, dob=student.dob, mobile=data.mobile,
        class_name=f"{cls.name} {cls.section}" if cls else None,
        medium=student.medium,
        created_at=student.created_at,
    )


@router.put("/{student_id}", response_model=StudentOut)
def update_student(student_id: int, data: StudentUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_medium = data.medium if data.medium is not None else student.medium
    new_class_id = data.class_id if data.class_id is not None else student.class_id
    cls = db.query(Class).filter(Class.id == new_class_id).first()
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    if cls.medium != new_medium:
        raise HTTPException(status_code=400, detail="Student medium must match class medium")

    for field, value in data.dict(exclude_none=True).items():
        setattr(student, field, value)
    db.commit()
    db.refresh(student)
    user = db.query(User).filter(User.id == student.user_id).first()
    return StudentOut(
        id=student.id, user_id=student.user_id, name=student.name,
        roll_number=student.roll_number, class_id=student.class_id, section=student.section,
        parent_name=student.parent_name, parent_mobile=student.parent_mobile,
        address=student.address, dob=student.dob, mobile=user.mobile if user else None,
        class_name=f"{cls.name} {cls.section}" if cls else None,
        medium=student.medium,
        created_at=student.created_at,
    )


@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    user = db.query(User).filter(User.id == student.user_id).first()
    db.delete(student)
    if user:
        db.delete(user)
    db.commit()
    return {"message": "Student deleted successfully"}
