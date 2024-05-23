from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import os
from .sysinfo import sysinfo_generator
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from loguru import logger
from .endpoints.model.install import install_generator, InstallationSystemManager
from .utils import get_app_data_path
from .db import db

installation_system_manager = None


@asynccontextmanager
async def init_db():
    app_data_path = get_app_data_path()
    if os.getenv("ENV") == "prod":
        db_path = app_data_path / "truffle.db"
    else:
        db_path = app_data_path / "truffle.test.db"
    os.environ["DATABASE_URL"] = f"file:{db_path}"
    logger.info(f"Connecting to DB at: {db_path}")

    await db.connect()

    try:
        yield
    finally:
        logger.info(f"Disconnecting from DB")
        await db.disconnect()


@asynccontextmanager
async def lifespan(app: FastAPI):
    installation_system_manager = InstallationSystemManager()

    async with init_db():
        yield

app = FastAPI(lifespan=lifespan)


@app.get("/sysinfo", response_class=StreamingResponse)
async def sysinfo():
    response = StreamingResponse(
        sysinfo_generator(), media_type="text/event-stream")
    response.headers['Content-Type'] = 'text/event-stream'
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Connection'] = 'keep-alive'
    return response


@app.get("/highlights")
async def highlights():
    pass


@app.post("/model/install", response_class=StreamingResponse)
async def install_model(request: Request):
    # Get the model URL from the request body
    data = await request.json()
    model_download_url = data["url"]

    # Start the model installation process
    response = StreamingResponse(install_generator(
        model_download_url, installation_system_manager), media_type="text/event-stream")
    response.headers["Content-Type"] = "text/event-stream"
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Connection"] = "keep-alive"
    return response


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
