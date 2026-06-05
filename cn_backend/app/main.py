from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
# Import all models so SQLAlchemy creates them
import app.models  # noqa

from app.api.auth import router as auth_router
from app.api.students import router as students_router
from app.api.teachers import router as teachers_router
from app.api.attendance import router as attendance_router
from app.api.exams import router as exams_router
from app.api.finance import router as finance_router
from app.api.analytics import router as analytics_router
from app.api.promotion import router as promotion_router
from app.api.misc import (
    certificates_router, notifications_router,
    classes_router, subjects_router,
)

# Create tables
Base.metadata.create_all(bind=engine)
from app.db.session import check_and_seed_admin
check_and_seed_admin()

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="School ERP Management System API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API prefix
API_PREFIX = "/api"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(students_router, prefix=API_PREFIX)
app.include_router(teachers_router, prefix=API_PREFIX)
app.include_router(attendance_router, prefix=API_PREFIX)
app.include_router(exams_router, prefix=API_PREFIX)
app.include_router(finance_router, prefix=API_PREFIX)
app.include_router(analytics_router, prefix=API_PREFIX)
app.include_router(promotion_router, prefix=API_PREFIX)
app.include_router(certificates_router, prefix=API_PREFIX)
app.include_router(notifications_router, prefix=API_PREFIX)
app.include_router(classes_router, prefix=API_PREFIX)
app.include_router(subjects_router, prefix=API_PREFIX)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


@app.get("/")
def root():
    return {"message": f"Welcome to {settings.APP_NAME} API", "docs": "/api/docs"}
