import os
from prisma import Prisma
from utils import get_app_data_path

db: Prisma = None

file = os.getenv(
    "DATABASE_URL",
    (
        str(get_app_data_path() / "truffle.db")
        if os.getenv("ENV") == "prod"
        else str(get_app_data_path() / "truffle.test.db")
    ),
)

db = Prisma(datasource={"provider": "sqlite", "url": f"file:{file}"})
