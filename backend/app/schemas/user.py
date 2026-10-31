from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel


class PermissionRead(ORMModel):
    key: str
    label: str
    module: str


class RoleRead(ORMModel):
    id: str
    name: str
    description: str
    hue: int
    is_system: bool
    is_superuser: bool
    permissions: list[str] = Field(default_factory=list)

    @classmethod
    def from_role(cls, role) -> "RoleRead":
        return cls(
            id=role.id, name=role.name, description=role.description, hue=role.hue,
            is_system=role.is_system, is_superuser=role.is_superuser,
            permissions=role.permission_keys,
        )


class RoleCreate(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9-]+$", max_length=48)
    name: str
    description: str = ""
    hue: int = 220
    permissions: list[str] = Field(default_factory=list)


class RoleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    hue: int | None = None
    permissions: list[str] | None = None


class UserRead(ORMModel):
    id: int
    email: EmailStr
    full_name: str
    title: str
    is_active: bool
    hue: int
    mfa_enabled: bool
    roles: list[str] = Field(default_factory=list)

    @classmethod
    def from_user(cls, user) -> "UserRead":
        return cls(
            id=user.id, email=user.email, full_name=user.full_name, title=user.title,
            is_active=user.is_active, hue=user.hue, mfa_enabled=user.mfa_enabled,
            roles=[r.id for r in user.roles],
        )


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    title: str = ""
    password: str = Field(min_length=8)
    hue: int = 255
    role_ids: list[str] = Field(default_factory=lambda: ["employee"])


class UserUpdate(BaseModel):
    full_name: str | None = None
    title: str | None = None
    is_active: bool | None = None
    hue: int | None = None


class AssignRole(BaseModel):
    role_id: str
