from fastapi import APIRouter

from app.api.routes import auth, hr, rbac, recruitment, talent, work

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(rbac.router)
api_router.include_router(hr.router)
api_router.include_router(work.router)
api_router.include_router(talent.router)
api_router.include_router(recruitment.router)
