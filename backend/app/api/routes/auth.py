from __future__ import annotations

import base64
import io
from datetime import datetime, timedelta, timezone

import jwt
import qrcode
from fastapi import APIRouter, HTTPException, Request, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession, client_ip
from app.core.config import settings
from app.core.rate_limit import limiter
from app.core.security import (
    create_token,
    decode_token,
    decrypt_secret,
    encrypt_secret,
    generate_backup_codes,
    generate_email_otp,
    generate_totp_secret,
    hash_backup_codes,
    hash_password,
    hash_token,
    totp_provisioning_uri,
    verify_and_consume_backup_code,
    verify_password,
    verify_totp,
)
from app.models import AuditLog, RefreshToken, User
from app.schemas.auth import (
    EmailOtpStartResponse,
    LoginRequest,
    LoginResponse,
    MeResponse,
    MfaCodeRequest,
    MfaEmailStartRequest,
    MfaSetupResponse,
    MfaVerifyRequest,
    PasswordChange,
    RefreshRequest,
    TokenPair,
)
from app.schemas.common import Message
from app.schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


async def _audit(db, user_id, actor, action, detail="", ip=""):
    db.add(AuditLog(user_id=user_id, actor=actor, action=action, detail=detail, ip=ip))


async def _issue_tokens(db, user: User, request: Request) -> TokenPair:
    access = create_token(str(user.id), "access", {"email": user.email})
    refresh = create_token(str(user.id), "refresh")
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(refresh),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days),
            user_agent=request.headers.get("user-agent", "")[:255],
            ip=client_ip(request),
        )
    )
    return TokenPair(access_token=access, refresh_token=refresh)


def _methods_for(user: User) -> list[str]:
    methods = []
    if user.mfa_secret_enc:
        methods.append("totp")
    if user.mfa_backup_codes:
        methods.append("backup_code")
    methods.append("email")
    return methods


@router.post("/login", response_model=LoginResponse)
@limiter.limit(settings.rate_limit_login)
async def login(request: Request, payload: LoginRequest, db: DbSession):
    user = (
        await db.execute(select(User).where(User.email == payload.email.lower()))
    ).scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.hashed_password):
        await _audit(db, None, payload.email, "login.failed", ip=client_ip(request))
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account disabled")

    if user.mfa_enabled:
        mfa_token = create_token(str(user.id), "mfa")
        await _audit(db, user.id, user.full_name, "login.mfa_required", ip=client_ip(request))
        return LoginResponse(mfa_required=True, mfa_token=mfa_token, methods=_methods_for(user))

    tokens = await _issue_tokens(db, user, request)
    await _audit(db, user.id, user.full_name, "login.success", ip=client_ip(request))
    return LoginResponse(mfa_required=False, tokens=tokens)


async def _user_from_mfa_token(db, token: str) -> User:
    try:
        payload = decode_token(token, expected_type="mfa")
    except jwt.InvalidTokenError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired MFA session")
    user = (await db.execute(select(User).where(User.id == int(payload["sub"])))).scalar_one_or_none()
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


@router.post("/mfa/email/start", response_model=EmailOtpStartResponse)
@limiter.limit(settings.rate_limit_login)
async def mfa_email_start(request: Request, payload: MfaEmailStartRequest, db: DbSession):
    # Identifies the user mid-login via the short-lived MFA token.
    user = await _user_from_mfa_token(db, payload.mfa_token)
    otp = generate_email_otp()
    user.email_otp_hash = hash_password(otp)
    user.email_otp_expires = datetime.now(timezone.utc) + timedelta(minutes=10)
    # In production this would be emailed; in dev we return it for testing.
    return EmailOtpStartResponse(
        detail=f"A one-time code was sent to {user.email}.",
        dev_otp=otp if settings.expose_dev_otp else None,
    )


@router.post("/mfa/verify", response_model=TokenPair)
@limiter.limit(settings.rate_limit_login)
async def mfa_verify(request: Request, payload: MfaVerifyRequest, db: DbSession):
    user = await _user_from_mfa_token(db, payload.mfa_token)
    code = payload.code.strip()
    ok = False

    # 1) TOTP
    if user.mfa_secret_enc:
        secret = decrypt_secret(user.mfa_secret_enc)
        step = verify_totp(secret, code, user.mfa_last_step)
        if step is not None:
            user.mfa_last_step = step
            ok = True

    # 2) Backup code
    if not ok and user.mfa_backup_codes:
        remaining = verify_and_consume_backup_code(code, user.mfa_backup_codes)
        if remaining is not None:
            user.mfa_backup_codes = remaining
            ok = True

    # 3) Email OTP
    if not ok and user.email_otp_hash and user.email_otp_expires:
        not_expired = user.email_otp_expires > datetime.now(timezone.utc)
        if not_expired and verify_password(code, user.email_otp_hash):
            user.email_otp_hash = None
            user.email_otp_expires = None
            ok = True

    if not ok:
        await _audit(db, user.id, user.full_name, "mfa.failed", ip=client_ip(request))
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid verification code")

    tokens = await _issue_tokens(db, user, request)
    await _audit(db, user.id, user.full_name, "login.success_mfa", ip=client_ip(request))
    return tokens


@router.post("/refresh", response_model=TokenPair)
async def refresh(request: Request, payload: RefreshRequest, db: DbSession):
    try:
        decode_token(payload.refresh_token, expected_type="refresh")
    except jwt.InvalidTokenError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")

    token_hash = hash_token(payload.refresh_token)
    stored = (
        await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    ).scalar_one_or_none()
    if stored is None or stored.revoked or stored.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token revoked or expired")

    user = await db.get(User, stored.user_id)
    if user is None or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User inactive")

    stored.revoked = True  # rotation
    return await _issue_tokens(db, user, request)


@router.post("/logout", response_model=Message)
async def logout(payload: RefreshRequest, db: DbSession):
    token_hash = hash_token(payload.refresh_token)
    stored = (
        await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    ).scalar_one_or_none()
    if stored:
        stored.revoked = True
    return Message(detail="Logged out")


@router.get("/me", response_model=MeResponse)
async def me(user: CurrentUser):
    perms = sorted(user.permission_set)
    return MeResponse(
        user=UserRead.from_user(user),
        permissions=perms,
        is_superuser=user.is_superuser,
    )


@router.post("/password", response_model=Message)
async def change_password(payload: PasswordChange, user: CurrentUser, db: DbSession):
    if not verify_password(payload.current_password, user.hashed_password):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")
    user.hashed_password = hash_password(payload.new_password)
    await _audit(db, user.id, user.full_name, "password.changed")
    return Message(detail="Password updated")


# ------------------------- MFA enrollment -------------------------
def _qr_data_uri(data: str) -> str:
    img = qrcode.make(data)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


@router.post("/mfa/setup", response_model=MfaSetupResponse)
async def mfa_setup(user: CurrentUser, db: DbSession):
    secret = generate_totp_secret()
    backup = generate_backup_codes()
    user.mfa_secret_enc = encrypt_secret(secret)
    user.mfa_backup_codes = hash_backup_codes(backup)
    user.mfa_last_step = None
    # not enabled until a first code is verified via /mfa/enable
    uri = totp_provisioning_uri(secret, user.email)
    await _audit(db, user.id, user.full_name, "mfa.setup_started")
    return MfaSetupResponse(
        secret=secret, otpauth_uri=uri, qr_data_uri=_qr_data_uri(uri), backup_codes=backup
    )


@router.post("/mfa/enable", response_model=Message)
async def mfa_enable(payload: MfaCodeRequest, user: CurrentUser, db: DbSession):
    if not user.mfa_secret_enc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Run MFA setup first")
    secret = decrypt_secret(user.mfa_secret_enc)
    step = verify_totp(secret, payload.code.strip())
    if step is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid code")
    user.mfa_enabled = True
    user.mfa_last_step = step
    await _audit(db, user.id, user.full_name, "mfa.enabled")
    return Message(detail="Two-factor authentication enabled")


@router.post("/mfa/disable", response_model=Message)
async def mfa_disable(payload: MfaCodeRequest, user: CurrentUser, db: DbSession):
    if not user.mfa_enabled:
        return Message(detail="MFA is not enabled")
    ok = False
    if user.mfa_secret_enc:
        secret = decrypt_secret(user.mfa_secret_enc)
        if verify_totp(secret, payload.code.strip()) is not None:
            ok = True
    if not ok and user.mfa_backup_codes:
        if verify_and_consume_backup_code(payload.code.strip(), user.mfa_backup_codes) is not None:
            ok = True
    if not ok:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid code")
    user.mfa_enabled = False
    user.mfa_secret_enc = None
    user.mfa_backup_codes = []
    user.mfa_last_step = None
    await _audit(db, user.id, user.full_name, "mfa.disabled")
    return Message(detail="Two-factor authentication disabled")
