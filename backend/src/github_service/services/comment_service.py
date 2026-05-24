from src.github_service.clients.github_client import (
    GitHubClient
)

from src.core.logger.logger import (
    AppLogger
)


class CommentService:

    def __init__(self):

        self.logger = AppLogger.get_logger(__name__)

    def post_pr_comment(
        self,
        repo_name,
        pr_number,
        comment
    ):

        try:

            repo = GitHubClient.client.get_repo(
                repo_name
            )

            pull_request = repo.get_pull(
                pr_number
            )

            pull_request.create_issue_comment(
                comment
            )

            self.logger.info(
                f"Comment posted on PR #{pr_number}"
            )

        except Exception as e:

            self.logger.error(str(e))