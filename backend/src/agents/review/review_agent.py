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


class ReviewAgent(BaseAgent):

    def __init__(self):

        self.logger = AppLogger.get_logger(__name__)

        self.client = Groq(
            api_key=settings.GROQ_API_KEY
        )

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
                temperature=0.2
            )

            result = response.choices[0].message.content

            self.logger.info(
                f"Review generated for {file_name}"
            )

            return result

        except Exception as e:

            self.logger.error(str(e))

            return f"Review generation failed: {str(e)}"