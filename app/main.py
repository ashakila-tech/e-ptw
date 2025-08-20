from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from .routers import (
    authentication,
    users,
    groups,
    locations,
    approval_data,
    documents,
    workflow_data,
    applications,
    companies,
    permit_types,
    workflows,
    approvals
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authentication.router)
app.include_router(users.router, prefix="/api")
app.include_router(groups.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(approval_data.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(workflow_data.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(permit_types.router, prefix="/api")
app.include_router(workflows.router, prefix="/api")
app.include_router(approvals.router, prefix="/api")

@app.get("/healthz")
def health():
    return {"status":"ok"}
