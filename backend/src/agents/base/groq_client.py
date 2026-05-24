from groq import Groq

from src.core.config.settings import settings


class GroqClient:

    client = Groq(
        api_key=settings.GROQ_API_KEY
    )
