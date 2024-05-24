import os
import re
import json
import asyncio
import pytest
from prisma import Prisma
from unittest.mock import patch, MagicMock
import shutil
from aioresponses import aioresponses
from python.endpoints.model.install import InstallationManager
from python.endpoints.model.run import run_models_generator
from python.utils import get_app_data_path
from python.db import db
from python.server import init_db

schema = {
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "instance": {"type": "integer"},
        "port": {"type": "integer"},
        "error": {"type": "string"},
    }
}


# Test the run endpoint logic
# Cases:
# - Quantization does not exist
# - Quantization exists
# - Multiple models requested
# - There is already an instance running
# - Model is not in a convertable format
# - There is not enough space to convert all of the models
# - Models are processed via the conversion queue
# - Not enough memory to quantize a model
# - Not enough memory to run a model
# - Gets instance count from DB

# Mock Data
model_id_1 = "TEST_model_1"
model_id_2 = "TEST_model_2"
model_id_3 = "TEST_model_3"
model_files = [
    {
        "file": "pytorch_model.bin",
        "data": os.urandom(1024)
    },
    {
        "file": "config.json",
        "data": os.urandom(1024)
    },
]

# Helpers


def clear_path(path):
    if os.path.exists(path):
        shutil.rmtree(path)


async def clear_db(db):
    async with init_db():
        await db.runningmodels.delete_many()


# Fixtures
@pytest.fixture(scope="session", autouse=True)
def base_fixture():
    # Setup
    for model_id in [model_id_1, model_id_2, model_id_3]:
        model_path = get_app_data_path() / "models" / model_id / "base"
        os.makedirs(model_path, exist_ok=True)
        for file in model_files:
            with open(model_path / file["file"], "wb") as f:
                f.write(file["data"])

    yield

    # Teardown
    clear_path(get_app_data_path() / "models" / model_id_1)
    clear_path(get_app_data_path() / "models" / model_id_2)
    clear_path(get_app_data_path() / "models" / model_id_3)
    asyncio.run(clear_db(db))


@pytest.fixture
def server_mock():
    with patch("python.endpoints.model.run.run.is_server_running", return_value=True) as is_server_running:
        yield is_server_running


@pytest.fixture
def subprocess_mock():
    # Mock multiprocessing.Process, multiprocessing.Process.start, and multiprocessing.Process.terminate
    with patch("multiprocessing.Process") as Process:
        process = MagicMock()
        process.pid = 1234
        Process.return_value = process
        yield process


@pytest.fixture
def mlc_mock():
    # Mock convert_and_quantize, when called write some data to the model's quantization directory
    with patch("python.endpoints.model.run.run.convert_and_quantize", return_value=None) as convert_and_quantize:
        def write_data(weights_path, quant_path, quant):
            os.makedirs(quant_path, exist_ok=True)
            with open(quant_path / "model.bin", "wb") as f:
                f.write("test".encode("utf-8"))

        convert_and_quantize.side_effect = write_data
        yield convert_and_quantize


# Tests
@pytest.mark.asyncio
async def test_run_quantization_does_not_exist(base_fixture, server_mock, subprocess_mock, mlc_mock):
    async with init_db():
        manager = InstallationManager()

        # Prepare JSON streaming responses as they would be sent from the generator
        stream = run_models_generator([model_id_1], manager)

        # Collect the responses
        responses = []
        async for response in stream:
            responses.append(json.loads(response[5:]))

        # Check the responses
        assert mlc_mock.call_count == 1
        assert len(responses) == 1
        assert responses[-1]["id"] == model_id_1
        assert responses[-1]["instance"] == 1
        assert responses[-1]["port"] == 8899
        assert responses[-1]["error"] == None
