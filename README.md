# PeopleHub — HRMS + Work Platform

An end-to-end **Human Resource Management System** and **ClickUp-style project/work platform**
with **dynamic role-based access control**, built with **[Animate UI](https://animate-ui.com)**
(animated primitives on top of **shadcn/ui**), **React 19**, **Tailwind CSS v4**, **Framer Motion
(`motion`)** and **TypeScript**. Fully themed for light / dark / system and tuned for Indian
project management (INR, Indian colleges, local roles).

> Everything runs client-side with mock data. All edits (roles, tasks, meetings, scores,
> documents, theme, active persona) persist to `localStorage`, so changes survive a reload.

## Highlights

### HRMS
- **Dashboard** — KPI stat cards with animated counting numbers, headcount area chart,
  department donut, hiring/attrition bars, team avatar group, activity feed, upcoming events.
- **Employees** — searchable/filterable table with selection, pagination, row actions and an
  add-employee side sheet.
- **Attendance** — daily log + weekly trends chart.
- **Leave** — balances, request dialog, approve/reject workflow.
- **Payroll** — animated sliding-number total, per-employee breakdown with footer totals.
- **Recruitment** — candidate pipeline board + open roles.
- **Performance** — interactive self-assessment (sliders + radio), distribution chart, top performers.

### Work platform
- **Projects** — project cards, **kanban board + list views**, create/move tasks (Framer Motion),
  priorities, assignees, due dates. **Interns & individual contributors see only their own tasks**;
  leads/PMs see everything.
- **Team Workload** — a capacity board showing **who is working on what and who is free**
  (Busy / Queued / Free), per-person load, and quick **assign work** to available people.
- **Daily Updates** — ClickUp-style standup tracker grouped by date, with blockers and hours;
  "view all" vs "view own" depending on role.
- **Meetings & Minutes** — master-detail with agenda, attendees, editable **minutes of meeting**,
  decisions, **action items**, and a **join link** shared with attendees (including interns).

### Org & HR automation
- **Organization chart** derived from roles and intern mentors (interns report to their team leads).
- **Résumé upload (HR)** — OCR/AI-style **prefill** of a candidate (name, email, phone, role, skills)
  so HR reviews instead of retyping; **auto-generated company employee IDs**.

### Talent & documents
- **Interns** — INR stipends, Indian colleges and mentors; an **HR/manager-defined weighted scoring
  rubric** (add/edit criteria + weights), per-criterion scoring with a live weighted score, and an
  **onboarding-document checklist**.
- **Documents** — **role-aware** document management with categories, owners, access roles,
  versions, statuses and approvals.

### Dynamic Role-Based Access Control
- **Permission catalog** grouped by module; **editable roles** (Administrator, HR Manager, Project
  Manager, Team Lead, Employee, Intern) plus **custom roles you create**.
- **Access Control** admin page: role list, a **permission matrix with live toggles**, create/delete
  roles, and **user → role assignments**.
- A **"Viewing as" persona switcher** in the top bar — switch user to instantly see the whole UI
  re-gate: the sidebar hides modules, routes show an **Access-restricted** page, and action buttons
  (add employee, approve leave, run payroll, score interns, edit minutes…) appear or disappear.

### UI & UX
- **Animate UI** primitives throughout: animated icons, counting/sliding numbers, highlight/rolling/
  typing text, shine, tilt, avatar group, animated tabs, liquid/flip buttons and animated backgrounds
  — see the **Components** showcase page.
- **Light / dark / system** theme with Animate UI's view-transition **theme wipe**.
- **Static app shell**: the sidebar and top bar stay fixed; only the content area scrolls.
- Route-level **code splitting** for fast loads.

## Backend (optional, production-grade)

A full **FastAPI + PostgreSQL** API lives in [`backend/`](backend/README.md): email/password auth
with **Argon2**, **JWT** access + rotating refresh tokens, **MFA** (TOTP + backup codes + email OTP),
server-enforced **RBAC**, Alembic migrations, Docker, and a passing pytest suite.

- **Demo mode** (default): leave `VITE_API_URL` unset — the app runs standalone on local mock data
  with a persona switcher.
- **Connected mode**: set `VITE_API_URL` (e.g. `http://localhost:8000`) — the app shows a real
  **login + MFA** screen and drives permissions/roles from the backend.

```bash
cd backend && make install && make migrate && make seed && make run   # API on :8000
# then, in the web app:  VITE_API_URL=http://localhost:8000 npm run dev
```

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 19 + Vite 8 + TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix), animated by Animate UI (`@animate-ui/react`) |
| Animation | Motion (Framer Motion) |
| Charts | Recharts (via shadcn chart) |
| Icons | Animate UI animated Lucide icons + `lucide-react` |
| Routing | React Router v7 |
| Toasts | Sonner |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # type-check + production build
npm run preview  # serve the production build
```

## Try the RBAC demo

1. Open the app (you start as **Administrator** — full access).
2. Use **"Viewing as"** in the top bar to switch to **HR Manager**, **Project Manager**,
   **Team Lead**, **Employee** or **Intern**.
3. Watch the **sidebar** change, try a restricted route (e.g. Payroll as an Intern), and notice
   action buttons appear/disappear.
4. Go to **Access Control** (as Administrator/HR) to toggle permissions or create a new role — the
   UI re-gates immediately.

## Project structure

```
src/
  components/
    ui/            shadcn/ui components (import the animated radix primitives)
    animate-ui/    Animate UI icons, backgrounds and buttons (from the registry)
    layout/        app shell, sidebar, topbar, theme + persona switchers, route guard
    shared/        StatCard, StatusBadge, PersonAvatar, PageHeader, Kbd
  lib/
    rbac.tsx       permissions, roles, users, can() — the RBAC provider
    store.tsx      projects/tasks/updates/meetings/interns/rubric/scores/documents
    theme.tsx      light/dark/system theme provider
    data.ts        HRMS mock data
    format.ts      currency (USD + INR), date and number helpers
  pages/           one file per route
```

## Notes

- The data is mock and lives in the browser. To reset, clear the site's `localStorage`
  (keys are prefixed `peoplehub-` and `ph-`).
- Built with [Animate UI](https://animate-ui.com) · shadcn/ui · Tailwind CSS v4 · Motion.
