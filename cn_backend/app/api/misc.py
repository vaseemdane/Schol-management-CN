from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.models.certificate import Certificate, Notification
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.class_subject import Class
from app.schemas.misc import (
    CertificateCreate, CertificateOut, NotificationCreate, NotificationOut,
    ClassCreate, ClassOut, SubjectCreate, SubjectOut,
)
from app.models.class_subject import Class, Subject
from app.core.deps import get_current_user, require_admin

certificates_router = APIRouter(prefix="/certificates", tags=["Certificates"])
notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])
classes_router = APIRouter(prefix="/classes", tags=["Classes"])
subjects_router = APIRouter(prefix="/subjects", tags=["Subjects"])


# ─── CERTIFICATES ──────────────────────────────────────────────────────────────

@certificates_router.get("", response_model=List[CertificateOut])
def list_certificates(db: Session = Depends(get_db), _=Depends(require_admin)):
    certs = db.query(Certificate).all()
    result = []
    for c in certs:
        student = db.query(Student).filter(Student.id == c.student_id).first()
        result.append(CertificateOut(
            id=c.id, student_id=c.student_id, certificate_type=c.certificate_type,
            issued_date=c.issued_date, content=c.content,
            student_name=student.name if student else None,
        ))
    return result


@certificates_router.post("", response_model=CertificateOut)
def generate_certificate(data: CertificateCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    cls = db.query(Class).filter(Class.id == student.class_id).first()

    content_templates = {
        "bonafide": f"This is to certify that {student.name} (Roll No: {student.roll_number}) is a bonafide student of Greenwood Academy studying in {cls.name if cls else 'N/A'} {cls.section if cls else ''}.",
        "study": f"This is to certify that {student.name} has been studying at Greenwood Academy since enrollment and is currently in {cls.name if cls else 'N/A'} {cls.section if cls else ''}.",
        "transfer": f"This is to certify that {student.name} (Roll No: {student.roll_number}) has been a student of Greenwood Academy and is hereby granted Transfer Certificate.",
    }

    cert = Certificate(
        student_id=data.student_id,
        certificate_type=data.certificate_type,
        content=content_templates.get(data.certificate_type, "Certificate issued by Greenwood Academy"),
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return CertificateOut(
        id=cert.id, student_id=cert.student_id, certificate_type=cert.certificate_type,
        issued_date=cert.issued_date, content=cert.content, student_name=student.name,
    )


# ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────

@notifications_router.get("", response_model=List[NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(Notification).filter(Notification.is_active == True)
    if current_user.role != "admin":
        query = query.filter(
            (Notification.target_role == None) | (Notification.target_role == current_user.role)
        )
    notifications = query.order_by(Notification.created_at.desc()).all()
    return [NotificationOut(
        id=n.id, title=n.title, message=n.message, target_role=n.target_role,
        notification_type=n.notification_type, is_active=n.is_active, created_at=n.created_at,
    ) for n in notifications]


@notifications_router.post("", response_model=NotificationOut)
def create_notification(data: NotificationCreate, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    notif = Notification(
        title=data.title, message=data.message, target_role=data.target_role,
        notification_type=data.notification_type, created_by=current_user.id,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return NotificationOut(
        id=notif.id, title=notif.title, message=notif.message, target_role=notif.target_role,
        notification_type=notif.notification_type, is_active=notif.is_active, created_at=notif.created_at,
    )


@notifications_router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_active = False
    db.commit()
    return {"message": "Notification removed"}


# ─── CLASSES ──────────────────────────────────────────────────────────────────

@classes_router.get("", response_model=List[ClassOut])
def list_classes(medium: Optional[str] = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(Class)
    if medium:
        query = query.filter(Class.medium == medium)
    classes = query.all()
    return [ClassOut(id=c.id, name=c.name, section=c.section, medium=c.medium, teacher_id=c.teacher_id) for c in classes]


@classes_router.post("", response_model=ClassOut)
def create_class(data: ClassCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if data.teacher_id:
        teacher = db.query(Teacher).filter(Teacher.id == data.teacher_id).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")
        if teacher.medium != data.medium:
            raise HTTPException(status_code=400, detail="Teacher's medium does not match the class's medium")

    cls = Class(name=data.name, section=data.section, medium=data.medium, teacher_id=data.teacher_id)
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return ClassOut(id=cls.id, name=cls.name, section=cls.section, medium=cls.medium, teacher_id=cls.teacher_id)


# ─── SUBJECTS ─────────────────────────────────────────────────────────────────

@subjects_router.get("", response_model=List[SubjectOut])
def list_subjects(class_id: Optional[int] = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(Subject)
    if class_id:
        query = query.filter(Subject.class_id == class_id)
    subjects = query.all()
    return [SubjectOut(id=s.id, name=s.name, class_id=s.class_id) for s in subjects]


@subjects_router.post("", response_model=SubjectOut)
def create_subject(data: SubjectCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    subject = Subject(name=data.name, class_id=data.class_id)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return SubjectOut(id=subject.id, name=subject.name, class_id=subject.class_id)
