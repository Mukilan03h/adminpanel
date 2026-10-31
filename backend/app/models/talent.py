from __future__ import annotations

from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.models.base import Base, IntPKMixin, TimestampMixin


class Intern(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "interns"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    college: Mapped[str] = mapped_column(String(160), default="")
    department: Mapped[str] = mapped_column(String(80), default="")
    mentor: Mapped[str] = mapped_column(String(120), default="")
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    stipend_inr: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(16), default="Active")
    hue: Mapped[int] = mapped_column(Integer, default=30)


class Criterion(Base, IntPKMixin):
    __tablename__ = "criteria"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    weight: Mapped[int] = mapped_column(Integer, default=0)
    defined_by: Mapped[str] = mapped_column(String(20), default="Manager")


class InternScore(Base, IntPKMixin):
    __tablename__ = "intern_scores"
    __table_args__ = (UniqueConstraint("intern_id", "criterion_id", name="uq_intern_criterion"),)

    intern_id: Mapped[int] = mapped_column(ForeignKey("interns.id", ondelete="CASCADE"), index=True)
    criterion_id: Mapped[int] = mapped_column(ForeignKey("criteria.id", ondelete="CASCADE"), index=True)
    score: Mapped[int] = mapped_column(Integer, default=0)  # 0..10


class Document(Base, IntPKMixin, TimestampMixin):
    __tablename__ = "documents"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(20), default="Policy")
    owner: Mapped[str] = mapped_column(String(120), default="")
    access_roles: Mapped[list[str]] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(16), default="Pending")
    version: Mapped[str] = mapped_column(String(12), default="v1.0")
    updated: Mapped[date | None] = mapped_column(Date, nullable=True)
    size_kb: Mapped[int] = mapped_column(Integer, default=0)
