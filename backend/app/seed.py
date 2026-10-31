"""
Seed the database with the permission catalog, default roles, demo users and
representative Indian-context domain data.

Run with:  python -m app.seed
"""

from __future__ import annotations

import asyncio
from datetime import date

from sqlalchemy import func, select

from app.core.database import SessionLocal, engine
from app.core.permissions import ALL_PERMISSIONS, DEFAULT_ROLES, PERMISSION_LABELS, PERMISSION_GROUPS
from app.core.security import hash_password
from app.models import (
    ActionItem,
    Attendance,
    Base,
    Criterion,
    Department,
    Document,
    DailyUpdate,
    Employee,
    Intern,
    InternScore,
    LeaveRequest,
    Meeting,
    PayrollRecord,
    Permission,
    Project,
    Role,
    Task,
    User,
)

PASSWORD = "Password123!"

DEMO_USERS = [
    ("admin@peoplehub.io", "Ananya Rao", "Administrator", "admin", 262),
    ("hr@peoplehub.io", "Priya Nair", "HR Manager", "hr", 280),
    ("pm@peoplehub.io", "Rahul Mehta", "Project Manager", "pm", 200),
    ("lead@peoplehub.io", "Sneha Iyer", "Team Lead", "lead", 150),
    ("employee@peoplehub.io", "Vikram Singh", "Software Engineer", "employee", 240),
    ("intern@peoplehub.io", "Ishaan Gupta", "Engineering Intern", "intern", 30),
]

DEPARTMENTS = [
    ("Engineering", 86, 255), ("Product", 24, 200), ("Design", 18, 320), ("Marketing", 22, 30),
    ("Sales", 41, 150), ("People Ops", 14, 280), ("Finance", 12, 90), ("Customer Success", 31, 240),
]

EMPLOYEES = [
    ("EMP-1024", "Aarav Sharma", "Staff Engineer", "Engineering", "Active", "Bengaluru, IN", "2019-04-15", 182000, 92, 255),
    ("EMP-1042", "Mia Chen", "Product Manager", "Product", "Active", "San Francisco, US", "2020-09-01", 164000, 88, 200),
    ("EMP-1067", "Liam O'Connor", "Design Lead", "Design", "On leave", "Dublin, IE", "2018-02-20", 151000, 90, 320),
    ("EMP-1103", "Noah Williams", "Account Executive", "Sales", "Active", "Austin, US", "2022-01-10", 112000, 76, 150),
    ("EMP-1128", "Priya Nair", "People Partner", "People Ops", "Active", "Bengaluru, IN", "2020-11-03", 104000, 85, 280),
    ("EMP-1150", "Ethan Brown", "Senior Accountant", "Finance", "Probation", "London, UK", "2024-07-22", 96000, 70, 90),
    ("EMP-1198", "Lucas Müller", "Frontend Engineer", "Engineering", "Active", "Berlin, DE", "2021-03-29", 128000, 83, 262),
    ("EMP-1234", "Olivia Martin", "Backend Engineer", "Engineering", "Active", "Toronto, CA", "2022-08-08", 134000, 84, 250),
    ("EMP-1256", "Yuki Tanaka", "Data Scientist", "Product", "Active", "Tokyo, JP", "2021-12-01", 142000, 89, 195),
    ("EMP-1270", "Carlos Díaz", "SDR", "Sales", "Probation", "Madrid, ES", "2024-09-16", 68000, 66, 145),
]

PROJECTS = [
    ("Aadhaar KYC Revamp", "AKR", "FinServe India", "On track", 68, "Rahul Mehta", "2026-12-15", 255, ["Vikram Singh", "Sneha Iyer", "Ishaan Gupta"], 4200000),
    ("UPI Merchant Portal", "UMP", "PayBharat", "At risk", 44, "Sneha Iyer", "2026-11-28", 150, ["Vikram Singh", "Aditi Rao"], 2800000),
    ("HRMS Mobile App", "HMA", "Internal", "On track", 81, "Rahul Mehta", "2026-11-20", 280, ["Sneha Iyer", "Ishaan Gupta", "Diya Sharma"], 1600000),
    ("GST Filing Automation", "GFA", "TaxEasy", "Delayed", 29, "Vikram Singh", "2026-12-05", 30, ["Aditi Rao", "Diya Sharma"], 3500000),
    ("Analytics Dashboard", "ADX", "RetailNxt", "Completed", 100, "Sneha Iyer", "2026-10-10", 200, ["Vikram Singh"], 1900000),
]

TASKS = [
    (0, "Design OTP verification flow", "In progress", "High", "Sneha Iyer", "2026-11-05", ["design"], 5),
    (0, "Integrate Aadhaar sandbox API", "To do", "Urgent", "Vikram Singh", "2026-11-08", ["backend"], 8),
    (0, "Write API tests for KYC", "Backlog", "Medium", "Ishaan Gupta", "2026-11-12", ["testing"], 3),
    (1, "Merchant onboarding wizard", "In review", "High", "Vikram Singh", "2026-11-02", ["frontend"], 5),
    (1, "Settlement reconciliation job", "In progress", "Urgent", "Aditi Rao", "2026-11-06", ["backend"], 8),
    (2, "Push notifications (FCM)", "Done", "Medium", "Diya Sharma", "2026-10-28", ["mobile"], 3),
    (2, "Leave approval screen", "In progress", "High", "Sneha Iyer", "2026-11-04", ["mobile"], 5),
    (3, "GSTR-1 parser", "Backlog", "High", "Aditi Rao", "2026-11-18", ["backend"], 8),
]

INTERNS = [
    ("Ishaan Gupta", "IIT Bombay", "Engineering", "Sneha Iyer", "2026-06-02", "2026-12-02", "Active", 30),
    ("Diya Sharma", "BITS Pilani", "Engineering", "Rahul Mehta", "2026-07-01", "2026-12-31", "Active", 200),
    ("Arjun Reddy", "NIT Trichy", "Product", "Rahul Mehta", "2026-08-15", "2027-02-15", "Active", 280),
    ("Meera Krishnan", "VIT Vellore", "Design", "Sneha Iyer", "2026-05-10", "2026-11-10", "Extended", 320),
    ("Kabir Shah", "IIIT Hyderabad", "Engineering", "Vikram Singh", "2026-06-20", "2026-12-20", "Active", 150),
]

CRITERIA = [
    ("Technical skills", "Code quality, problem solving, tooling.", 30, "Manager"),
    ("Ownership", "Follows through, proactive, reliable.", 20, "Manager"),
    ("Communication", "Clear updates, asks good questions.", 15, "HR"),
    ("Collaboration", "Works well with the team.", 15, "HR"),
    ("Learning agility", "Picks up new concepts quickly.", 20, "Manager"),
]

DOCUMENTS = [
    ("Employee Handbook 2026", "Policy", "Priya Nair", ["admin", "hr", "pm", "lead", "employee", "intern"], "Approved", "v3.2", "2026-09-01", 1840),
    ("Leave & Attendance Policy (India)", "Policy", "Priya Nair", ["admin", "hr", "pm", "lead", "employee", "intern"], "Approved", "v2.0", "2026-08-12", 640),
    ("Master Services Agreement — FinServe", "Contract", "Ananya Rao", ["admin", "hr", "pm"], "Approved", "v1.0", "2026-07-20", 2210),
    ("Intern Offer — Ishaan Gupta", "Intern", "Priya Nair", ["admin", "hr"], "Approved", "v1.0", "2026-05-28", 320),
    ("Intern NDA — Diya Sharma", "Intern", "Priya Nair", ["admin", "hr"], "Pending", "v1.0", "2026-10-20", 290),
    ("Q3 Financial Report", "Finance", "Ethan Brown", ["admin", "hr"], "Approved", "v1.1", "2026-10-05", 980),
    ("PF & Gratuity Guidelines", "Policy", "Priya Nair", ["admin", "hr", "employee"], "Expired", "v1.4", "2025-04-01", 410),
]


def _d(s: str | None):
    return date.fromisoformat(s) if s else None


async def seed() -> None:
    async with SessionLocal() as db:
        # --- Permissions ---
        existing_perms = {p.key for p in (await db.execute(select(Permission))).scalars()}
        module_of = {k: g["module"] for g in PERMISSION_GROUPS for (k, _) in g["permissions"]}
        for key in ALL_PERMISSIONS:
            if key not in existing_perms:
                db.add(Permission(key=key, label=PERMISSION_LABELS[key], module=module_of[key]))
        await db.flush()

        all_perm_rows = {p.key: p for p in (await db.execute(select(Permission))).scalars()}

        # --- Roles ---
        for r in DEFAULT_ROLES:
            role = await db.get(Role, r["id"])
            if role is None:
                role = Role(id=r["id"])
                db.add(role)
            role.name = r["name"]
            role.description = r["description"]
            role.hue = r["hue"]
            role.is_system = r.get("system", False)
            role.is_superuser = r["permissions"] == ["*"]
            if not role.is_superuser:
                role.permissions = [all_perm_rows[k] for k in r["permissions"] if k in all_perm_rows]
        await db.flush()

        # --- Users ---
        user_count = (await db.execute(select(func.count()).select_from(User))).scalar_one()
        if user_count == 0:
            for email, name, title, role_id, hue in DEMO_USERS:
                role = await db.get(Role, role_id)
                db.add(User(
                    email=email, full_name=name, title=title,
                    hashed_password=hash_password(PASSWORD), hue=hue, roles=[role] if role else [],
                ))
            await db.flush()

        # --- Domain data (only if empty) ---
        if (await db.execute(select(func.count()).select_from(Employee))).scalar_one() == 0:
            for name, hc, hue in DEPARTMENTS:
                db.add(Department(name=name, headcount=hc, hue=hue))

            emp_rows: list[Employee] = []
            for code, name, title, dept, status, loc, start, salary, perf, hue in EMPLOYEES:
                e = Employee(
                    emp_code=code, name=name, email=f"{name.lower().replace(' ', '.').replace(chr(39), '')}@peoplehub.io",
                    title=title, department=dept, type="Full-time", status=status, location=loc,
                    start_date=_d(start), salary=salary, performance=perf, avatar_hue=hue,
                )
                db.add(e)
                emp_rows.append(e)
            await db.flush()

            for i, e in enumerate(emp_rows):
                st = "Leave" if e.status == "On leave" else ("Late" if i % 5 == 1 else ("Remote" if i % 3 == 0 else "Present"))
                db.add(Attendance(
                    employee_id=e.id, date=date(2026, 10, 31),
                    clock_in=None if st == "Leave" else "08:45", clock_out=None if st == "Leave" else "17:40",
                    status=st, hours=0 if st == "Leave" else 7.5,
                ))
                base = round(e.salary / 12)
                bonus = round(base * 0.1) if i % 3 == 0 else 0
                ded = round(base * 0.22)
                db.add(PayrollRecord(
                    employee_id=e.id, period="2026-10", base=base, bonus=bonus, deductions=ded,
                    net=base + bonus - ded, status="Pending" if i % 5 == 0 else "Processed",
                ))

            db.add(LeaveRequest(employee_id=emp_rows[1].id, type="Vacation", from_date=_d("2026-11-09"),
                                to_date=_d("2026-11-13"), days=5, reason="Family trip", status="Pending"))
            db.add(LeaveRequest(employee_id=emp_rows[3].id, type="Sick", from_date=_d("2026-10-28"),
                                to_date=_d("2026-10-29"), days=2, reason="Flu recovery", status="Approved"))

            # Projects + tasks
            proj_rows: list[Project] = []
            for name, code, client, status, prog, lead, due, hue, members, budget in PROJECTS:
                p = Project(name=name, code=code, client=client, status=status, progress=prog, lead=lead,
                            due=_d(due), hue=hue, members=members, budget_inr=budget)
                db.add(p)
                proj_rows.append(p)
            await db.flush()
            for pidx, title, status, prio, assignee, due, tags, pts in TASKS:
                db.add(Task(project_id=proj_rows[pidx].id, title=title, status=status, priority=prio,
                            assignee=assignee, due=_d(due), tags=tags, points=pts))

            # Daily updates
            db.add(DailyUpdate(author="Vikram Singh", role="Software Engineer", date=_d("2026-10-31"),
                               project="Aadhaar KYC Revamp", done="Wired the Aadhaar sandbox API.",
                               blockers="Waiting on prod credentials.", hours=7.5, hue=240))
            db.add(DailyUpdate(author="Ishaan Gupta", role="Intern", date=_d("2026-10-31"),
                               project="Aadhaar KYC Revamp", done="Wrote unit tests, 82% coverage.",
                               blockers="None", hours=6, hue=30))

            # Meetings + action items
            m = Meeting(title="Aadhaar KYC — Sprint 7 Review", date=_d("2026-10-30"), time="15:00", type="Review",
                        attendees=["Rahul Mehta", "Sneha Iyer", "Vikram Singh", "Ishaan Gupta"],
                        agenda=["Demo OTP flow", "API status", "Risks"],
                        minutes="Team demoed the OTP flow. Aadhaar integration 70% complete.",
                        decisions=["Ship OTP flow to staging by Nov 5"], hue=255,
                        link="https://meet.peoplehub.io/sprint7-review")
            db.add(m)
            await db.flush()
            db.add(ActionItem(meeting_id=m.id, text="Raise credential request with FinServe", owner="Rahul Mehta", due=_d("2026-11-01"), done=True))
            db.add(ActionItem(meeting_id=m.id, text="Complete KYC API tests", owner="Ishaan Gupta", due=_d("2026-11-12"), done=False))

            # Interns + criteria + scores
            intern_rows: list[Intern] = []
            for name, college, dept, mentor, start, end, status, hue in INTERNS:
                it = Intern(name=name, college=college, department=dept, mentor=mentor, start_date=_d(start),
                            end_date=_d(end), status=status, hue=hue)
                db.add(it)
                intern_rows.append(it)
            crit_rows: list[Criterion] = []
            for name, desc, weight, by in CRITERIA:
                c = Criterion(name=name, description=desc, weight=weight, defined_by=by)
                db.add(c)
                crit_rows.append(c)
            await db.flush()
            sample = [9, 8, 7, 8, 9]
            for it in intern_rows:
                for ci, c in enumerate(crit_rows):
                    db.add(InternScore(intern_id=it.id, criterion_id=c.id, score=sample[ci]))

            # Documents
            for name, cat, owner, roles, status, ver, updated, size in DOCUMENTS:
                is_link = size == 0
                db.add(Document(name=name, category=cat, owner=owner, access_roles=roles, status=status,
                                version=ver, updated=_d(updated), size_kb=size,
                                source="link" if is_link else "file",
                                file_type="Link" if is_link else ("DOCX" if name.lower().endswith("template") else "PDF"),
                                url="" if is_link else f"#/files/{name[:12]}.pdf",
                                assigned_to=["Everyone"] if "admin" in roles and "intern" in roles else [owner]))

        await db.commit()
    await engine.dispose()
    print("Seed complete. Demo users (password: %s):" % PASSWORD)
    for email, name, _, role_id, _ in DEMO_USERS:
        print(f"  {email:28s} {role_id}")


async def ensure_tables() -> None:
    """Create tables directly (handy for tests / quick start without Alembic)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


if __name__ == "__main__":
    asyncio.run(seed())
