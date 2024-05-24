import os
from prisma import Prisma
from utils import get_app_data_path

db: Prisma = None
db = Prisma(
    datasource={
        "provider": "sqlite",
        "url":  f"file:{get_app_data_path() / "truffle.db" if os.getenv("ENV") == "prod" else get_app_data_path() / "truffle.test.db"}"
    }
)
