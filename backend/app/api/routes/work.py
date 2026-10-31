from __future__ import annotations

import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select

from app.api.crud_router import make_crud_router
from app.api.deps import CurrentUser, DbSession, require
from app.crud import base as crud
from app.models import ActionItem, DailyUpdate, Meeting, Project, Task
from app.schemas.common import Page
from app.schemas.work import (
    ActionItemCreate,
    ActionItemRead,
    DailyUpdateCreate,
    DailyUpdateRead,
    MeetingCreate,
    MeetingRead,
    MeetingUpdate,
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
    TaskCreate,
    TaskRead,
    TaskUpdate,
)

router = APIRouter()

router.include_router(
    make_crud_router(
        prefix="/projects", tags=["projects"], model=Project, name="Project",
        read_schema=ProjectRead, create_schema=ProjectCreate, update_schema=ProjectUpdate,
        perm_view="projects:view", perm_create="projects:create",
        perm_update="projects:manage", perm_delete="projects:manage",
        search_fields=("name", "client", "code"), order_by=Project.name,
    )
)

router.include_router(
    make_crud_router(
        prefix="/tasks", tags=["tasks"], model=Task, name="Task",
        read_schema=TaskRead, create_schema=TaskCreate, update_schema=TaskUpdate,
        perm_view="projects:view", perm_create="tasks:assign",
        perm_update="tasks:update", perm_delete="projects:manage",
        search_fields=("title",), order_by=Task.id.desc(),
    )
)

# --- Daily updates ---
du_router = APIRouter(prefix="/daily-updates", tags=["daily updates"])


@du_router.get("", response_model=Page[DailyUpdateRead], dependencies=[Depends(require("updates:view"))])
async def list_updates(
    user: CurrentUser,
    db: DbSession,
    author: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    filters: dict = {}
    if not (user.is_superuser or user.has_permission("updates:viewAll")):
        filters["author"] = user.full_name  # scoped to own updates
    elif author:
        filters["author"] = author
    return await crud.paginate(
        db, DailyUpdate, page=page, page_size=page_size, filters=filters, order_by=DailyUpdate.id.desc()
    )


@du_router.post("", response_model=DailyUpdateRead, status_code=201, dependencies=[Depends(require("updates:create"))])
async def post_update(payload: DailyUpdateCreate, user: CurrentUser, db: DbSession):
    role_name = user.roles[0].name if user.roles else "Member"
    data = payload.model_dump()
    data.update(
        author=user.full_name,
        author_user_id=user.id,
        role=role_name,
        hue=user.hue,
        date=data.get("date") or datetime.date.today(),
    )
    return await crud.create_obj(db, DailyUpdate, data)


router.include_router(du_router)

# --- Meetings & minutes ---
mtg_router = APIRouter(prefix="/meetings", tags=["meetings"])


@mtg_router.get("", response_model=list[MeetingRead], dependencies=[Depends(require("meetings:view"))])
async def list_meetings(db: DbSession):
    return (await db.execute(select(Meeting).order_by(Meeting.date.desc()))).scalars().all()


@mtg_router.get("/{meeting_id}", response_model=MeetingRead, dependencies=[Depends(require("meetings:view"))])
async def get_meeting(meeting_id: int, db: DbSession):
    return await crud.get_or_404(db, Meeting, meeting_id, "Meeting")


@mtg_router.post("", response_model=MeetingRead, status_code=201, dependencies=[Depends(require("meetings:create"))])
async def create_meeting(payload: MeetingCreate, db: DbSession):
    return await crud.create_obj(db, Meeting, payload.model_dump())


@mtg_router.patch("/{meeting_id}", response_model=MeetingRead, dependencies=[Depends(require("meetings:editMinutes"))])
async def update_meeting(meeting_id: int, payload: MeetingUpdate, db: DbSession):
    obj = await crud.get_or_404(db, Meeting, meeting_id, "Meeting")
    return await crud.update_obj(db, obj, payload.model_dump(exclude_unset=True))


@mtg_router.post("/{meeting_id}/action-items", response_model=ActionItemRead, status_code=201, dependencies=[Depends(require("meetings:editMinutes"))])
async def add_action_item(meeting_id: int, payload: ActionItemCreate, db: DbSession):
    await crud.get_or_404(db, Meeting, meeting_id, "Meeting")
    return await crud.create_obj(db, ActionItem, {**payload.model_dump(), "meeting_id": meeting_id})


@mtg_router.post("/action-items/{item_id}/toggle", response_model=ActionItemRead, dependencies=[Depends(require("meetings:editMinutes"))])
async def toggle_action_item(item_id: int, db: DbSession):
    item = await crud.get_or_404(db, ActionItem, item_id, "Action item")
    item.done = not item.done
    await db.flush()
    await db.refresh(item)
    return item


router.include_router(mtg_router)
