from __future__ import annotations

import datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel


class DepartmentRead(ORMModel):
    id: int
    name: str
    headcount: int
    hue: int


class EmployeeBase(BaseModel):
    name: str
    email: str
    title: str = ""
    department: str = ""
    type: str = "Full-time"
    status: str = "Active"
    location: str = ""
    start_date: datetime.date | None = None
    salary: int = 0
    performance: int = 0
    avatar_hue: int = 255


class EmployeeCreate(EmployeeBase):
    emp_code: str | None = None


class EmployeeUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    title: str | None = None
    department: str | None = None
    type: str | None = None
    status: str | None = None
    location: str | None = None
    salary: int | None = None
    performance: int | None = None


class EmployeeRead(ORMModel, EmployeeBase):
    id: int
    emp_code: str


class AttendanceRead(ORMModel):
    id: int
    employee_id: int
    date: datetime.date | None
    clock_in: str | None
    clock_out: str | None
    status: str
    hours: float


class AttendanceUpsert(BaseModel):
    employee_id: int
    date: datetime.date | None = None
    clock_in: str | None = None
    clock_out: str | None = None
    status: str = "Present"
    hours: float = 0.0


class LeaveRead(ORMModel):
    id: int
    employee_id: int
    type: str
    from_date: datetime.date | None
    to_date: datetime.date | None
    days: int
    reason: str
    status: str


class LeaveCreate(BaseModel):
    employee_id: int
    type: str = "Vacation"
    from_date: datetime.date | None = None
    to_date: datetime.date | None = None
    days: int = 1
    reason: str = ""


class LeaveDecision(BaseModel):
    status: str  # "Approved" | "Rejected"


class PayrollRead(ORMModel):
    id: int
    employee_id: int
    period: str
    base: int
    bonus: int
    deductions: int
    net: int
    status: str
