import os
import shutil
import tempfile

from git import Repo

from src.core.logger.logger import (
    AppLogger
)

from src.agents.review.review_pipeline import (
    ReviewPipeline
)


class RepoAnalyzer:

    def __init__(self):

        self.logger = AppLogger.get_logger(__name__)

        self.review_pipeline = ReviewPipeline()

    def analyze_repository(self, repo_url):

        temp_dir = None
        repo = None

        try:

            if not repo_url:
                return []

            self.logger.info(
                f"Cloning repository: {repo_url}"
            )

            temp_dir = tempfile.mkdtemp()

            repo = Repo.clone_from(
                repo_url,
                temp_dir,
                depth=1
            )

            files_to_review = []

            allowed_extensions = (
                ".py",
                ".js",
                ".ts"
            )
            max_files = 3

            for root, dirs, files in os.walk(temp_dir):

                if ".git" in dirs:
                    dirs.remove(".git")

                for file in files:

                    if not file.endswith(
                        allowed_extensions
                    ):
                        continue

                    file_path = os.path.join(
                        root,
                        file
                    )
                    rel_path = os.path.relpath(
                        file_path,
                        temp_dir
                    )

                    try:

                        with open(
                            file_path,
                            "r",
                            encoding="utf-8",
                            errors="ignore"
                        ) as f:

                            content = f.read()

                        files_to_review.append({
                            "filename": rel_path,
                            "patch": content[:8000]
                        })

                    except Exception as e:

                        self.logger.error(
                            str(e)
                        )

                    if len(files_to_review) >= max_files:
                        break

                if len(files_to_review) >= max_files:
                    break

            self.logger.info(
                f"Collected {len(files_to_review)} files"
            )

            if not files_to_review:
                return []

            reviews = self.review_pipeline.run(
                files_to_review
            )

            return reviews

        except Exception as e:

            self.logger.error(str(e))

            return []

        finally:

            if repo is not None:
                try:
                    repo.close()
                except Exception:
                    self.logger.error("Failed to close repo handle")

            if temp_dir and os.path.exists(temp_dir):

                def _onerror(func, path, exc_info):
                    try:
                        os.chmod(path, 0o700)
                        func(path)
                    except Exception:
                        self.logger.error(
                            f"Cleanup failed for {path}: {exc_info[1]}"
                        )

                shutil.rmtree(temp_dir, onerror=_onerror)
