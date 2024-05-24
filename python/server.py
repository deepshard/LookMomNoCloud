from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import os
from jsonschema import validate, ValidationError
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from loguru import logger
from python.endpoints.sysinfo import sysinfo_generator
from python.endpoints.model.install import install_generator, InstallationManager
from python.utils import get_app_data_path
from python.db import db
from python.endpoints.model.delete import delete_model_handler


installation_manager = None


@asynccontextmanager
async def init_db():
    app_data_path = get_app_data_path()
    if os.getenv("ENV") == "prod":
        db_path = app_data_path / "truffle.db"
    else:
        db_path = app_data_path / "truffle.test.db"
    os.environ["DATABASE_URL"] = str(db_path)
    logger.info(f"Connecting to DB at: {db_path}")

    await db.connect()

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


@app.post("/model/run")
async def run_model():
    pass


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
