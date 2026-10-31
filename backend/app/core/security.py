from __future__ import annotations

import base64
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import jwt
import pyotp
from cryptography.fernet import Fernet
from pwdlib import PasswordHash

from app.core.config import settings

# ------------------------------------------------------------------ #
# Password hashing (Argon2 via pwdlib)
# ------------------------------------------------------------------ #
_pwd = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return _pwd.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return _pwd.verify(password, hashed)
    except Exception:
        return False


# ------------------------------------------------------------------ #
# JWT (access / refresh / mfa-challenge tokens)
# ------------------------------------------------------------------ #
TokenType = Literal["access", "refresh", "mfa"]

_EXPIRY = {
    "access": timedelta(minutes=settings.access_token_expire_minutes),
    "refresh": timedelta(days=settings.refresh_token_expire_days),
    "mfa": timedelta(minutes=settings.mfa_token_expire_minutes),
}


def create_token(subject: str, token_type: TokenType, extra: dict[str, Any] | None = None) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + _EXPIRY[token_type],
        "jti": secrets.token_urlsafe(16),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str, expected_type: TokenType | None = None) -> dict[str, Any]:
    """Decode & validate a JWT. Raises jwt exceptions on failure."""
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
    if expected_type is not None and payload.get("type") != expected_type:
        raise jwt.InvalidTokenError(f"expected {expected_type} token")
    return payload


def hash_token(token: str) -> str:
    """Opaque hash for storing refresh tokens at rest (lookup + revocation)."""
    return hashlib.sha256(token.encode()).hexdigest()


# ------------------------------------------------------------------ #
# TOTP secret encryption at rest (Fernet)
# ------------------------------------------------------------------ #
def _fernet() -> Fernet:
    key = settings.mfa_encryption_key
    if not key:
        # Derive a stable key from the app secret so dev works out of the box.
        digest = hashlib.sha256(settings.secret_key.encode()).digest()
        key = base64.urlsafe_b64encode(digest).decode()
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_secret(secret: str) -> str:
    return _fernet().encrypt(secret.encode()).decode()


def decrypt_secret(token: str) -> str:
    return _fernet().decrypt(token.encode()).decode()


# ------------------------------------------------------------------ #
# TOTP (authenticator app)
# ------------------------------------------------------------------ #
def generate_totp_secret() -> str:
    return pyotp.random_base32()


def totp_provisioning_uri(secret: str, account_name: str, issuer: str = "PeopleHub") -> str:
    return pyotp.TOTP(secret).provisioning_uri(name=account_name, issuer_name=issuer)


def verify_totp(secret: str, code: str, last_used_step: int | None = None) -> int | None:
    """
    Verify a TOTP code with a ±1 step window (clock drift). Returns the matched
    time-step (for replay protection) or None. Rejects reuse of a step already
    recorded in ``last_used_step``.
    """
    totp = pyotp.TOTP(secret)
    now = int(datetime.now(timezone.utc).timestamp())
    step_seconds = 30
    for offset in (0, -1, 1):
        at = now + offset * step_seconds
        if totp.verify(code, for_time=at, valid_window=0):
            step = at // step_seconds
            if last_used_step is not None and step <= last_used_step:
                return None  # replay
            return step
    return None


# ------------------------------------------------------------------ #
# Backup / recovery codes (single-use, hashed at rest)
# ------------------------------------------------------------------ #
def generate_backup_codes(count: int = 10) -> list[str]:
    codes: list[str] = []
    for _ in range(count):
        raw = secrets.token_hex(4).upper()  # 8 hex chars
        codes.append(f"{raw[:4]}-{raw[4:]}")
    return codes


def hash_backup_codes(codes: list[str]) -> list[str]:
    return [hash_password(c.replace("-", "").upper()) for c in codes]


def verify_and_consume_backup_code(code: str, hashed_codes: list[str]) -> list[str] | None:
    """If ``code`` matches one of the hashes, return the remaining hashes; else None."""
    normalized = code.replace("-", "").replace(" ", "").upper()
    for i, h in enumerate(hashed_codes):
        if verify_password(normalized, h):
            return hashed_codes[:i] + hashed_codes[i + 1 :]
    return None


# ------------------------------------------------------------------ #
# Email OTP (second MFA channel)
# ------------------------------------------------------------------ #
def generate_email_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"
