import json
import re

from src.agents.base.base_agent import (
    BaseAgent
)
from src.agents.base.llm_client import (
    LLMClient
)

from src.core.logger.logger import (
    AppLogger
)


class ImpactAgent(BaseAgent):

    def __init__(self):

        self.logger = AppLogger.get_logger(__name__)

        self.llm = LLMClient()

        self.system_prompt = """
        You are a senior software architect.

        Analyze the provided code diff carefully.

        Determine:
        - affected systems
        - architectural impact
        - production risks
        - critical modules involved

        RETURN STRICT JSON ONLY.

        FORMAT:

        {
            "affected_systems": [],
            "criticality": "LOW | MEDIUM | HIGH | CRITICAL",
            "architectural_impact": "...",
            "production_risk": "...",
            "recommendation": "..."
        }
        """

    def run(self, file_name, patch):

        try:

            prompt = f"""
            File: {file_name}

            Code Diff:
            {patch}

            Analyze:
            - architecture impact
            - shared systems affected
            - deployment implications
            """

            raw_result = self.llm.generate(
                system_prompt=self.system_prompt,
                user_prompt=prompt,
                temperature=0.1
            )

            self.logger.info(
                f"Raw impact response: {raw_result}"
            )

            parsed_result = self._extract_json(
                raw_result
            )

            self.logger.info(
                "Impact analysis generated"
            )

            return parsed_result

        except Exception as e:

            self.logger.error(str(e))

            return {
                "affected_systems": [],
                "criticality": "UNKNOWN",
                "architectural_impact": str(e),
                "production_risk": str(e),
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
                f"Impact JSON extraction failed: {str(e)}"
            )

            raise e