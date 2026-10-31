from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from app.api.deps import DbSession, require
from app.core.permissions import PERMISSION_GROUPS
from app.core.security import hash_password
from app.models import Permission, Role, User
from app.schemas.user import (
    AssignRole,
    PermissionRead,
    RoleCreate,
    RoleRead,
    RoleUpdate,
    UserCreate,
    UserRead,
    UserUpdate,
)

router = APIRouter(prefix="/rbac", tags=["access control"])


async def _permissions_for_keys(db, keys: list[str]) -> list[Permission]:
    if not keys:
        return []
    rows = (await db.execute(select(Permission).where(Permission.key.in_(keys)))).scalars().all()
    return list(rows)


@router.get("/permissions", dependencies=[Depends(require("rbac:view"))])
async def list_permission_catalog() -> list[dict]:
    """The full permission catalog grouped by module (for building the matrix)."""
    return [
        {
            "module": g["module"],
            "description": g["description"],
            "permissions": [{"key": k, "label": label} for (k, label) in g["permissions"]],
        }
        for g in PERMISSION_GROUPS
    ]


@router.get("/permissions/flat", response_model=list[PermissionRead], dependencies=[Depends(require("rbac:view"))])
async def list_permissions(db: DbSession):
    rows = (await db.execute(select(Permission).order_by(Permission.module, Permission.key))).scalars().all()
    return rows


@router.get("/roles", response_model=list[RoleRead], dependencies=[Depends(require("rbac:view"))])
async def list_roles(db: DbSession):
    roles = (await db.execute(select(Role).order_by(Role.is_system.desc(), Role.name))).scalars().all()
    return [RoleRead.from_role(r) for r in roles]


@router.post("/roles", response_model=RoleRead, status_code=201, dependencies=[Depends(require("rbac:manage"))])
async def create_role(payload: RoleCreate, db: DbSession):
    if await db.get(Role, payload.id):
        raise HTTPException(status.HTTP_409_CONFLICT, "Role id already exists")
    role = Role(
        id=payload.id, name=payload.name, description=payload.description, hue=payload.hue,
        is_system=False, is_superuser=False,
    )
    role.permissions = await _permissions_for_keys(db, payload.permissions)
    db.add(role)
    await db.flush()
    return RoleRead.from_role(role)


@router.patch("/roles/{role_id}", response_model=RoleRead, dependencies=[Depends(require("rbac:manage"))])
async def update_role(role_id: str, payload: RoleUpdate, db: DbSession):
    role = await db.get(Role, role_id)
    if role is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Role not found")
    if payload.name is not None:
        role.name = payload.name
    if payload.description is not None:
        role.description = payload.description
    if payload.hue is not None:
        role.hue = payload.hue
    if payload.permissions is not None:
        if role.is_superuser:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot edit permissions of a superuser role")
        role.permissions = await _permissions_for_keys(db, payload.permissions)
    await db.flush()
    return RoleRead.from_role(role)


@router.delete("/roles/{role_id}", status_code=204, dependencies=[Depends(require("rbac:manage"))])
async def delete_role(role_id: str, db: DbSession):
    role = await db.get(Role, role_id)
    if role is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Role not found")
    if role.is_system:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Built-in roles cannot be deleted")
    await db.delete(role)
    await db.flush()


@router.get("/users", response_model=list[UserRead], dependencies=[Depends(require("rbac:view"))])
async def list_users(db: DbSession):
    users = (await db.execute(select(User).order_by(User.full_name))).scalars().all()
    return [UserRead.from_user(u) for u in users]


@router.post("/users", response_model=UserRead, status_code=201, dependencies=[Depends(require("rbac:manage"))])
async def create_user(payload: UserCreate, db: DbSession):
    exists = (await db.execute(select(User).where(User.email == payload.email.lower()))).scalar_one_or_none()
    if exists:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    user = User(
        email=payload.email.lower(), full_name=payload.full_name, title=payload.title,
        hashed_password=hash_password(payload.password), hue=payload.hue,
    )
    roles = (await db.execute(select(Role).where(Role.id.in_(payload.role_ids)))).scalars().all()
    user.roles = list(roles)
    db.add(user)
    await db.flush()
    return UserRead.from_user(user)


@router.patch("/users/{user_id}", response_model=UserRead, dependencies=[Depends(require("rbac:manage"))])
async def update_user(user_id: int, payload: UserUpdate, db: DbSession):
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.flush()
    return UserRead.from_user(user)


@router.post("/users/{user_id}/role", response_model=UserRead, dependencies=[Depends(require("rbac:manage"))])
async def assign_role(user_id: int, payload: AssignRole, db: DbSession):
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    role = await db.get(Role, payload.role_id)
    if role is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Role not found")
    user.roles = [role]
    await db.flush()
    return UserRead.from_user(user)
