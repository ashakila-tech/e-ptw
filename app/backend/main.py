from fastapi import FastAPI
from .config import settings

# Import routers once
from .routers import (
    authentication,               # /auth/*
    companies, permit_types, users, locations, documents,
    workflows, approvals, groups, user_groups,
    workflow_data, approval_data, applications
)

app = FastAPI(title=settings.APP_NAME)

# Auth routes (keep outside /api so paths are /auth/login, /auth/me, etc)
app.include_router(authentication.router)

# API routes
app.include_router(companies.crud_router, prefix="/api")
app.include_router(permit_types.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(locations.crud_router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(workflows.crud_router, prefix="/api")
app.include_router(approvals.router, prefix="/api")
app.include_router(groups.router, prefix="/api")
app.include_router(user_groups.crud_router, prefix="/api")
app.include_router(workflow_data.crud_router, prefix="/api")
app.include_router(approval_data.router, prefix="/api")
app.include_router(applications.router, prefix="/api")  # <<< only once

@app.get("/")
def root():
    return {"ok": True, "docs": "/docs"}

@app.get("/healthz")
def health():
    return {"ok": True, "env": settings.APP_ENV}
