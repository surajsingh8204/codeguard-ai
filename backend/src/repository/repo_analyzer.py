import os
import shutil
import tempfile
import zipfile

import requests

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

        try:

            self.logger.info(
                f"Downloading repository: {repo_url}"
            )

            temp_dir = tempfile.mkdtemp()

            repo_name = repo_url.rstrip("/").split("/")[-1]

            zip_url = f"{repo_url}/archive/refs/heads/main.zip"

            zip_path = os.path.join(
                temp_dir,
                "repo.zip"
            )

            response = requests.get(zip_url)

            if response.status_code != 200:

                zip_url = (
                    f"{repo_url}/archive/refs/heads/master.zip"
                )

                response = requests.get(zip_url)

            if response.status_code != 200:

                raise Exception(
                    "Failed to download repository"
                )

            with open(zip_path, "wb") as f:

                f.write(response.content)

            with zipfile.ZipFile(
                zip_path,
                "r"
            ) as zip_ref:

                zip_ref.extractall(temp_dir)

            extracted_dirs = [
                d for d in os.listdir(temp_dir)
                if os.path.isdir(
                    os.path.join(temp_dir, d)
                )
            ]

            repo_folder = os.path.join(
                temp_dir,
                extracted_dirs[0]
            )

            files_to_review = []

            allowed_extensions = (
                ".py",
                ".js",
                ".ts"
            )

            for root, _, files in os.walk(repo_folder):

                for file in files:

                    if file.endswith(
                        allowed_extensions
                    ):

                        file_path = os.path.join(
                            root,
                            file
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
                                "filename": file,
                                "patch": content[:8000]
                            })

                        except Exception as e:

                            self.logger.error(str(e))

                    if len(files_to_review) >= 3:
                        break

                if len(files_to_review) >= 3:
                    break

            self.logger.info(
                f"Collected {len(files_to_review)} files"
            )

            reviews = self.review_pipeline.run(
                files_to_review
            )

            return reviews

        except Exception as e:

            self.logger.error(str(e))

            return []

        finally:

            if temp_dir and os.path.exists(temp_dir):

                shutil.rmtree(temp_dir)