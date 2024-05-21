import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from loguru import logger
from prisma import Prisma
from utils import get_app_data_path


db = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create "DATABASE_URL" environment variable with the path to the user data directory
    # for Prisma to access the SQLite database
    app_data_path = get_app_data_path()
    db_path = app_data_path / "truffle.db"
    os.environ["DATABASE_URL"] = f"file:{db_path}"
    logger.info(f"Using DB path: {db_path}")

    # Connect to DB on startup
    # With SQLite this should automatically create the DB file
    db = Prisma()
    await db.connect()

    yield

    # Disconnect from DB on shutdown
    await db.disconnect()


app = FastAPI(lifespan=lifespan)


@app.get("/sysinfo")
async def sysinfo():
    pass


@app.get("/highlights")
async def highlights():
    pass


@app.post("/model/install")
async def install_model():
    pass


@app.post("/model/run")
async def run_model():
    pass


@app.post("/model/stop")
async def stop_model():
    pass


@app.delete("/model/{model_id}")
async def delete_model(model_id: str):
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8899)
