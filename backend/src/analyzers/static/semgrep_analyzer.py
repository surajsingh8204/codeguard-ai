import json
import subprocess
import tempfile
import os

from src.core.logger.logger import (
    AppLogger
)


class SemgrepAnalyzer:

    def __init__(self):

        self.logger = AppLogger.get_logger(__name__)

    def analyze(self, file_name, patch):

        try:

            temp_file_path = self._create_temp_file(
                file_name,
                patch
            )

            command = [
                "semgrep",
                "--config=auto",
                "--json",
                temp_file_path
            ]

            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="ignore"
            )

            os.remove(temp_file_path)

            if result.returncode not in [0, 1]:

                raise Exception(result.stderr)

            parsed_output = json.loads(
                result.stdout
            )

            findings = self._extract_findings(
                parsed_output
            )

            self.logger.info(
                f"Semgrep analysis completed for {file_name}"
            )

            return findings

        except Exception as e:

            self.logger.error(
                f"Semgrep analysis failed: {str(e)}"
            )

            return []

    def _create_temp_file(self, file_name, patch):

        suffix = os.path.splitext(
            file_name
        )[1]

        temp_file = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
            mode="w",
            encoding="utf-8"
        )

        cleaned_patch = self._clean_patch(
            patch
        )

        temp_file.write(cleaned_patch)

        temp_file.close()

        return temp_file.name

    def _clean_patch(self, patch):

        cleaned_lines = []

        for line in patch.splitlines():

            if line.startswith("+") and not line.startswith("+++"):
                cleaned_lines.append(line[1:])

        return "\n".join(cleaned_lines)

    def _extract_findings(self, semgrep_output):

        findings = []

        results = semgrep_output.get(
            "results",
            []
        )

        for result in results:

            findings.append({
                "severity": result.get(
                    "extra",
                    {}
                ).get(
                    "severity",
                    "UNKNOWN"
                ),

                "issue": result.get(
                    "extra",
                    {}
                ).get(
                    "message",
                    "Unknown issue"
                ),

                "rule_id": result.get(
                    "check_id",
                    ""
                ),

                "line": result.get(
                    "start",
                    {}
                ).get(
                    "line",
                    0
                )
            })

        return findings