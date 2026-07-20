from datetime import datetime, timezone

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

from src.store.review_store import (
    ReviewStore
)


class GitHubWebhookService:

    def __init__(self):

        self.logger = AppLogger.get_logger(__name__)

        self.pr_service = PRService()

        self.review_pipeline = ReviewPipeline()

        self.comment_service = CommentService()

        self.latest_review = None

        self.reviews_by_key = {}

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

            ReviewStore.save_review(reviews)

            self.logger.info(
                "AI review pipeline completed"
            )

            formatted_review = self._format_reviews(
                reviews
            )

            review_payload = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "pr": pr_data,
                "reviews": reviews
            }

            key = f"{pr_data['repo']}#{pr_data['number']}"

            self.latest_review = review_payload
            self.reviews_by_key[key] = review_payload

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
                "error": "Webhook processing failed"
            }

    def _format_reviews(self, reviews):

        try:

            formatted_review = ""

            for review in reviews:

                formatted_review += f"""
# 🤖 AI Engineering Review for `{review['file']}`

"""

                # =========================
                # SECURITY FINDINGS
                # =========================

                security_findings = review[
                    "security_review"
                ].get("findings", [])

                if security_findings:

                    formatted_review += """
# 🔐 Security Findings

"""

                    for finding in security_findings:

                        formatted_review += f"""
## 🚨 {finding.get('severity', 'UNKNOWN')} Severity

- Category: {finding.get('category', 'Security')}

### Issue
{finding.get('issue', '')}

### Impact
{finding.get('impact', '')}

### Recommended Fix
{finding.get('fix', '')}

---
"""

                # =========================
                # PERFORMANCE FINDINGS
                # =========================

                performance_findings = review[
                    "performance_review"
                ].get("findings", [])

                if performance_findings:

                    formatted_review += """
# ⚡ Performance Findings

"""

                    for finding in performance_findings:

                        formatted_review += f"""
## ⚠️ {finding.get('severity', 'UNKNOWN')} Severity

- Category: {finding.get('category', 'Performance')}

### Issue
{finding.get('issue', '')}

### Impact
{finding.get('impact', '')}

### Recommended Fix
{finding.get('fix', '')}

---
"""

                # =========================
                # RISK ANALYSIS
                # =========================

                risk_review = review.get(
                    "risk_review",
                    {}
                )

                if risk_review:

                    affected_systems = "\n".join([
                        f"- {system}"
                        for system in risk_review.get(
                            "affected_systems",
                            []
                        )
                    ])

                    formatted_review += f"""
# 📊 Risk Analysis

- Risk Score: {risk_review.get('risk_score', 0)}/10

- Deployment Risk: {risk_review.get('deployment_risk', 'UNKNOWN')}

### Affected Systems
{affected_systems}

### Summary
{risk_review.get('summary', '')}

### Recommendation
{risk_review.get('recommendation', '')}

---
"""

                # =========================
                # IMPACT ANALYSIS
                # =========================

                impact_review = review.get(
                    "impact_review",
                    {}
                )

                if impact_review:

                    affected_systems = "\n".join([
                        f"- {system}"
                        for system in impact_review.get(
                            "affected_systems",
                                []
                        )
                    ])

                    formatted_review += f"""
# 🏗️ Architectural Impact Analysis

- Criticality: {impact_review.get('criticality', 'UNKNOWN')}

### Affected Systems
{affected_systems}

### Architectural Impact
{impact_review.get('architectural_impact', '')}

### Production Risk
{impact_review.get('production_risk', '')}

### Recommendation
{impact_review.get('recommendation', '')}

---
"""

                # =========================
                # FIX SUGGESTION
                # =========================

                fix_review = review.get(
                    "fix_review",
                    {}
                )

                if fix_review:

                    formatted_review += f"""
# 🛠️ Suggested AI Patch

### Patch Summary
{fix_review.get('patch_summary', '')}

### Improved Code
```python
{fix_review.get('fixed_code', '')}
```

---
"""

            return formatted_review

        except Exception as e:

            self.logger.error(
                f"Review formatting failed: {str(e)}"
            )

            return "Failed to format AI review."

    def get_latest_review(self):

        return self.latest_review

    def get_review(self, repo, pr_number):

        key = f"{repo}#{pr_number}"

        return self.reviews_by_key.get(key)
