from __future__ import annotations

import time

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select

from app.api.crud_router import make_crud_router
from app.api.deps import DbSession, require
from app.crud import base as crud
from app.models import Attendance, Department, Employee, LeaveRequest, PayrollRecord
from app.schemas.common import Message, Page
from app.schemas.hr import (
    AttendanceRead,
    AttendanceUpsert,
    DepartmentRead,
    EmployeeCreate,
    EmployeeRead,
    EmployeeUpdate,
    LeaveCreate,
    LeaveDecision,
    LeaveRead,
    PayrollRead,
)

router = APIRouter()


def _emp_code(data: dict) -> dict:
    if not data.get("emp_code"):
        data["emp_code"] = f"EMP-{int(time.time() * 1000) % 100000}"
    return data


router.include_router(
    make_crud_router(
        prefix="/employees", tags=["employees"], model=Employee, name="Employee",
        read_schema=EmployeeRead, create_schema=EmployeeCreate, update_schema=EmployeeUpdate,
        perm_view="employees:view", perm_create="employees:create",
        perm_update="employees:edit", perm_delete="employees:delete",
        search_fields=("name", "email", "title"), order_by=Employee.name, pre_create=_emp_code,
    )
)

router.include_router(
    make_crud_router(
        prefix="/attendance", tags=["attendance"], model=Attendance, name="Attendance record",
        read_schema=AttendanceRead, create_schema=AttendanceUpsert, update_schema=AttendanceUpsert,
        perm_view="attendance:view", perm_create="attendance:manage",
        perm_update="attendance:manage", perm_delete="attendance:manage",
        order_by=Attendance.id,
    )
)

# --- Departments (read-only) ---
dept_router = APIRouter(prefix="/departments", tags=["departments"])


@dept_router.get("", response_model=list[DepartmentRead], dependencies=[Depends(require("employees:view", "dashboard:view"))])
async def list_departments(db: DbSession):
    return (await db.execute(select(Department).order_by(Department.name))).scalars().all()


router.include_router(dept_router)

# --- Leave ---
leave_router = APIRouter(prefix="/leave", tags=["leave"])


@leave_router.get("", response_model=Page[LeaveRead], dependencies=[Depends(require("leave:view"))])
async def list_leave(
    db: DbSession,
    status: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    return await crud.paginate(
        db, LeaveRequest, page=page, page_size=page_size,
        filters={"status": status}, order_by=LeaveRequest.id.desc(),
    )


@leave_router.post("", response_model=LeaveRead, status_code=201, dependencies=[Depends(require("leave:request"))])
async def create_leave(payload: LeaveCreate, db: DbSession):
    return await crud.create_obj(db, LeaveRequest, payload.model_dump())


@leave_router.post("/{leave_id}/decision", response_model=LeaveRead, dependencies=[Depends(require("leave:approve"))])
async def decide_leave(leave_id: int, payload: LeaveDecision, db: DbSession):
    obj = await crud.get_or_404(db, LeaveRequest, leave_id, "Leave request")
    return await crud.update_obj(db, obj, {"status": payload.status})


router.include_router(leave_router)

# --- Payroll ---
payroll_router = APIRouter(prefix="/payroll", tags=["payroll"])


@payroll_router.get("", response_model=Page[PayrollRead], dependencies=[Depends(require("payroll:view"))])
async def list_payroll(db: DbSession, page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200)):
    return await crud.paginate(db, PayrollRecord, page=page, page_size=page_size, order_by=PayrollRecord.id)


@payroll_router.post("/run", response_model=Message, dependencies=[Depends(require("payroll:run"))])
async def run_payroll(db: DbSession, period: str = "2026-10"):
    rows = (await db.execute(select(PayrollRecord).where(PayrollRecord.status == "Pending"))).scalars().all()
    for r in rows:
        r.status = "Processed"
    return Message(detail=f"Processed {len(rows)} pending records for {period}")


router.include_router(payroll_router)
