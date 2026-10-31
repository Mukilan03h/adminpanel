from __future__ import annotations

import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select

from app.api.crud_router import make_crud_router
from app.api.deps import CurrentUser, DbSession, require
from app.crud import base as crud
from app.models import Criterion, Document, Intern, InternScore
from app.schemas.talent import (
    CriterionCreate,
    CriterionRead,
    CriterionUpdate,
    DocumentCreate,
    DocumentRead,
    DocumentUpdate,
    InternCreate,
    InternRead,
    InternUpdate,
    ScoreRead,
    ScoreSet,
)

router = APIRouter()

router.include_router(
    make_crud_router(
        prefix="/interns", tags=["interns"], model=Intern, name="Intern",
        read_schema=InternRead, create_schema=InternCreate, update_schema=InternUpdate,
        perm_view="interns:view", perm_create="interns:docs",
        perm_update="interns:docs", perm_delete="interns:docs",
        search_fields=("name", "college", "department"), order_by=Intern.name,
    )
)

router.include_router(
    make_crud_router(
        prefix="/criteria", tags=["scoring rubric"], model=Criterion, name="Criterion",
        read_schema=CriterionRead, create_schema=CriterionCreate, update_schema=CriterionUpdate,
        perm_view="interns:view", perm_create="interns:manageRubric",
        perm_update="interns:manageRubric", perm_delete="interns:manageRubric",
        order_by=Criterion.id,
    )
)

# --- Scores ---
score_router = APIRouter(prefix="/scores", tags=["scores"])


@score_router.get("", response_model=list[ScoreRead], dependencies=[Depends(require("interns:view"))])
async def list_scores(db: DbSession, intern_id: int | None = Query(None)):
    stmt = select(InternScore)
    if intern_id is not None:
        stmt = stmt.where(InternScore.intern_id == intern_id)
    return (await db.execute(stmt)).scalars().all()


@score_router.put("", response_model=ScoreRead, dependencies=[Depends(require("interns:score"))])
async def set_score(payload: ScoreSet, db: DbSession):
    existing = (
        await db.execute(
            select(InternScore).where(
                InternScore.intern_id == payload.intern_id,
                InternScore.criterion_id == payload.criterion_id,
            )
        )
    ).scalar_one_or_none()
    if existing:
        existing.score = payload.score
        await db.flush()
        await db.refresh(existing)
        return existing
    return await crud.create_obj(db, InternScore, payload.model_dump())


router.include_router(score_router)

# --- Documents (role-aware) ---
doc_router = APIRouter(prefix="/documents", tags=["documents"])


@doc_router.get("", response_model=list[DocumentRead], dependencies=[Depends(require("documents:view"))])
async def list_documents(user: CurrentUser, db: DbSession, category: str | None = None):
    docs = (await db.execute(select(Document).order_by(Document.updated.desc()))).scalars().all()
    manage = user.is_superuser or user.has_permission("documents:manage")
    role_ids = {r.id for r in user.roles}
    result = []
    for d in docs:
        if category and d.category != category:
            continue
        if manage or role_ids.intersection(d.access_roles or []):
            result.append(d)
    return result


@doc_router.post("", response_model=DocumentRead, status_code=201, dependencies=[Depends(require("documents:upload"))])
async def upload_document(payload: DocumentCreate, user: CurrentUser, db: DbSession):
    data = payload.model_dump()
    if not data.get("owner"):
        data["owner"] = user.full_name
    if not data.get("updated"):
        data["updated"] = datetime.date.today()
    return await crud.create_obj(db, Document, data)


@doc_router.patch("/{doc_id}", response_model=DocumentRead, dependencies=[Depends(require("documents:manage"))])
async def update_document(doc_id: int, payload: DocumentUpdate, db: DbSession):
    obj = await crud.get_or_404(db, Document, doc_id, "Document")
    return await crud.update_obj(db, obj, payload.model_dump(exclude_unset=True))


@doc_router.post("/{doc_id}/approve", response_model=DocumentRead, dependencies=[Depends(require("documents:manage"))])
async def approve_document(doc_id: int, db: DbSession):
    obj = await crud.get_or_404(db, Document, doc_id, "Document")
    return await crud.update_obj(db, obj, {"status": "Approved"})


@doc_router.delete("/{doc_id}", status_code=204, dependencies=[Depends(require("documents:manage"))])
async def delete_document(doc_id: int, db: DbSession):
    obj = await crud.get_or_404(db, Document, doc_id, "Document")
    await crud.delete_obj(db, obj)


router.include_router(doc_router)
