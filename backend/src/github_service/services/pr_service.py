from src.github_service.clients.github_client import (
    GitHubClient
)


class PRService:

    def extract_pr_data(self, payload):

        pr = payload["pull_request"]

        return {
            "title": pr["title"],
            "body": pr["body"],
            "url": pr["html_url"],
            "number": pr["number"],
            "repo": payload["repository"]["full_name"],
            "branch": pr["head"]["ref"]
        }

    def fetch_pr_files(self, repo_name, pr_number):

        repo = GitHubClient.client.get_repo(repo_name)

        pull_request = repo.get_pull(pr_number)

        files = pull_request.get_files()

        changed_files = []

        for file in files:

            changed_files.append({
                "filename": file.filename,
                "status": file.status,
                "patch": file.patch
            })

        return changed_files