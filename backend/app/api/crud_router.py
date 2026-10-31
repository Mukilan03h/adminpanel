from typing import Annotated, Any, Callable, Sequence

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.api.deps import DbSession, require
from app.crud import base as crud
from app.schemas.common import Page


def make_crud_router(
    *,
    prefix: str,
    tags: list[str],
    model: type,
    read_schema: type[BaseModel],
    create_schema: type[BaseModel],
    update_schema: type[BaseModel],
    name: str,
    perm_view: str,
    perm_create: str,
    perm_update: str,
    perm_delete: str,
    search_fields: Sequence[str] = (),
    order_by: Any = None,
    pre_create: Callable[[dict], dict] | None = None,
    enable_delete: bool = True,
) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=tags)

    @router.get("", response_model=Page[read_schema], dependencies=[Depends(require(perm_view))])
    async def list_items(
        db: DbSession,
        page: Annotated[int, Query(ge=1)] = 1,
        page_size: Annotated[int, Query(ge=1, le=200)] = 20,
        search: str | None = None,
    ):
        return await crud.paginate(
            db, model, page=page, page_size=page_size, search=search,
            search_fields=search_fields, order_by=order_by,
        )

    @router.get("/{item_id}", response_model=read_schema, dependencies=[Depends(require(perm_view))])
    async def get_item(item_id: int, db: DbSession):
        return await crud.get_or_404(db, model, item_id, name)

    @router.post("", response_model=read_schema, status_code=201, dependencies=[Depends(require(perm_create))])
    async def create_item(payload: create_schema, db: DbSession):  # type: ignore[valid-type]
        data = payload.model_dump(exclude_unset=False)
        if pre_create:
            data = pre_create(data)
        return await crud.create_obj(db, model, data)

    @router.patch("/{item_id}", response_model=read_schema, dependencies=[Depends(require(perm_update))])
    async def update_item(item_id: int, payload: update_schema, db: DbSession):  # type: ignore[valid-type]
        obj = await crud.get_or_404(db, model, item_id, name)
        return await crud.update_obj(db, obj, payload.model_dump(exclude_unset=True))

    if enable_delete:
        @router.delete("/{item_id}", status_code=204, dependencies=[Depends(require(perm_delete))])
        async def delete_item(item_id: int, db: DbSession):
            obj = await crud.get_or_404(db, model, item_id, name)
            await crud.delete_obj(db, obj)

    return router
