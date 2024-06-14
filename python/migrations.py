from alembic.config import Config
from alembic import command
from sqlalchemy import create_engine
from db import get_app_data_path
import os


def get_db_path_sync():
    return os.getenv(
        "DATABASE_URL",
        (
            f"sqlite:///{str(get_app_data_path() / 'truffle.db')}"
            if os.getenv("ENV") == "prod"
            else f"sqlite:///{str(get_app_data_path() / 'truffle.test.db')}"
        ),
    )


def run_migrations():
    print("** Running migrations **")
    alembic_cfg = Config()
    alembic_cfg.set_main_option("script_location", "alembic")
    alembic_cfg.set_main_option("sqlalchemy.url", get_db_path_sync())
    command.upgrade(alembic_cfg, "head")
    print("** Migrations complete **")


if __name__ == "__main__":
    run_migrations()
