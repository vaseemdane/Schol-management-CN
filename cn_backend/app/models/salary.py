from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Salary(Base):
    __tablename__ = "salary"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    monthly_amount = Column(Numeric(10, 2), nullable=False)
    academic_year = Column(String(20), nullable=False, default="2024-25")
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship("Teacher", back_populates="salary_records")
    payments = relationship("SalaryPayment", back_populates="salary")

    @property
    def total_paid(self):
        return sum(p.amount for p in self.payments)


class SalaryPayment(Base):
    __tablename__ = "salary_payments"

    id = Column(Integer, primary_key=True, index=True)
    salary_id = Column(Integer, ForeignKey("salary.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    month = Column(String(20), nullable=False)  # e.g., "April 2024"
    payment_date = Column(DateTime, default=datetime.utcnow)
    receipt_number = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    salary = relationship("Salary", back_populates="payments")
