from __future__ import annotations

from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, IntPKMixin, TimestampMixin


class Department(Base, IntPKMixin):
    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    headcount: Mapped[int] = mapped_column(Integer, default=0)
    hue: Mapped[int] = mapped_column(Integer, default=255)


class Employee(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "employees"

    emp_code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(120), default="")
    department: Mapped[str] = mapped_column(String(80), default="")
    type: Mapped[str] = mapped_column(String(20), default="Full-time")
    status: Mapped[str] = mapped_column(String(20), default="Active")
    location: Mapped[str] = mapped_column(String(120), default="")
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    salary: Mapped[int] = mapped_column(Integer, default=0)
    performance: Mapped[int] = mapped_column(Integer, default=0)
    avatar_hue: Mapped[int] = mapped_column(Integer, default=255)


class Attendance(Base, IntPKMixin):
    __tablename__ = "attendance"

    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    date: Mapped[date | None] = mapped_column(Date, nullable=True)
    clock_in: Mapped[str | None] = mapped_column(String(8), nullable=True)
    clock_out: Mapped[str | None] = mapped_column(String(8), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="Present")
    hours: Mapped[float] = mapped_column(Float, default=0.0)


class LeaveRequest(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "leave_requests"

    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(20), default="Vacation")
    from_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    to_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    days: Mapped[int] = mapped_column(Integer, default=1)
    reason: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(16), default="Pending")


class PayrollRecord(Base, IntPKMixin):
    __tablename__ = "payroll_records"

    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    period: Mapped[str] = mapped_column(String(16), default="2026-10")
    base: Mapped[int] = mapped_column(Integer, default=0)
    bonus: Mapped[int] = mapped_column(Integer, default=0)
    deductions: Mapped[int] = mapped_column(Integer, default=0)
    net: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(16), default="Pending")
