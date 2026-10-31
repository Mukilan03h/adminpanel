import pytest

from tests.conftest import auth_headers

pytestmark = pytest.mark.asyncio

RESUME = """Jordan Avery
jordan.avery@example.com | +1 415 555 0199
Senior Frontend Engineer

Experience building apps with React, TypeScript and Node. Comfortable with
PostgreSQL, Docker and AWS.
"""


async def test_parse_resume_prefills_fields(client, api):
    hr = await auth_headers(client, "hr@peoplehub.io")
    r = await client.post(f"{api}/recruitment/parse-resume", headers=hr, json={"text": RESUME})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "jordan.avery@example.com"
    assert "React" in data["skills"] and "TypeScript" in data["skills"]
    assert "engineer" in data["role"].lower()


async def test_parse_resume_forbidden_for_employee(client, api):
    emp = await auth_headers(client, "employee@peoplehub.io")
    r = await client.post(f"{api}/recruitment/parse-resume", headers=emp, json={"text": RESUME})
    assert r.status_code == 403


async def test_company_id_format(client, api):
    admin = await auth_headers(client, "admin@peoplehub.io")
    r = await client.get(f"{api}/recruitment/company-id?department=Engineering", headers=admin)
    assert r.status_code == 200
    assert r.json()["employee_id"].startswith("PH-ENG-")
