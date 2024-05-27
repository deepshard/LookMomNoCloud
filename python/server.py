from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import subprocess
from jsonschema import validate, ValidationError
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from loguru import logger
from endpoints.sysinfo import sysinfo_generator
from endpoints.model.install import install_generator, InstallationManager
from endpoints.model.run import run_models_generator
from endpoints.model.delete import delete_model_handler
from utils import get_app_data_path
from db import db


installation_manager = None


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
        print("Checking if DB is already migrated")
        await db.execute_raw("SELECT * FROM runningmodels")
    except Exception:
        logger.info(f"Running migrations")
        subprocess.run(["bunx", "prisma", "db", "push",
                       "--schema", "python/prisma/schema.prisma"], check=True)

    try:
        yield
    finally:
        logger.info(f"Disconnecting from DB")
        await db.disconnect()


@asynccontextmanager
async def lifespan(app: FastAPI):
    installation_manager = InstallationManager()

    async with init_db():
        yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    # Validate the request body and get the model URL
    request_body = await request.json()

    try:
        schema = {
            "type": "object",
            "properties": {
                "url": {"type": "string"}
            },
            "required": ["url"]
        }
        validate(instance=request_body, schema=schema)
        model_download_url = request_body["url"]
    except ValidationError as e:
        raise HTTPException(
            status_code=400, detail=f"Invalid request body: {e}")

    # Start the model installation process
    response = StreamingResponse(install_generator(
        model_download_url, installation_manager), media_type="text/event-stream")
    response.headers["Content-Type"] = "text/event-stream"
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Connection"] = "keep-alive"
    return response


@app.post("/model/run", response_class=StreamingResponse)
async def run_model(request: Request):
    # Validate the request body and get the model IDs
    request_body = await request.json()

    try:
        schema = {
            "type": "object",
            "properties": {
                "model_ids": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["model_ids"]
        }
        validate(instance=request_body, schema=schema)
        model_ids = request_body["model_ids"]
    except ValidationError as e:
        raise HTTPException(
            status_code=400, detail=f"Invalid request body: {e}")

    # Start the model running process
    response = StreamingResponse(run_models_generator(
        model_ids, installation_manager), media_type="text/event-stream")
    response.headers["Content-Type"] = "text/event-stream"
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Connection"] = "keep-alive"
    return response


@app.post("/model/stop")
async def stop_model():
    pass


@app.delete("/model/{model_id}")
async def delete_model(model_id: str):
    try:
        delete_model_handler(model_id)
    except Exception as e:
        raise HTTPException(
            status_code=404, detail="Model directory not found")

    return {}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8899)
