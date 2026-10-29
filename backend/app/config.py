from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "postgresql+psycopg://docintel:docintel-local-only@localhost:5432/docintel"
    redis_url: str = "redis://localhost:6379/0"
    storage_dir: Path = Path("./storage/documents")
    model_cache_dir: Path = Path("./storage/models")
    max_upload_bytes: int = 20 * 1024 * 1024
    chunk_size: int = 900
    chunk_overlap: int = 120
    top_k: int = 5
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:3b"
    cors_origins: str = "http://localhost:5173"

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
