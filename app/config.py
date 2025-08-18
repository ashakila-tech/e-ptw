from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "PTW Backend"
    APP_ENV: str = "dev"
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@db:5432/ptw"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    FCM_PROJECT_ID: str | None = None
    FCM_SA_EMAIL: str | None = None
    FCM_SA_PRIVATE_KEY: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
