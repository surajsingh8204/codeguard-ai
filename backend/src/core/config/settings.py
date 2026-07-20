from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GITHUB_TOKEN: str = ""
    GITHUB_WEBHOOK_SECRET: str = ""
    # Comma-separated origins. Avoid "*" in production.
    CORS_ORIGINS: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:4173,"
        "http://127.0.0.1:4173"
    )
    # Local-only escape hatch when webhook secret is unset.
    ALLOW_INSECURE_WEBHOOKS: bool = False
    RATE_LIMIT_REQUESTS: int = 60
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    REVIEW_CACHE_TTL_SECONDS: int = 300
    MAX_WEBHOOK_BODY_BYTES: int = 1_000_000
    MAX_ANALYZE_FILES: int = 15
    MAX_FILE_CHARS: int = 8000
    MAX_CHUNKS_PER_FILE: int = 2

    def cors_origins_list(self) -> list[str]:
        origins = [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]
        return origins or ["http://localhost:5173"]


settings = Settings()
