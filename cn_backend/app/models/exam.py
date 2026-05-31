from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Date, Numeric, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)       # e.g., "Mid-Term 2024"
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    exam_date = Column(Date, nullable=True)
    total_marks = Column(Integer, nullable=False, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)

    class_ref = relationship("Class")
    subject = relationship("Subject", back_populates="exams")
    marks = relationship("Mark", back_populates="exam")


class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    marks_obtained = Column(Numeric(6, 2), nullable=False)
    grade = Column(String(5), nullable=True)
    remarks = Column(Text, nullable=True)
    entered_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="marks")
    exam = relationship("Exam", back_populates="marks")
    marker = relationship("User", foreign_keys=[entered_by])
