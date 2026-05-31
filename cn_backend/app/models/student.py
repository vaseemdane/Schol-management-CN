from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    roll_number = Column(String(20), unique=True, nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    section = Column(String(10), nullable=False)
    parent_name = Column(String(100), nullable=True)
    parent_mobile = Column(String(15), nullable=True)
    address = Column(Text, nullable=True)
    photo_url = Column(String(255), nullable=True)
    medium = Column(String(20), nullable=False, default="English")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
    class_ref = relationship("Class", back_populates="students")
    attendance_records = relationship("Attendance", back_populates="student")
    marks = relationship("Mark", back_populates="student")
    fees = relationship("Fee", back_populates="student")
    certificates = relationship("Certificate", back_populates="student")
