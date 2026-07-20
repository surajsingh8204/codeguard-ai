import os
import shutil
import tempfile
import zipfile

import requests

from src.core.config.settings import settings
from src.core.logger.logger import (
    AppLogger
)

from src.agents.review.review_pipeline import (
    ReviewPipeline
)


class RepoAnalyzer:

    CHUNK_SIZE = 64 * 1024
    MAX_ZIP_BYTES = 50 * 1024 * 1024
    MAX_FILE_BYTES = 512 * 1024

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

            zip_path = os.path.join(
                temp_dir,
                "repo.zip"
            )

            self._download_repo_zip(repo_url, zip_path)

            with zipfile.ZipFile(
                zip_path,
                "r"
            ) as zip_ref:

                self._safe_extract(zip_ref, temp_dir)

            extracted_dirs = [
                d for d in os.listdir(temp_dir)
                if os.path.isdir(
                    os.path.join(temp_dir, d)
                )
            ]

            if not extracted_dirs:
                raise Exception(
                    "Repository archive contained no folders"
                )

            repo_folder = os.path.join(
                temp_dir,
                extracted_dirs[0]
            )

            files_to_review = self._collect_files(
                repo_folder
            )

            self.logger.info(
                f"Collected {len(files_to_review)} chunks"
            )

            # Analyze in batches to bound peak memory.
            batch_size = 5
            reviews = []

            for index in range(
                0,
                len(files_to_review),
                batch_size
            ):
                batch = files_to_review[
                    index:index + batch_size
                ]
                reviews.extend(
                    self.review_pipeline.run(batch)
                )

            return reviews

        except Exception as e:

            self.logger.error(str(e))

            return []

        finally:

            if temp_dir and os.path.exists(temp_dir):

                shutil.rmtree(temp_dir, ignore_errors=True)

    def _download_repo_zip(self, repo_url, zip_path):

        branch_urls = [
            f"{repo_url}/archive/refs/heads/main.zip",
            f"{repo_url}/archive/refs/heads/master.zip",
        ]

        last_error = "Failed to download repository"

        for zip_url in branch_urls:
            try:
                with requests.get(
                    zip_url,
                    stream=True,
                    timeout=60
                ) as response:
                    if response.status_code != 200:
                        last_error = (
                            f"Download failed with "
                            f"status {response.status_code}"
                        )
                        continue

                    total = 0
                    with open(zip_path, "wb") as handle:
                        for chunk in response.iter_content(
                            chunk_size=self.CHUNK_SIZE
                        ):
                            if not chunk:
                                continue
                            total += len(chunk)
                            if total > self.MAX_ZIP_BYTES:
                                raise Exception(
                                    "Repository archive exceeds "
                                    "size limit"
                                )
                            handle.write(chunk)

                    return

            except Exception as e:
                last_error = str(e)
                self.logger.error(last_error)

        raise Exception(last_error)

    def _safe_extract(self, zip_ref, destination):

        destination = os.path.abspath(destination)

        for member in zip_ref.infolist():
            member_path = os.path.abspath(
                os.path.join(destination, member.filename)
            )
            if not member_path.startswith(
                destination + os.sep
            ) and member_path != destination:
                raise Exception(
                    "Unsafe path detected in archive"
                )

        zip_ref.extractall(destination)

    def _collect_files(self, repo_folder):

        files_to_review = []
        allowed_extensions = (".py", ".js", ".ts")
        max_files = settings.MAX_ANALYZE_FILES
        max_chars = settings.MAX_FILE_CHARS
        max_chunks = settings.MAX_CHUNKS_PER_FILE

        for root, dirs, files in os.walk(repo_folder):
            # Skip common bulky / irrelevant dirs.
            dirs[:] = [
                d for d in dirs
                if d not in {
                    ".git",
                    "node_modules",
                    "dist",
                    "build",
                    "__pycache__",
                    ".venv",
                    "venv",
                }
            ]

            for file in files:
                if not file.endswith(allowed_extensions):
                    continue

                file_path = os.path.join(root, file)

                try:
                    file_size = os.path.getsize(file_path)
                    if file_size > self.MAX_FILE_BYTES:
                        self.logger.info(
                            f"Skipping large file: {file}"
                        )
                        continue

                    content = self._read_text_limited(
                        file_path,
                        max_chars * max_chunks
                    )

                    if not content.strip():
                        continue

                    relative = os.path.relpath(
                        file_path,
                        repo_folder
                    ).replace("\\", "/")

                    chunks = self._chunk_content(
                        content,
                        max_chars,
                        max_chunks
                    )

                    for chunk_index, chunk in enumerate(
                        chunks
                    ):
                        label = relative
                        if len(chunks) > 1:
                            label = (
                                f"{relative}"
                                f"#chunk{chunk_index + 1}"
                            )

                        files_to_review.append({
                            "filename": label,
                            "patch": chunk
                        })

                        if len(files_to_review) >= max_files:
                            return files_to_review

                except Exception as e:
                    self.logger.error(str(e))

        return files_to_review

    def _read_text_limited(self, file_path, max_chars):

        chars = []
        total = 0

        with open(
            file_path,
            "r",
            encoding="utf-8",
            errors="ignore"
        ) as handle:
            while total < max_chars:
                block = handle.read(
                    min(self.CHUNK_SIZE, max_chars - total)
                )
                if not block:
                    break
                chars.append(block)
                total += len(block)

        return "".join(chars)

    def _chunk_content(self, content, max_chars, max_chunks):

        if len(content) <= max_chars:
            return [content]

        chunks = []
        start = 0

        while (
            start < len(content)
            and len(chunks) < max_chunks
        ):
            end = start + max_chars
            chunks.append(content[start:end])
            start = end

        return chunks
