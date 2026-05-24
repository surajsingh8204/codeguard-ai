import json
import re

from groq import Groq

from src.agents.base.base_agent import (
    BaseAgent
)

from src.core.config.settings import (
    settings
)

from src.core.logger.logger import (
    AppLogger
)


class SecurityAgent(BaseAgent):

    def __init__(self):

        self.logger = AppLogger.get_logger(__name__)

        self.client = Groq(
            api_key=settings.GROQ_API_KEY
        )

        self.system_prompt = """
        You are a senior application security engineer.

        Analyze the provided code diff carefully.

        Focus ONLY on:
        - SQL injection
        - hardcoded secrets
        - unsafe file access
        - authentication flaws
        - insecure deserialization
        - command injection
        - dangerous patterns

        RETURN STRICT JSON ONLY.

        DO NOT use markdown.

        RESPONSE FORMAT:

        {
            "findings": [
                {
                    "severity": "LOW | MEDIUM | HIGH | CRITICAL",
                    "category": "Security",
                    "issue": "...",
                    "impact": "...",
                    "fix": "..."
                }
            ]
        }
        """

    def run(self, file_name, patch):

        try:

            prompt = f"""
            File: {file_name}

            Diff:
            {patch}
            """

            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": self.system_prompt
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.1
            )

            raw_result = response.choices[0].message.content

            self.logger.info(
                f"Raw security response: {raw_result}"
            )

            parsed_result = self._extract_json(
                raw_result
            )

            self.logger.info(
                f"Security review generated for {file_name}"
            )

            return parsed_result

        except Exception as e:

            self.logger.error(str(e))

            return {
                "findings": [
                    {
                        "severity": "UNKNOWN",
                        "category": "Security",
                        "issue": "Security analysis failed",
                        "impact": str(e),
                        "fix": "Check logs"
                    }
                ]
            }

    def _extract_json(self, text):

        try:

            cleaned = text.strip()

            cleaned = cleaned.replace(
                "```json",
                ""
            )

            cleaned = cleaned.replace(
                "```",
                ""
            )

            json_match = re.search(
                r"\{.*\}",
                cleaned,
                re.DOTALL
            )

            if not json_match:

                raise ValueError(
                    "No valid JSON found"
                )

            json_text = json_match.group()

            return json.loads(json_text)

        except Exception as e:

            self.logger.error(
                f"JSON extraction failed: {str(e)}"
            )

            raise e