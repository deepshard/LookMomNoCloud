import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from loguru import logger
from migrations import run_migrations
from state import global_state_manager
from endpoints import (
    sysinfo_generator,
    delete_model_handler,
    install_generator,
    run_models_generator,
    stop_model_handler,
    get_highlights,
    get_downloaded_models,
)
from truffle_types import InstallRequest, RunRequest, StopRequest
from utils import get_app_data_path
import certifi
import ssl
import sys
import sentry_sdk

sentry_sdk.init(
    dsn="https://bb4e91f71f5d39ce023dbc4ac5ecda1f@o4505509110480896.ingest.us.sentry.io/4507518842044416",
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
)



@asynccontextmanager
async def init_state():
    await global_state_manager.launch()
    yield
    await global_state_manager.teardown()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with init_state():
        yield

    await global_state_manager.teardown()


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
    response = StreamingResponse(sysinfo_generator(), media_type="text/event-stream")
    response.headers["Content-Type"] = "text/event-stream"
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Connection"] = "keep-alive"
    return response


@app.get("/highlights")
async def highlights():
    try:
        return await get_highlights()
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail="Failed to fetch highlights")


@app.get("/model/downloaded")
async def downloaded():
    return await get_downloaded_models()


@app.post("/model/install", response_class=StreamingResponse)
async def install_model(request: InstallRequest):
    # Start the model installation process
    response = StreamingResponse(
        install_generator(request.id, request.url),
        media_type="text/event-stream",
    )
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Connection"] = "keep-alive"
    return response


@app.post("/model/run", response_class=StreamingResponse)
async def run_model(request: RunRequest):
    # Start the model running process
    response = StreamingResponse(
        run_models_generator(request.ids),
        media_type="text/event-stream",
    )
    response.headers["Cache-Control"] = "no-cache"
    response.headers["Connection"] = "keep-alive"
    return response


@app.post("/model/stop")
async def stop_model(request: StopRequest):
    await stop_model_handler(request.id, request.instance)
    return {}


@app.delete("/model/{model_id}")
async def delete_model(model_id: str):
    await delete_model_handler(model_id)
    return {}


if __name__ == "__main__":
    if sys.platform == "linux":
        os.environ["CUDA_PATH"] = os.path.join(sys._MEIPASS, "cuda")
        logger.info(f"-- Setting CUDA_PATH: {os.environ['CUDA_PATH']} --")

    import uvicorn
    import warnings
    import multiprocessing

    warnings.simplefilter("always")
    # multiprocessing and pyinstaller dont play nicely together
    multiprocessing.freeze_support()
    multiprocessing.set_start_method("spawn", force=True)

    # TODO: replace with proper certificates (ok for v1)
    os.environ["SSL_CERT_FILE"] = certifi.where()
    ssl._create_default_https_context = ssl._create_unverified_context

    # Setup: create models dir if it doesn't exist, and run migrations
    os.makedirs(get_app_data_path() / "models", exist_ok=True)
    run_migrations()

    uvicorn.run(app, host="0.0.0.0", port=8899)
