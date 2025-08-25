from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union
from pydantic import field_validator

class Settings(BaseSettings):
    APP_NAME: str = "PTW Backend"
    APP_ENV: str = "dev"

    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@db:5432/ptw"

    # Complex types must come as JSON in env; your .env already does that
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # JWT / security
    SECRET_KEY: str = "change-me"           # put a real value in .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Push (optional)
    FCM_PROJECT_ID: Union[str, None] = None
    FCM_SA_EMAIL: Union[str, None] = None
    FCM_SA_PRIVATE_KEY: Union[str, None] = None

    # (Optional) allow comma-separated CORS in dev
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors(cls, v):
        if isinstance(v, str) and not v.strip().startswith("["):
            # "http://a,http://b" -> ["http://a", "http://b"]
            return [s.strip() for s in v.split(",") if s.strip()]
        return v

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
