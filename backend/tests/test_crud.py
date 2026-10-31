import pytest

from tests.conftest import auth_headers

pytestmark = pytest.mark.asyncio


async def test_employee_crud(client, api):
    admin = await auth_headers(client, "admin@peoplehub.io")

    created = await client.post(
        f"{api}/employees", headers=admin,
        json={"name": "Jordan Avery", "email": "jordan@peoplehub.io", "title": "Engineer",
              "department": "Engineering", "salary": 120000},
    )
    assert created.status_code == 201
    emp = created.json()
    assert emp["emp_code"].startswith("EMP-")
    emp_id = emp["id"]

    listed = await client.get(f"{api}/employees?search=Jordan", headers=admin)
    assert listed.status_code == 200
    assert listed.json()["total"] >= 1

    patched = await client.patch(f"{api}/employees/{emp_id}", headers=admin, json={"title": "Senior Engineer"})
    assert patched.json()["title"] == "Senior Engineer"

    deleted = await client.delete(f"{api}/employees/{emp_id}", headers=admin)
    assert deleted.status_code == 204
    assert (await client.get(f"{api}/employees/{emp_id}", headers=admin)).status_code == 404


async def test_employee_create_forbidden_for_employee_role(client, api):
    emp = await auth_headers(client, "employee@peoplehub.io")
    r = await client.post(
        f"{api}/employees", headers=emp,
        json={"name": "X", "email": "x@peoplehub.io"},
    )
    assert r.status_code == 403


async def test_project_and_task_flow(client, api):
    pm = await auth_headers(client, "pm@peoplehub.io")

    proj = await client.post(
        f"{api}/projects", headers=pm,
        json={"name": "New Platform", "code": "NPL", "client": "Acme", "lead": "Rahul Mehta"},
    )
    assert proj.status_code == 201
    pid = proj.json()["id"]

    task = await client.post(
        f"{api}/tasks", headers=pm,
        json={"project_id": pid, "title": "Set up CI", "priority": "High", "assignee": "Vikram Singh"},
    )
    assert task.status_code == 201
    tid = task.json()["id"]

    moved = await client.patch(f"{api}/tasks/{tid}", headers=pm, json={"status": "In progress"})
    assert moved.json()["status"] == "In progress"


async def test_leave_request_and_approval(client, api):
    admin = await auth_headers(client, "admin@peoplehub.io")
    # create an employee record to attach the leave to
    emp = (await client.post(f"{api}/employees", headers=admin,
                             json={"name": "Leave Taker", "email": "lt@peoplehub.io"})).json()

    employee = await auth_headers(client, "employee@peoplehub.io")
    req = await client.post(
        f"{api}/leave", headers=employee,
        json={"employee_id": emp["id"], "type": "Vacation", "days": 3, "reason": "Trip"},
    )
    assert req.status_code == 201
    leave_id = req.json()["id"]
    assert req.json()["status"] == "Pending"

    # employee cannot approve
    bad = await client.post(f"{api}/leave/{leave_id}/decision", headers=employee, json={"status": "Approved"})
    assert bad.status_code == 403

    # hr can approve
    hr = await auth_headers(client, "hr@peoplehub.io")
    ok = await client.post(f"{api}/leave/{leave_id}/decision", headers=hr, json={"status": "Approved"})
    assert ok.status_code == 200
    assert ok.json()["status"] == "Approved"


async def test_intern_scoring(client, api):
    admin = await auth_headers(client, "admin@peoplehub.io")
    intern = (await client.post(f"{api}/interns", headers=admin,
                                json={"name": "Scored Intern", "college": "IIT Delhi", "stipend_inr": 40000})).json()
    crit = (await client.post(f"{api}/criteria", headers=admin,
                              json={"name": "Impact", "weight": 50, "defined_by": "Manager"})).json()

    score = await client.put(
        f"{api}/scores", headers=admin,
        json={"intern_id": intern["id"], "criterion_id": crit["id"], "score": 8},
    )
    assert score.status_code == 200
    assert score.json()["score"] == 8

    # update (upsert) same score
    score2 = await client.put(
        f"{api}/scores", headers=admin,
        json={"intern_id": intern["id"], "criterion_id": crit["id"], "score": 9},
    )
    assert score2.json()["score"] == 9


async def test_documents_role_aware_visibility(client, api):
    admin = await auth_headers(client, "admin@peoplehub.io")
    # Admin-only document
    await client.post(f"{api}/documents", headers=admin,
                      json={"name": "Board Minutes", "category": "Contract", "access_roles": ["admin", "hr"]})
    # Everyone document
    await client.post(f"{api}/documents", headers=admin,
                      json={"name": "Holiday Calendar", "category": "Policy",
                            "access_roles": ["admin", "hr", "pm", "lead", "employee", "intern"]})

    admin_docs = (await client.get(f"{api}/documents", headers=admin)).json()
    intern = await auth_headers(client, "intern@peoplehub.io")
    intern_docs = (await client.get(f"{api}/documents", headers=intern)).json()

    admin_names = {d["name"] for d in admin_docs}
    intern_names = {d["name"] for d in intern_docs}
    assert "Board Minutes" in admin_names
    assert "Holiday Calendar" in intern_names
    assert "Board Minutes" not in intern_names  # restricted
