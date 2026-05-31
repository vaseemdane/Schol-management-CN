from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    qualification = Column(String(100), nullable=True)
    monthly_salary = Column(Numeric(10, 2), default=0)
    assigned_classes = Column(Text, nullable=True)   # JSON string of class IDs
    assigned_subjects = Column(Text, nullable=True)  # JSON string of subject IDs
    medium = Column(String(20), nullable=False, default="English")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    classes = relationship("Class", back_populates="teacher", foreign_keys="Class.teacher_id")
    salary_records = relationship("Salary", back_populates="teacher")
