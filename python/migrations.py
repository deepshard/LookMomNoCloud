from alembic.config import Config
from alembic import command
from utils import get_db_path


def run_migrations():
    print("-- Running migrations")
    alembic_cfg = Config()
    alembic_cfg.set_main_option("script_location", "alembic")
    alembic_cfg.set_main_option("sqlalchemy.url", get_db_path())
    command.upgrade(alembic_cfg, "head")
    print("-- Done.")


if __name__ == "__main__":
    run_migrations()
