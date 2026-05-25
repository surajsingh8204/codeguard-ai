from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_MAX_OUTPUT_TOKENS: int = 512
    GEMINI_TOP_P: float = 0.9
    GEMINI_TOP_K: int = 40
    GITHUB_TOKEN: str = ""
    GITHUB_WEBHOOK_SECRET: str = ""
    CORS_ORIGINS: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
