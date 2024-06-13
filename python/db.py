import os
from prisma import Prisma
from utils import get_app_data_path
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker


def get_db_path():
    return os.getenv(
        "DATABASE_URL",
        (
            f"sqlite+aiosqlite:///{str(get_app_data_path() / 'truffle.db')}"
            if os.getenv("ENV") == "prod"
            else f"sqlite+aiosqlite:///{str(get_app_data_path() / 'truffle.test.db')}"
        ),
    )


def get_db_path_sync():
    return os.getenv(
        "DATABASE_URL",
        (
            f"sqlite:///{str(get_app_data_path() / 'truffle.db')}"
            if os.getenv("ENV") == "prod"
            else f"sqlite:///{str(get_app_data_path() / 'truffle.test.db')}"
        ),
    )


engine = create_async_engine(get_db_path(), echo=True)
get_db_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
