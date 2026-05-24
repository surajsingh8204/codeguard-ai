from src.agents.security.security_agent import (
    SecurityAgent
)


class ReviewPipeline:

    def __init__(self):

        self.security_agent = SecurityAgent()

    def run(self, changed_files):

        reviews = []

        for file in changed_files:

            patch = file.get("patch")

            if not patch:
                continue

            security_review = self.security_agent.run(
                file["filename"],
                patch
            )

            reviews.append({
                "file": file["filename"],
                "security_review": security_review
            })

        return reviews