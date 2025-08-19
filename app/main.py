from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from .routers import applications, permit_types, authentication, users

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
app.include_router(applications.router, prefix="/api")
app.include_router(permit_types.router, prefix="/api")

@app.get("/healthz")
def health():
    return {"status":"ok"}
