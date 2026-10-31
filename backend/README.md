# PeopleHub API

Production-grade backend for the PeopleHub HRMS + work platform.

**Stack:** FastAPI · PostgreSQL (async SQLAlchemy 2 + asyncpg) · Alembic · Pydantic v2 ·
JWT (PyJWT) · **MFA (TOTP + backup codes + email OTP)** · Argon2 (pwdlib) · dynamic RBAC ·
rate limiting (slowapi) · pytest.

## Features

- **Auth**: email + password (Argon2), short-lived **access tokens** + **rotating, hashed,
  revocable refresh tokens**, logout, password change.
- **MFA (all three channels)**:
  - **TOTP** authenticator app — enrollment returns an `otpauth://` URI + a **QR code** (data URI)
    and the secret is **encrypted at rest** (Fernet); replay protection via per-user time-step tracking.
  - **Backup/recovery codes** — hashed (Argon2), **single-use**.
  - **Email OTP** — a one-time code as a fallback channel.
- **Dynamic RBAC**: a permission catalog grouped by module, editable roles (wildcard super-admin),
  role↔permission and user↔role assignments, and a `require(...)` dependency enforcing permissions
  on every endpoint.
- **Domain modules** (full CRUD where it applies): employees, departments, attendance, leave
  (request → approve), payroll (view + run), projects, tasks, daily updates, meetings + minutes +
  action items, interns, scoring rubric, intern scores, role-aware documents.
- **Production hardening**: CORS, security headers (CSP-adjacent), rate limiting on auth endpoints,
  request-scoped transactions, structured logging, an **audit log**, Alembic migrations, Docker.

## Quick start (local)

Requires Python 3.12+ and a PostgreSQL 16 database.

```bash
cd backend
cp .env.example .env          # then fill SECRET_KEY and MFA_ENCRYPTION_KEY
make install                  # uv venv + deps
make migrate                  # alembic upgrade head
make seed                     # demo users + data
make run                      # http://localhost:8000  (docs at /docs)
```

Generate the secrets referenced in `.env`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"                         # SECRET_KEY
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"  # MFA_ENCRYPTION_KEY
```

## Docker

```bash
cd backend
docker compose up --build     # Postgres + API, runs migrations + seed, API on :8000
```

## Demo users

All demo users share the password **`Password123!`**:

| Email | Role | Access |
| --- | --- | --- |
| `admin@peoplehub.io` | Administrator | everything |
| `hr@peoplehub.io` | HR Manager | people, payroll, interns, docs, RBAC |
| `pm@peoplehub.io` | Project Manager | projects, meetings, interns |
| `lead@peoplehub.io` | Team Lead | squad tasks, intern scoring |
| `employee@peoplehub.io` | Employee | own work & requests |
| `intern@peoplehub.io` | Intern | tasks, updates, own docs |

## Auth flow

```
POST /api/v1/auth/login            {email, password}
  └─ no MFA  → { mfa_required:false, tokens:{access,refresh} }
  └─ MFA on  → { mfa_required:true,  mfa_token, methods:["totp","backup_code","email"] }

POST /api/v1/auth/mfa/email/start  {mfa_token}                 # send email OTP (dev: returns code)
POST /api/v1/auth/mfa/verify       {mfa_token, code}           # TOTP | backup code | email OTP → tokens
POST /api/v1/auth/refresh          {refresh_token}             # rotates the refresh token
POST /api/v1/auth/logout           {refresh_token}
GET  /api/v1/auth/me                                           # user + permissions + is_superuser
```

MFA enrollment (authenticated): `POST /auth/mfa/setup` → scan QR / save backup codes →
`POST /auth/mfa/enable {code}`. Disable with `POST /auth/mfa/disable {code}`.

## Tests

```bash
make test        # 19 tests: auth, refresh rotation, all 3 MFA channels, RBAC, dynamic role
                 # assignment, CRUD flows, role-aware document visibility
make lint
```

## Structure

```
app/
  core/        config, database (async), security (hash/jwt/totp/encryption), permissions, rate limit
  models/      SQLAlchemy 2.0 models (users/roles/permissions + HR + work + talent + audit)
  schemas/     Pydantic v2 request/response models
  api/
    deps.py        get_current_user, require(*perms) RBAC guard
    crud_router.py generic CRUD router factory
    routes/        auth, rbac, hr, work, talent
  seed.py      demo users, roles, permissions and Indian-context domain data
alembic/       async migrations
tests/         pytest (httpx AsyncClient + ASGITransport)
```

Interactive API docs: **`/docs`** (Swagger) and **`/redoc`**.
