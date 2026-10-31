from __future__ import annotations

import os

# Must be set before importing the app so settings pick up the test config.
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "postgresql+asyncpg://postgres@127.0.0.1:55432/peoplehub_test"
os.environ["EXPOSE_DEV_OTP"] = "true"

import pytest  # noqa: E402
import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy import select  # noqa: E402

from app.core.database import SessionLocal, engine  # noqa: E402
from app.core.permissions import ALL_PERMISSIONS, DEFAULT_ROLES, PERMISSION_GROUPS, PERMISSION_LABELS  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Base, Permission, Role, User  # noqa: E402

DEMO_USERS = [
    ("admin@peoplehub.io", "Ananya Rao", "admin"),
    ("hr@peoplehub.io", "Priya Nair", "hr"),
    ("pm@peoplehub.io", "Rahul Mehta", "pm"),
    ("employee@peoplehub.io", "Vikram Singh", "employee"),
    ("intern@peoplehub.io", "Ishaan Gupta", "intern"),
]
PASSWORD = "Password123!"


async def _seed_min() -> None:
    module_of = {k: g["module"] for g in PERMISSION_GROUPS for (k, _) in g["permissions"]}
    async with SessionLocal() as db:
        for key in ALL_PERMISSIONS:
            db.add(Permission(key=key, label=PERMISSION_LABELS[key], module=module_of[key]))
        await db.flush()
        perm_rows = {p.key: p for p in (await db.execute(select(Permission))).scalars()}
        for r in DEFAULT_ROLES:
            role = Role(id=r["id"], name=r["name"], description=r["description"], hue=r["hue"],
                        is_system=r.get("system", False), is_superuser=r["permissions"] == ["*"])
            if not role.is_superuser:
                role.permissions = [perm_rows[k] for k in r["permissions"] if k in perm_rows]
            db.add(role)
        await db.flush()
        for email, name, role_id in DEMO_USERS:
            role = await db.get(Role, role_id)
            db.add(User(email=email, full_name=name, title=role_id,
                        hashed_password=hash_password(PASSWORD), roles=[role]))
        await db.commit()


async def _reset_and_seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    await _seed_min()


def pytest_configure(config):  # runs once before tests, on its own loop
    import asyncio

    asyncio.run(_reset_and_seed())


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


async def login(client: AsyncClient, email: str, password: str = PASSWORD) -> dict:
    """Returns the full login JSON (tokens or MFA challenge)."""
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return resp.json() | {"_status": resp.status_code}


async def auth_headers(client: AsyncClient, email: str) -> dict:
    data = await login(client, email)
    token = data["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def api():
    return "/api/v1"
