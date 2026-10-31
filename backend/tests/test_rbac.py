import pytest

from tests.conftest import PASSWORD, auth_headers

pytestmark = pytest.mark.asyncio


async def test_employee_forbidden_payroll(client, api):
    headers = await auth_headers(client, "employee@peoplehub.io")
    r = await client.get(f"{api}/payroll", headers=headers)
    assert r.status_code == 403


async def test_hr_allowed_payroll(client, api):
    headers = await auth_headers(client, "hr@peoplehub.io")
    r = await client.get(f"{api}/payroll", headers=headers)
    assert r.status_code == 200


async def test_intern_me_permissions(client, api):
    headers = await auth_headers(client, "intern@peoplehub.io")
    me = (await client.get(f"{api}/auth/me", headers=headers)).json()
    perms = set(me["permissions"])
    assert me["is_superuser"] is False
    assert "dashboard:view" in perms
    assert "payroll:view" not in perms
    assert "rbac:manage" not in perms


async def test_employee_cannot_access_rbac(client, api):
    headers = await auth_headers(client, "employee@peoplehub.io")
    r = await client.get(f"{api}/rbac/roles", headers=headers)
    assert r.status_code == 403


async def test_admin_create_update_delete_role(client, api):
    admin = await auth_headers(client, "admin@peoplehub.io")

    created = await client.post(
        f"{api}/rbac/roles", headers=admin,
        json={"id": "qa-lead", "name": "QA Lead", "description": "Quality", "hue": 180,
              "permissions": ["dashboard:view", "projects:view"]},
    )
    assert created.status_code == 201
    assert set(created.json()["permissions"]) == {"dashboard:view", "projects:view"}

    patched = await client.patch(
        f"{api}/rbac/roles/qa-lead", headers=admin,
        json={"permissions": ["dashboard:view", "projects:view", "tasks:update"]},
    )
    assert patched.status_code == 200
    assert "tasks:update" in patched.json()["permissions"]

    deleted = await client.delete(f"{api}/rbac/roles/qa-lead", headers=admin)
    assert deleted.status_code == 204


async def test_cannot_delete_system_role(client, api):
    admin = await auth_headers(client, "admin@peoplehub.io")
    r = await client.delete(f"{api}/rbac/roles/hr", headers=admin)
    assert r.status_code == 400


async def test_dynamic_role_assignment_changes_access(client, api):
    admin = await auth_headers(client, "admin@peoplehub.io")

    # Create a user with the employee role
    created = await client.post(
        f"{api}/rbac/users", headers=admin,
        json={"email": "tester@peoplehub.io", "full_name": "Test User",
              "password": PASSWORD, "role_ids": ["employee"]},
    )
    assert created.status_code == 201
    user_id = created.json()["id"]

    # As employee: payroll forbidden
    tester = await auth_headers(client, "tester@peoplehub.io")
    assert (await client.get(f"{api}/payroll", headers=tester)).status_code == 403

    # Admin promotes the user to HR
    assigned = await client.post(
        f"{api}/rbac/users/{user_id}/role", headers=admin, json={"role_id": "hr"}
    )
    assert assigned.status_code == 200

    # Re-login -> now allowed
    tester2 = await auth_headers(client, "tester@peoplehub.io")
    assert (await client.get(f"{api}/payroll", headers=tester2)).status_code == 200
