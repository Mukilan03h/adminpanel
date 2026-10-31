"""
Canonical permission catalog and default roles — the single source of truth
shared conceptually with the frontend. Permission keys are "<module>:<action>".
The wildcard "*" grants everything.
"""

from __future__ import annotations

PERMISSION_GROUPS: list[dict] = [
    {"module": "Dashboard", "description": "Organization overview",
     "permissions": [("dashboard:view", "View dashboard")]},
    {"module": "Employees", "description": "People directory & records", "permissions": [
        ("employees:view", "View employees"), ("employees:create", "Add employees"),
        ("employees:edit", "Edit employees"), ("employees:delete", "Offboard employees"),
        ("employees:export", "Export data")]},
    {"module": "Attendance", "description": "Time & attendance", "permissions": [
        ("attendance:view", "View attendance"), ("attendance:manage", "Edit attendance")]},
    {"module": "Leave", "description": "Leave & time off", "permissions": [
        ("leave:view", "View leave"), ("leave:request", "Request leave"),
        ("leave:approve", "Approve / reject leave")]},
    {"module": "Payroll", "description": "Compensation & payroll", "permissions": [
        ("payroll:view", "View payroll"), ("payroll:run", "Run payroll")]},
    {"module": "Recruitment", "description": "Hiring pipeline", "permissions": [
        ("recruitment:view", "View recruitment"), ("recruitment:manage", "Manage candidates")]},
    {"module": "Performance", "description": "Reviews & goals", "permissions": [
        ("performance:view", "View performance"), ("performance:review", "Submit reviews")]},
    {"module": "Projects", "description": "Project & task tracker", "permissions": [
        ("projects:view", "View projects"), ("projects:create", "Create projects"),
        ("projects:manage", "Manage projects"), ("tasks:assign", "Assign tasks"),
        ("tasks:update", "Update task status")]},
    {"module": "Daily Updates", "description": "Standups & daily logs", "permissions": [
        ("updates:view", "View own updates"), ("updates:create", "Post daily updates"),
        ("updates:viewAll", "View everyone’s updates")]},
    {"module": "Meetings", "description": "Meetings & minutes", "permissions": [
        ("meetings:view", "View meetings"), ("meetings:create", "Schedule meetings"),
        ("meetings:editMinutes", "Edit minutes & actions")]},
    {"module": "Interns", "description": "Interns & scoring", "permissions": [
        ("interns:view", "View interns"), ("interns:score", "Score interns"),
        ("interns:manageRubric", "Define scoring rubric"), ("interns:docs", "Manage intern docs")]},
    {"module": "Documents", "description": "Document management", "permissions": [
        ("documents:view", "View documents"), ("documents:upload", "Upload documents"),
        ("documents:manage", "Manage & approve documents")]},
    {"module": "Access Control", "description": "Roles & permissions", "permissions": [
        ("rbac:view", "View roles"), ("rbac:manage", "Manage roles & assignments")]},
    {"module": "Settings", "description": "Workspace settings", "permissions": [
        ("settings:view", "View settings")]},
]

ALL_PERMISSIONS: list[str] = [p for g in PERMISSION_GROUPS for (p, _) in g["permissions"]]
PERMISSION_LABELS: dict[str, str] = {p: label for g in PERMISSION_GROUPS for (p, label) in g["permissions"]}

WILDCARD = "*"

DEFAULT_ROLES: list[dict] = [
    {"id": "admin", "name": "Administrator", "hue": 262, "system": True,
     "description": "Full access to every module and setting.", "permissions": [WILDCARD]},
    {"id": "hr", "name": "HR Manager", "hue": 280, "system": True,
     "description": "People operations, payroll, interns and documents.",
     "permissions": [
         "dashboard:view", "employees:view", "employees:create", "employees:edit",
         "employees:delete", "employees:export", "attendance:view", "attendance:manage",
         "leave:view", "leave:approve", "leave:request", "payroll:view", "payroll:run",
         "recruitment:view", "recruitment:manage", "performance:view", "performance:review",
         "meetings:view", "meetings:create", "meetings:editMinutes", "updates:view",
         "updates:viewAll", "interns:view", "interns:score", "interns:manageRubric",
         "interns:docs", "documents:view", "documents:upload", "documents:manage",
         "rbac:view", "rbac:manage", "settings:view"]},
    {"id": "pm", "name": "Project Manager", "hue": 200, "system": True,
     "description": "Owns projects, tasks, meetings and intern mentoring.",
     "permissions": [
         "dashboard:view", "employees:view", "projects:view", "projects:create",
         "projects:manage", "tasks:assign", "tasks:update", "updates:view", "updates:create",
         "updates:viewAll", "meetings:view", "meetings:create", "meetings:editMinutes",
         "performance:view", "performance:review", "interns:view", "interns:score",
         "documents:view", "documents:upload", "attendance:view", "leave:view",
         "leave:approve", "settings:view"]},
    {"id": "lead", "name": "Team Lead", "hue": 150, "system": True,
     "description": "Runs a squad: assigns tasks and scores interns.",
     "permissions": [
         "dashboard:view", "employees:view", "projects:view", "tasks:assign", "tasks:update",
         "updates:view", "updates:create", "updates:viewAll", "meetings:view", "meetings:create",
         "interns:view", "interns:score", "documents:view", "attendance:view", "leave:view",
         "settings:view"]},
    {"id": "employee", "name": "Employee", "hue": 240, "system": True,
     "description": "Standard access to own work and requests.",
     "permissions": [
         "dashboard:view", "projects:view", "tasks:update", "updates:view", "updates:create",
         "meetings:view", "performance:view", "leave:view", "leave:request", "attendance:view",
         "documents:view", "settings:view"]},
    {"id": "intern", "name": "Intern", "hue": 30, "system": True,
     "description": "Limited access: tasks, updates and own documents.",
     "permissions": [
         "dashboard:view", "projects:view", "tasks:update", "updates:view", "updates:create",
         "meetings:view", "leave:view", "leave:request", "documents:view", "settings:view"]},
]
