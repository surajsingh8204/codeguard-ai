import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path


class AppLogger:

    LOG_DIR = Path("logs")

    LOG_DIR.mkdir(exist_ok=True)

    @staticmethod
    def get_logger(name: str):

        logger = logging.getLogger(name)

        logger.setLevel(logging.INFO)

        if logger.handlers:
            return logger

        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
        )

        # =========================
        # Console Handler
        # =========================

        console_handler = logging.StreamHandler()

        console_handler.setFormatter(
            formatter
        )

        # =========================
        # Main App Log
        # =========================

        app_handler = RotatingFileHandler(
            filename="logs/app.log",
            maxBytes=5 * 1024 * 1024,
            backupCount=3,
            encoding="utf-8"
        )

        app_handler.setFormatter(
            formatter
        )

        # =========================
        # Error Log
        # =========================

        error_handler = RotatingFileHandler(
            filename="logs/errors.log",
            maxBytes=5 * 1024 * 1024,
            backupCount=3,
            encoding="utf-8"
        )

        error_handler.setLevel(
            logging.ERROR
        )

        error_handler.setFormatter(
            formatter
        )

        # =========================
        # Add Handlers
        # =========================

        logger.addHandler(
            console_handler
        )

        logger.addHandler(
            app_handler
        )

        logger.addHandler(
            error_handler
        )

        return logger