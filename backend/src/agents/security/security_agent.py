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

from src.analyzers.static.semgrep_analyzer import (
    SemgrepAnalyzer
)


class SecurityAgent(BaseAgent):

    def __init__(self):

        self.logger = AppLogger.get_logger(__name__)

        self.llm = LLMClient()

        # Initialize Semgrep Analyzer
        self.semgrep = SemgrepAnalyzer()

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

        Use BOTH:
        - code diff
        - semgrep findings

        RETURN STRICT JSON ONLY.

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

            # =========================
            # RUN SEMGREP ANALYSIS
            # =========================

            semgrep_findings = self.semgrep.analyze(
                file_name,
                patch
            )

            self.logger.info(
                f"Semgrep findings: {semgrep_findings}"
            )

            # =========================
            # BUILD AI PROMPT
            # =========================

            prompt = f"""
            File: {file_name}

            Diff:
            {patch}

            Semgrep Findings:
            {json.dumps(semgrep_findings, indent=2)}

            Use BOTH:
            - code diff
            - semgrep findings

            to generate the final security review.
            """

            # =========================
            # GROQ AI ANALYSIS
            # =========================

            raw_result = self.llm.generate(
                system_prompt=self.system_prompt,
                user_prompt=prompt,
                temperature=0.1
            )

            self.logger.info(
                f"Raw security response: {raw_result}"
            )

            # =========================
            # PARSE JSON RESPONSE
            # =========================

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