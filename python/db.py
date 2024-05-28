import os
from prisma import Prisma
from utils import get_app_data_path

db: Prisma = None

db_path = os.getenv(
    "DATABASE_URL",
    (
        f"file:{str(get_app_data_path() / 'truffle.db')}"
        if os.getenv("ENV") == "prod"
        else f"file:{str(get_app_data_path() / 'truffle.test.db')}"
    ),
)

db = Prisma(datasource={"provider": "sqlite", "url": f"{db_path}"})
