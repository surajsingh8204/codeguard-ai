from pydantic import BaseModel


class ReviewIssue(BaseModel):

    severity: str

    category: str

    issue: str

    impact: str

    fix: str