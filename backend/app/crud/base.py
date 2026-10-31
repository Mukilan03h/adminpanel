from __future__ import annotations

from math import ceil
from typing import Any, Sequence

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession


async def paginate(
    db: AsyncSession,
    model: type,
    *,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    search_fields: Sequence[str] = (),
    filters: dict[str, Any] | None = None,
    order_by: Any = None,
) -> dict[str, Any]:
    stmt = select(model)
    conditions = []
    if filters:
        for field, value in filters.items():
            if value is not None:
                conditions.append(getattr(model, field) == value)
    if search and search_fields:
        like = f"%{search}%"
        conditions.append(or_(*[getattr(model, f).ilike(like) for f in search_fields]))
    if conditions:
        stmt = stmt.where(*conditions)

    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()

    if order_by is not None:
        stmt = stmt.order_by(order_by)
    stmt = stmt.limit(page_size).offset((page - 1) * page_size)
    items = (await db.execute(stmt)).scalars().all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": max(1, ceil(total / page_size)),
    }


async def get_or_404(db: AsyncSession, model: type, obj_id: int, name: str = "Resource"):
    obj = await db.get(model, obj_id)
    if obj is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"{name} not found")
    return obj


async def create_obj(db: AsyncSession, model: type, data: dict[str, Any]):
    obj = model(**data)
    db.add(obj)
    await db.flush()
    await db.refresh(obj)
    return obj


async def update_obj(db: AsyncSession, obj, data: dict[str, Any]):
    for key, value in data.items():
        setattr(obj, key, value)
    await db.flush()
    await db.refresh(obj)
    return obj


async def delete_obj(db: AsyncSession, obj):
    await db.delete(obj)
    await db.flush()
