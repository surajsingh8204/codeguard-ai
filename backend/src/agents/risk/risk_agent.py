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


class RiskAgent(BaseAgent):

    def __init__(self):

        self.logger = AppLogger.get_logger(__name__)

        self.client = Groq(
            api_key=settings.GROQ_API_KEY
        )

        self.system_prompt = """
        You are a senior software architect and deployment risk analyst.

        Analyze the provided engineering findings.

        Determine:
        - overall risk score
        - deployment risk
        - affected systems
        - production impact

        RETURN STRICT JSON ONLY.

        FORMAT:

        {
            "risk_score": 0,
            "deployment_risk": "LOW | MEDIUM | HIGH | CRITICAL",
            "affected_systems": [],
            "summary": "...",
            "recommendation": "..."
        }
        """

    def run(self, findings):

        try:

            prompt = f"""
            Engineering Findings:
            {json.dumps(findings, indent=2)}
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
                f"Raw risk response: {raw_result}"
            )

            parsed_result = self._extract_json(
                raw_result
            )

            self.logger.info(
                "Risk analysis generated"
            )

            return parsed_result

        except Exception as e:

            self.logger.error(str(e))

            return {
                "risk_score": 0,
                "deployment_risk": "UNKNOWN",
                "affected_systems": [],
                "summary": str(e),
                "recommendation": "Check logs"
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
                f"Risk JSON extraction failed: {str(e)}"
            )

            raise e