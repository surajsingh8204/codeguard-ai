from src.agents.review.langgraph_workflow import (
    app
)


class ReviewPipeline:

    def __init__(self):

        self.workflow = app

    def run(self, changed_files):

        reviews = []

        for file in changed_files:

            patch = file.get("patch")

            if not patch:
                continue

            initial_state = {
                "file_name": file["filename"],
                "patch": patch,
                "risk_review": {},
                "security_review": {},
                "performance_review": {},
                "impact_review": {},
                "fix_review": {}
            }

            result = self.workflow.invoke(
                initial_state
            )

            reviews.append({
                "file": file["filename"],

                "security_review": result.get(
                    "security_review",
                    {}
                ),
                "performance_review": result.get(
                    "performance_review",
                    {}
                ),
                "risk_review": result.get(
                    "risk_review",
                    {}
                ),
                "impact_review": result.get(
                    "impact_review",
                    {}
                ),
                "fix_review": result.get(
                    "fix_review",
                    {}
                )
            })

        return reviews