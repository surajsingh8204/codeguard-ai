from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    GROQ_API_KEY: str = ""
    GITHUB_TOKEN: str = ""
    GITHUB_WEBHOOK_SECRET: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
