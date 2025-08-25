# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import settings

# Engine (psycopg3). If you use psycopg2, change "+psycopg" -> "+psycopg2"
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    future=True,
)

Base = declarative_base()

# Dependency used by routers/services
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
