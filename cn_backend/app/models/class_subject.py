from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)       # e.g., "Class 10"
    section = Column(String(10), nullable=False)    # e.g., "A"
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    medium = Column(String(20), nullable=False, default="English")
    created_at = Column(DateTime, default=datetime.utcnow)

    students = relationship("Student", back_populates="class_ref")
    subjects = relationship("Subject", back_populates="class_ref")
    teacher = relationship("Teacher", back_populates="classes", foreign_keys=[teacher_id])


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    class_ref = relationship("Class", back_populates="subjects")
    exams = relationship("Exam", back_populates="subject")
