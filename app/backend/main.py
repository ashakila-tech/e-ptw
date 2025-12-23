from fastapi import FastAPI
from .config import settings
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
# from apscheduler.schedulers.background import BackgroundScheduler

# Import routers once
# from .scheduler import check_and_complete_expired_permits
from .routers import (
    authentication,               # /auth/*
    companies, permit_types, users, locations, documents,
    workflows, approvals, groups, user_groups, workflow_data, approval_data,
    applications, location_managers, permit_officers, workers,
    safety_equipments,
    application_workers,
    application_safety_equipments,
    push_tokens
)
# scheduler = BackgroundScheduler()

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """
#     Handles application startup and shutdown events.
#     """
#     # On startup, add the job and start the scheduler
#     # This job will run every minute. You can adjust the interval.
#     scheduler.add_job(check_and_complete_expired_permits, 'interval', minutes=1, id="complete_expired_permits")
#     scheduler.start()
#     yield
#     # On shutdown, stop the scheduler
#     scheduler.shutdown()

# app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)
app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",  # Expo web
        "http://localhost:19006", # Expo dev tools
        "http://localhost:19007",
        "http://localhost:3000",  # React web dev
        "*",                      # allow all (OPTIONAL)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(workflow_data.router, prefix="/api")
app.include_router(approval_data.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(location_managers.router, prefix="/api")
app.include_router(permit_officers.router, prefix="/api")
app.include_router(workers.router, prefix="/api")
app.include_router(safety_equipments.crud_router, prefix="/api")
app.include_router(application_workers.crud_router, prefix="/api")
app.include_router(application_safety_equipments.crud_router, prefix="/api")
app.include_router(push_tokens.router, prefix="/api")

@app.get("/")
def root():
    return {"ok": True, "docs": "/docs"}

@app.get("/healthz")
def health():
    return {"ok": True, "env": settings.APP_ENV}
