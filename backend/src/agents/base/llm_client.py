from groq import Groq
import google.generativeai as genai

from src.core.config.settings import settings
from src.core.logger.logger import AppLogger


class LLMClient:

    def __init__(self):
        self.logger = AppLogger.get_logger(__name__)
        self._groq = None

        if settings.GROQ_API_KEY:
            self._groq = Groq(
                api_key=settings.GROQ_API_KEY
            )

    def generate(
        self,
        system_prompt,
        user_prompt,
        temperature=0.1
    ):

        if self._groq:
            try:
                response = self._groq.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=[
                        {
                            "role": "system",
                            "content": system_prompt
                        },
                        {
                            "role": "user",
                            "content": user_prompt
                        }
                    ],
                    temperature=temperature
                )

                return response.choices[0].message.content

            except Exception as e:
                if not self._is_rate_limit_error(e):
                    raise

                self.logger.warning(
                    "Groq rate limit hit, falling back to Gemini."
                )
        else:
            self.logger.warning(
                "Groq API key missing, falling back to Gemini."
            )

        return self._generate_with_gemini(
            system_prompt,
            user_prompt,
            temperature
        )

    def _generate_with_gemini(
        self,
        system_prompt,
        user_prompt,
        temperature
    ):

        if not settings.GEMINI_API_KEY:
            raise RuntimeError(
                "Gemini API key is not configured."
            )

        genai.configure(
            api_key=settings.GEMINI_API_KEY
        )

        model = genai.GenerativeModel(
            settings.GEMINI_MODEL
        )

        prompt = self._build_prompt(
            system_prompt,
            user_prompt
        )

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": temperature
            }
        )

        return response.text or ""

    def _build_prompt(
        self,
        system_prompt,
        user_prompt
    ):

        return (
            f"{system_prompt.strip()}\n\n"
            f"User:\n{user_prompt.strip()}"
        )

    def _is_rate_limit_error(self, error):

        status_code = getattr(
            error,
            "status_code",
            None
        ) or getattr(
            error,
            "http_status",
            None
        )

        if status_code == 429:
            return True

        message = str(error).lower()

        return (
            "rate limit" in message
            or "rate_limit" in message
            or "429" in message
        )
