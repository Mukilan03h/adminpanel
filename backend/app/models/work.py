from __future__ import annotations

from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.models.base import Base, IntPKMixin, TimestampMixin


class Project(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "projects"

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    code: Mapped[str] = mapped_column(String(12), default="")
    client: Mapped[str] = mapped_column(String(120), default="")
    status: Mapped[str] = mapped_column(String(16), default="On track")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    lead: Mapped[str] = mapped_column(String(120), default="")
    due: Mapped[date | None] = mapped_column(Date, nullable=True)
    hue: Mapped[int] = mapped_column(Integer, default=255)
    members: Mapped[list[str]] = mapped_column(JSON, default=list)
    budget_inr: Mapped[int] = mapped_column(Integer, default=0)

    tasks: Mapped[list["Task"]] = relationship(
        back_populates="project", cascade="all, delete-orphan", lazy="selectin"
    )


class Task(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "tasks"

    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="To do")
    priority: Mapped[str] = mapped_column(String(10), default="Medium")
    assignee: Mapped[str] = mapped_column(String(120), default="")
    due: Mapped[date | None] = mapped_column(Date, nullable=True)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    points: Mapped[int] = mapped_column(Integer, default=1)

    project: Mapped[Project] = relationship(back_populates="tasks")


class DailyUpdate(Base, IntPKMixin):
    __tablename__ = "daily_updates"

    author: Mapped[str] = mapped_column(String(120), nullable=False)
    author_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    role: Mapped[str] = mapped_column(String(80), default="")
    date: Mapped[date | None] = mapped_column(Date, nullable=True)
    project: Mapped[str] = mapped_column(String(160), default="")
    done: Mapped[str] = mapped_column(Text, default="")
    blockers: Mapped[str] = mapped_column(Text, default="None")
    hours: Mapped[float] = mapped_column(Integer, default=8)
    hue: Mapped[int] = mapped_column(Integer, default=255)


class Meeting(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "meetings"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    date: Mapped[date | None] = mapped_column(Date, nullable=True)
    time: Mapped[str] = mapped_column(String(8), default="10:00")
    type: Mapped[str] = mapped_column(String(16), default="Standup")
    attendees: Mapped[list[str]] = mapped_column(JSON, default=list)
    agenda: Mapped[list[str]] = mapped_column(JSON, default=list)
    minutes: Mapped[str] = mapped_column(Text, default="")
    decisions: Mapped[list[str]] = mapped_column(JSON, default=list)
    hue: Mapped[int] = mapped_column(Integer, default=200)
    link: Mapped[str] = mapped_column(Text, default="")

    action_items: Mapped[list["ActionItem"]] = relationship(
        back_populates="meeting", cascade="all, delete-orphan", lazy="selectin"
    )


class ActionItem(Base, IntPKMixin):
    __tablename__ = "action_items"

    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    owner: Mapped[str] = mapped_column(String(120), default="")
    due: Mapped[date | None] = mapped_column(Date, nullable=True)
    done: Mapped[bool] = mapped_column(Boolean, default=False)

    meeting: Mapped[Meeting] = relationship(back_populates="action_items")
