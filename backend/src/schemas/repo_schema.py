import re

from pydantic import BaseModel, Field, field_validator


GITHUB_REPO_URL_RE = re.compile(
    r"^https://github\.com/"
    r"(?P<owner>[A-Za-z0-9_.-]+)/"
    r"(?P<repo>[A-Za-z0-9_.-]+)"
    r"/?$"
)

REPO_KEY_RE = re.compile(
    r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$"
)


class RepoRequest(BaseModel):

    repo_url: str = Field(
        ...,
        min_length=20,
        max_length=200,
        description="Public GitHub repository URL",
    )

    @field_validator("repo_url")
    @classmethod
    def validate_github_url(cls, value: str) -> str:
        cleaned = value.strip().rstrip("/")

        if cleaned.endswith(".git"):
            cleaned = cleaned[:-4]

        match = GITHUB_REPO_URL_RE.match(cleaned)
        if not match:
            raise ValueError(
                "repo_url must be a public GitHub URL like "
                "https://github.com/owner/repo"
            )

        owner = match.group("owner")
        repo = match.group("repo")

        if owner.lower() in {"settings", "orgs", "marketplace"}:
            raise ValueError("Invalid GitHub repository owner")

        return f"https://github.com/{owner}/{repo}"


def validate_repo_key(repo: str) -> str:
    cleaned = repo.strip()
    if not REPO_KEY_RE.match(cleaned):
        raise ValueError(
            "repo must be in owner/name format"
        )
    return cleaned
