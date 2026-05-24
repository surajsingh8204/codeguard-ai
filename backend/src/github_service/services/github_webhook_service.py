from src.core.logger.logger import AppLogger

from src.github_service.services.pr_service import (
    PRService
)

from src.github_service.services.comment_service import (
    CommentService
)

from src.agents.review.review_pipeline import (
    ReviewPipeline
)


class GitHubWebhookService:

    def __init__(self):

        self.logger = AppLogger.get_logger(__name__)

        self.pr_service = PRService()

        self.review_pipeline = ReviewPipeline()

        self.comment_service = CommentService()

    async def handle_webhook(self, payload, headers):

        try:

            event = headers.get("X-GitHub-Event")

            if event != "pull_request":

                self.logger.info(
                    "Ignored non pull request event"
                )

                return {
                    "message": "Ignored non-PR event"
                }

            action = payload.get("action")

            if action not in ["opened", "synchronize"]:

                self.logger.info(
                    f"Ignored PR action: {action}"
                )

                return {
                    "message": f"Ignored action: {action}"
                }

            pr_data = self.pr_service.extract_pr_data(
                payload
            )

            self.logger.info(
                f"PR RECEIVED: {pr_data}"
            )

            changed_files = self.pr_service.fetch_pr_files(
                repo_name=pr_data["repo"],
                pr_number=pr_data["number"]
            )

            self.logger.info(
                f"Fetched {len(changed_files)} changed files"
            )

            reviews = self.review_pipeline.run(
                changed_files
            )

            self.logger.info(
                "AI review pipeline completed"
            )

            formatted_review = self._format_reviews(
                reviews
            )

            self.comment_service.post_pr_comment(
                repo_name=pr_data["repo"],
                pr_number=pr_data["number"],
                comment=formatted_review
            )

            self.logger.info(
                "Review comment posted successfully"
            )

            return {
                "message": "PR analyzed successfully",
                "reviews": reviews
            }

        except Exception as e:

            self.logger.error(
                f"Webhook processing failed: {str(e)}"
            )

            return {
                "error": str(e)
            }

    def _format_reviews(self, reviews):

        try:

            formatted_review = ""

            for review in reviews:

                findings = review[
                    "security_review"
                ].get("findings", [])

                formatted_review += f"""
# 🔐 Security Review for `{review['file']}`

"""

                for finding in findings:

                    formatted_review += f"""
## 🚨 {finding.get('severity', 'UNKNOWN')} Severity

- Category: {finding.get('category', 'Security')}

### Issue
{finding.get('issue', 'No issue detected')}

### Impact
{finding.get('impact', 'No impact provided')}

### Recommended Fix
{finding.get('fix', 'No fix suggested')}

---
"""

            return formatted_review

        except Exception as e:

            self.logger.error(
                f"Review formatting failed: {str(e)}"
            )

            return "Failed to format AI review."