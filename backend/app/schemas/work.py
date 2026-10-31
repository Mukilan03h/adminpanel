from __future__ import annotations

import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class ProjectBase(BaseModel):
    name: str
    code: str = ""
    client: str = ""
    status: str = "On track"
    progress: int = 0
    lead: str = ""
    due: datetime.date | None = None
    hue: int = 255
    members: list[str] = Field(default_factory=list)
    budget_inr: int = 0


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = None
    client: str | None = None
    status: str | None = None
    progress: int | None = None
    lead: str | None = None
    due: datetime.date | None = None
    members: list[str] | None = None
    budget_inr: int | None = None


class ProjectRead(ORMModel, ProjectBase):
    id: int


class TaskBase(BaseModel):
    project_id: int
    title: str
    status: str = "To do"
    priority: str = "Medium"
    assignee: str = ""
    due: datetime.date | None = None
    tags: list[str] = Field(default_factory=list)
    points: int = 1


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    status: str | None = None
    priority: str | None = None
    assignee: str | None = None
    due: datetime.date | None = None
    tags: list[str] | None = None
    points: int | None = None


class TaskRead(ORMModel, TaskBase):
    id: int


class DailyUpdateBase(BaseModel):
    project: str = ""
    done: str = ""
    blockers: str = "None"
    hours: float = 8


class DailyUpdateCreate(DailyUpdateBase):
    date: datetime.date | None = None


class DailyUpdateRead(ORMModel, DailyUpdateBase):
    id: int
    author: str
    role: str
    date: datetime.date | None
    hue: int


class ActionItemRead(ORMModel):
    id: int
    meeting_id: int
    text: str
    owner: str
    due: datetime.date | None
    done: bool


class ActionItemCreate(BaseModel):
    text: str
    owner: str = ""
    due: datetime.date | None = None


class MeetingBase(BaseModel):
    title: str
    date: datetime.date | None = None
    time: str = "10:00"
    type: str = "Standup"
    attendees: list[str] = Field(default_factory=list)
    agenda: list[str] = Field(default_factory=list)
    minutes: str = ""
    decisions: list[str] = Field(default_factory=list)
    hue: int = 200
    link: str = ""


class MeetingCreate(MeetingBase):
    pass


class MeetingUpdate(BaseModel):
    title: str | None = None
    date: datetime.date | None = None
    time: str | None = None
    type: str | None = None
    attendees: list[str] | None = None
    agenda: list[str] | None = None
    minutes: str | None = None
    decisions: list[str] | None = None
    link: str | None = None


class MeetingRead(ORMModel, MeetingBase):
    id: int
    action_items: list[ActionItemRead] = Field(default_factory=list)
