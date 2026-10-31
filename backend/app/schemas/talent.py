from __future__ import annotations

from datetime import date

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class InternBase(BaseModel):
    name: str
    college: str = ""
    department: str = ""
    mentor: str = ""
    start_date: date | None = None
    end_date: date | None = None
    stipend_inr: int = 0
    status: str = "Active"
    hue: int = 30


class InternCreate(InternBase):
    pass


class InternUpdate(BaseModel):
    name: str | None = None
    college: str | None = None
    department: str | None = None
    mentor: str | None = None
    end_date: date | None = None
    stipend_inr: int | None = None
    status: str | None = None


class InternRead(ORMModel, InternBase):
    id: int


class CriterionBase(BaseModel):
    name: str
    description: str = ""
    weight: int = 0
    defined_by: str = "Manager"


class CriterionCreate(CriterionBase):
    pass


class CriterionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    weight: int | None = None
    defined_by: str | None = None


class CriterionRead(ORMModel, CriterionBase):
    id: int


class ScoreSet(BaseModel):
    intern_id: int
    criterion_id: int
    score: int = Field(ge=0, le=10)


class ScoreRead(ORMModel):
    id: int
    intern_id: int
    criterion_id: int
    score: int


class DocumentBase(BaseModel):
    name: str
    category: str = "Policy"
    owner: str = ""
    access_roles: list[str] = Field(default_factory=list)
    status: str = "Pending"
    version: str = "v1.0"
    updated: date | None = None
    size_kb: int = 0


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    access_roles: list[str] | None = None
    status: str | None = None
    version: str | None = None


class DocumentRead(ORMModel, DocumentBase):
    id: int
