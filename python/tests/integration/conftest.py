import pytest_asyncio
import os
import signal
import shutil
import asyncio
from httpx import AsyncClient
from server import init_state
from models import RunningModel
from utils import get_app_data_path
from tests.integration.data import models
from endpoints.model.install.install import (
    get_files_to_download,
    download_file,
    get_file_download_url,
    convert_quantize_compile,
)
from endpoints.model.run.run import run_model
from truffle_types import Quantization


def clear_path():
    for model in models:
        if os.path.exists(get_app_data_path() / "models" / model["id"]):
            shutil.rmtree(get_app_data_path() / "models" / model["id"])


async def clear_db():
    models = await RunningModel.get_all()
    for model in models:
        os.kill(model.pid, signal.SIGTERM)

    await RunningModel.delete_all()


# Fixtures
@pytest_asyncio.fixture(autouse=True)
async def test_fixture(request):
    clear_path()
    await clear_db()
    os.makedirs(get_app_data_path() / "models", exist_ok=True)

    async with init_state():
        async with AsyncClient(base_url="http://localhost:8899", timeout=300) as client:
            yield client

    def teardown():
        asyncio.run(clear_db())
        clear_path()

    request.addfinalizer(teardown)


@pytest_asyncio.fixture
async def model_downloaded():
    model_id = models[0]["id"]
    model_url = models[0]["url"]

    model_path = get_app_data_path() / "models" / model_id / "base"
    files_to_download = await get_files_to_download(model_url, model_path)
    progress_tracker = {"downloaded_bytes": 0}
    tasks = [
        download_file(
            get_file_download_url(model_url, file.file),
            model_path,
            file,
            progress_tracker,
        )
        for file in files_to_download
    ]
    await asyncio.gather(*tasks)


@pytest_asyncio.fixture
async def models_downloaded():
    for model in models:
        model_id = model["id"]
        model_url = model["url"]

        model_path = get_app_data_path() / "models" / model_id / "base"
        files_to_download = await get_files_to_download(model_url, model_path)
        progress_tracker = {"downloaded_bytes": 0}
        tasks = [
            download_file(
                get_file_download_url(model_url, file.file),
                model_path,
                file,
                progress_tracker,
            )
            for file in files_to_download
        ]
        await asyncio.gather(*tasks)


@pytest_asyncio.fixture
async def model_installed(model_downloaded):
    model_id = models[0]["id"]
    base_weights_path = get_app_data_path() / "models" / model_id / "base"
    quant_weights_path = get_app_data_path() / "models" / model_id / "q0f16"
    await convert_quantize_compile(
        model_id, base_weights_path, quant_weights_path, Quantization.Q0F16
    )


@pytest_asyncio.fixture
async def models_installed(models_downloaded):
    for model in models:
        model_id = model["id"]
        base_weights_path = get_app_data_path() / "models" / model_id / "base"
        quant_weights_path = get_app_data_path() / "models" / model_id / "q0f16"
        convert_quantize_compile(base_weights_path, quant_weights_path, Quantization.Q0F16)


# @pytest_asyncio.fixture
# async def model_running(model_installed):
#     model_id = models[0]["id"]
#     await run_model(model_id, Quantization.Q0F16, 0.85, 1, 8900)
