from src.agents.base.base_agent import (
    BaseAgent
)
from src.agents.base.llm_client import (
    LLMClient
)

from src.core.logger.logger import (
    AppLogger
)


class ReviewAgent(BaseAgent):

    def __init__(self):

        self.logger = AppLogger.get_logger(__name__)

        self.llm = LLMClient()

        self.system_prompt = """
        You are a senior staff software engineer reviewing pull requests.

        Analyze the provided code diff carefully.

        Focus on:
        - Security vulnerabilities
        - Performance issues
        - Code quality
        - Maintainability
        - Dangerous patterns

        Return:
        - Severity
        - Issue
        - Explanation
        - Recommended fix

        Be concise but professional.
        """

    def run(self, file_name, patch):

        try:

            prompt = f"""
            File: {file_name}

            Diff:
            {patch}
            """

            result = self.llm.generate(
                system_prompt=self.system_prompt,
                user_prompt=prompt,
                temperature=0.2
            )

            self.logger.info(
                f"Review generated for {file_name}"
            )

            return result

        except Exception as e:

            self.logger.error(str(e))

            return f"Review generation failed: {str(e)}"