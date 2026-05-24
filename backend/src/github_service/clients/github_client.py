from github import Github

from src.core.config.settings import settings


class GitHubClient:

    client = Github(
        settings.GITHUB_TOKEN
    )