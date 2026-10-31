import time

import pyotp
import pytest

from tests.conftest import PASSWORD, auth_headers, login

pytestmark = pytest.mark.asyncio


async def _make_user(client, api, email: str) -> dict:
    """Create a dedicated throwaway user (as admin) and return its auth headers."""
    admin = await auth_headers(client, "admin@peoplehub.io")
    await client.post(
        f"{api}/rbac/users", headers=admin,
        json={"email": email, "full_name": "MFA User", "password": PASSWORD, "role_ids": ["employee"]},
    )
    return await auth_headers(client, email)


async def test_login_success_no_mfa(client, api):
    data = await login(client, "admin@peoplehub.io")
    assert data["_status"] == 200
    assert data["mfa_required"] is False
    assert data["tokens"]["access_token"]

    headers = {"Authorization": f"Bearer {data['tokens']['access_token']}"}
    me = await client.get(f"{api}/auth/me", headers=headers)
    assert me.status_code == 200
    body = me.json()
    assert body["is_superuser"] is True
    assert body["user"]["email"] == "admin@peoplehub.io"


async def test_login_wrong_password(client):
    data = await login(client, "admin@peoplehub.io", "wrong-password")
    assert data["_status"] == 401


async def test_refresh_rotation(client, api):
    data = await login(client, "hr@peoplehub.io")
    refresh = data["tokens"]["refresh_token"]

    r1 = await client.post(f"{api}/auth/refresh", json={"refresh_token": refresh})
    assert r1.status_code == 200
    new_refresh = r1.json()["refresh_token"]
    assert new_refresh != refresh

    # old refresh is now revoked (rotation)
    r2 = await client.post(f"{api}/auth/refresh", json={"refresh_token": refresh})
    assert r2.status_code == 401

    # new refresh works
    r3 = await client.post(f"{api}/auth/refresh", json={"refresh_token": new_refresh})
    assert r3.status_code == 200


async def test_logout_revokes_refresh(client, api):
    data = await login(client, "pm@peoplehub.io")
    refresh = data["tokens"]["refresh_token"]
    out = await client.post(f"{api}/auth/logout", json={"refresh_token": refresh})
    assert out.status_code == 200
    r = await client.post(f"{api}/auth/refresh", json={"refresh_token": refresh})
    assert r.status_code == 401


async def test_mfa_totp_and_backup_and_email(client, api):
    email = "mfa.primary@peoplehub.io"
    headers = await _make_user(client, api, email)

    # Enroll TOTP
    setup = await client.post(f"{api}/auth/mfa/setup", headers=headers)
    assert setup.status_code == 200
    secret = setup.json()["secret"]
    backup_codes = setup.json()["backup_codes"]
    assert setup.json()["qr_data_uri"].startswith("data:image/png;base64,")

    totp = pyotp.TOTP(secret)
    enable = await client.post(f"{api}/auth/mfa/enable", headers=headers, json={"code": totp.now()})
    assert enable.status_code == 200

    # Login now requires MFA
    data = await login(client, email)
    assert data["mfa_required"] is True
    mfa_token = data["mfa_token"]
    assert "totp" in data["methods"]

    # 1) TOTP verification — use the NEXT window so it isn't rejected as a
    #    replay of the code used during enable (same time step).
    next_code = totp.at(int(time.time()) + 30)
    verify = await client.post(f"{api}/auth/mfa/verify", json={"mfa_token": mfa_token, "code": next_code})
    assert verify.status_code == 200
    assert verify.json()["access_token"]

    # 2) Backup code verification (fresh challenge)
    data2 = await login(client, email)
    v2 = await client.post(
        f"{api}/auth/mfa/verify",
        json={"mfa_token": data2["mfa_token"], "code": backup_codes[0]},
    )
    assert v2.status_code == 200

    # backup code is single-use -> reusing it fails
    data3 = await login(client, email)
    v3 = await client.post(
        f"{api}/auth/mfa/verify",
        json={"mfa_token": data3["mfa_token"], "code": backup_codes[0]},
    )
    assert v3.status_code == 401

    # 3) Email OTP channel
    data4 = await login(client, email)
    start = await client.post(f"{api}/auth/mfa/email/start", json={"mfa_token": data4["mfa_token"]})
    assert start.status_code == 200
    otp = start.json()["dev_otp"]
    assert otp
    v4 = await client.post(
        f"{api}/auth/mfa/verify", json={"mfa_token": data4["mfa_token"], "code": otp}
    )
    assert v4.status_code == 200


async def test_mfa_wrong_code_rejected(client, api):
    email = "mfa.wrong@peoplehub.io"
    headers = await _make_user(client, api, email)
    setup = await client.post(f"{api}/auth/mfa/setup", headers=headers)
    secret = setup.json()["secret"]
    totp = pyotp.TOTP(secret)
    await client.post(f"{api}/auth/mfa/enable", headers=headers, json={"code": totp.now()})

    data = await login(client, email)
    bad = await client.post(
        f"{api}/auth/mfa/verify", json={"mfa_token": data["mfa_token"], "code": "000000"}
    )
    assert bad.status_code == 401
