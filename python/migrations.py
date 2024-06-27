import os
from alembic.config import Config
from alembic import command
from utils import get_db_path
from dotenv import load_dotenv

load_dotenv()


def get_alembic_path():
    return "alembic"


def run_migrations():
    print("-- Running migrations:", get_db_path())
    alembic_cfg = Config()
    alembic_cfg.set_main_option("script_location", get_alembic_path())
    alembic_cfg.set_main_option("sqlalchemy.url", get_db_path())
    command.upgrade(alembic_cfg, "head")
    print("-- Done.")


if __name__ == "__main__":
    run_migrations()
