from alembic.config import Config
from alembic import command
from db import get_db_path_sync


def run_migrations():
    alembic_cfg = Config()
    alembic_cfg.set_main_option("script_location", "alembic")
    alembic_cfg.set_main_option("sqlalchemy.url", get_db_path_sync())
    command.upgrade(alembic_cfg, "head")


if __name__ == "__main__":
    run_migrations()
