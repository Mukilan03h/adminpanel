from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class MfaChallenge(BaseModel):
    mfa_required: bool = True
    mfa_token: str
    methods: list[str] = Field(default_factory=lambda: ["totp"])


# Either a token pair (no MFA) or an MFA challenge.
class LoginResponse(BaseModel):
    mfa_required: bool = False
    tokens: TokenPair | None = None
    mfa_token: str | None = None
    methods: list[str] | None = None


class MfaVerifyRequest(BaseModel):
    mfa_token: str
    code: str


class MfaEmailStartRequest(BaseModel):
    mfa_token: str


class RefreshRequest(BaseModel):
    refresh_token: str


class MfaSetupResponse(BaseModel):
    secret: str
    otpauth_uri: str
    qr_data_uri: str
    backup_codes: list[str]


class MfaCodeRequest(BaseModel):
    code: str


class EmailOtpStartResponse(BaseModel):
    detail: str
    dev_otp: str | None = None  # only populated in dev for testing


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class MeResponse(BaseModel):
    user: UserRead
    permissions: list[str]
    is_superuser: bool
