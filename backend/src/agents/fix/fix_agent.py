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


class FixAgent(BaseAgent):

    def __init__(self):

        self.logger = AppLogger.get_logger(__name__)

        self.llm = LLMClient()

        self.system_prompt = """
        You are a senior software engineer proposing a patch.

        Rules:
        - Only fix issues present in the provided findings and diff.
        - PATCH SUMMARY and EXPLANATION must describe ONLY changes
          that appear in FIXED CODE.
        - Do not claim CORS, rate limiting, caching, chunking, or
          other hardening unless FIXED CODE actually implements them.
        - Treat this as a proposed patch, not as already-applied code.
        - Prefer the smallest correct change.

        RESPONSE FORMAT:

        PATCH SUMMARY:
        One or two sentences describing the concrete patch below.

        FIXED CODE:
        ```python
        code here
        ```

        EXPLANATION:
        Briefly explain how the FIXED CODE addresses the findings.
        """

    def run(self, patch, findings):

        try:

            prompt = f"""
            Original Code Diff:
            {patch}

            Findings:
            {json.dumps(findings, indent=2)}

            Propose a minimal secure fix for these findings only.
            Keep PATCH SUMMARY and EXPLANATION faithful to FIXED CODE.
            """

            raw_result = self.llm.generate(
                system_prompt=self.system_prompt,
                user_prompt=prompt,
                temperature=0.2
            )

            self.logger.info(
                f"Raw fix response: {raw_result}"
            )

            parsed_result = self._parse_response(
                raw_result
            )

            self.logger.info(
                "Patch generation completed"
            )

            return parsed_result

        except Exception as e:

            self.logger.error(str(e))

            return {
                "patch_summary": "Patch generation failed",
                "fixed_code": "",
                "explanation": "Unable to generate a patch."
            }

    def _parse_response(self, text):

        try:

            summary_match = re.search(
                r"PATCH SUMMARY:(.*?)FIXED CODE:",
                text,
                re.DOTALL
            )

            code_match = re.search(
                r"```(?:python)?(.*?)```",
                text,
                re.DOTALL
            )

            explanation_match = re.search(
                r"EXPLANATION:(.*)",
                text,
                re.DOTALL
            )

            return {
                "patch_summary": (
                    summary_match.group(1).strip()
                    if summary_match else ""
                ),

                "fixed_code": (
                    code_match.group(1).strip()
                    if code_match else ""
                ),

                "explanation": (
                    explanation_match.group(1).strip()
                    if explanation_match else ""
                )
            }

        except Exception as e:

            self.logger.error(
                f"Fix parsing failed: {str(e)}"
            )

            raise e
