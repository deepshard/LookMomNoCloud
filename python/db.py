import os
from prisma import Prisma
from utils import get_app_data_path

db: Prisma = None
db_path = "file:" + str(get_app_data_path() / "truffle.test.db")
db = Prisma(
    datasource={
        "provider": "sqlite",
        "url":  db_path
        # f"file:{str(get_app_data_path() / "truffle.db") if os.getenv("ENV") == "prod" else str(get_app_data_path() / "truffle.test.db")}"
    }
)
