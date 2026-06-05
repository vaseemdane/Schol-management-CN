from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class PromotionLog(Base):
    __tablename__ = "promotion_logs"

    id = Column(Integer, primary_key=True, index=True)
    from_academic_year = Column(String(20), nullable=False)
    to_academic_year = Column(String(20), nullable=False)
    promoted_count = Column(Integer, nullable=False, default=0)
    passed_out_count = Column(Integer, nullable=False, default=0)
    promoted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    operator = relationship("User")
    histories = relationship("PromotionHistory", back_populates="log", cascade="all, delete-orphan")


class PromotionHistory(Base):
    __tablename__ = "promotion_histories"

    id = Column(Integer, primary_key=True, index=True)
    promotion_log_id = Column(Integer, ForeignKey("promotion_logs.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    from_class_id = Column(Integer, ForeignKey("classes.id"), nullable=False)
    to_class_id = Column(Integer, ForeignKey("classes.id"), nullable=True) # NULL means passed out
    status = Column(String(20), nullable=False, default="promoted") # "promoted" or "passed_out"
    created_at = Column(DateTime, default=datetime.utcnow)

    log = relationship("PromotionLog", back_populates="histories")
    student = relationship("Student")
    from_class = relationship("Class", foreign_keys=[from_class_id])
    to_class = relationship("Class", foreign_keys=[to_class_id])
