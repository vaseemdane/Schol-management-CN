from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Fee(Base):
    __tablename__ = "fees"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, unique=True)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0)
    academic_year = Column(String(20), nullable=False, default="2024-25")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="fees")
    payments = relationship("FeePayment", back_populates="fee")

    @property
    def paid_amount(self):
        return sum(p.amount for p in self.payments)

    @property
    def remaining_amount(self):
        return float(self.total_amount) - float(self.paid_amount)


class FeePayment(Base):
    __tablename__ = "fee_payments"

    id = Column(Integer, primary_key=True, index=True)
    fee_id = Column(Integer, ForeignKey("fees.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow)
    receipt_number = Column(String(50), unique=True, nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    fee = relationship("Fee", back_populates="payments")
