import sys
import pytest
import pytest_asyncio
import os
import shutil
import asyncio
from pathlib import Path
from multiprocessing import Process, set_start_method
import tests.unit.data as data
from unittest.mock import MagicMock
from aioresponses import aioresponses
from server import init_state
from constants import TRUFFLE_API_URL
from models import RunningModel


# Helpers
async def fake_process():
    while True:
        await asyncio.sleep(10)


def clear_path():
    if os.path.exists("/tmp/models"):
        shutil.rmtree("/tmp/models")


async def clear_db():
    await RunningModel.delete_all()


# Fixtures
@pytest_asyncio.fixture(autouse=True)
async def session_fixture(mocker):
    def _patcher(module):
        mocker.patch(f"{module}.get_app_data_path", return_value=Path("/tmp"))
        mocker.patch("utils.get_app_data_path", return_value=Path("/tmp"))

    yield _patcher


@pytest_asyncio.fixture(autouse=True)
async def test_fixture(request):
    clear_path()
    await clear_db()
    os.makedirs("/tmp/models", exist_ok=True)

    async with init_state():
        yield

    def teardown():
        asyncio.run(clear_db())
        clear_path()

    request.addfinalizer(teardown)


@pytest.fixture(autouse=True, params=["Linux", "Darwin", "Windows"])
def set_os(request, mocker):
    platform_module = sys.modules["platform"]
    mocker.patch.object(platform_module, "system", return_value=request.param)
    return request.param


@pytest.fixture(autouse=True)
def request_mocks(request, mocker):
    if "noautofixt" in request.keywords:
        mocked = {}
        yield mocked
        return

    with aioresponses() as mocked:
        # HuggingFace
        mocked.get(data.HF_API_URL, status=200, payload=data.MOCK_API_RESPONSE, repeat=True)
        mocked.get(data.HF_API_URL_1, status=200, payload=data.mocked_response_1, repeat=True)
        mocked.get(data.HF_API_URL_2, status=200, payload=data.mocked_response_2, repeat=True)
        mocked.get(data.FILE_ONE_URL, status=200, body=data.MOCK_FILE_ONE_DATA, repeat=True)
        mocked.get(data.FILE_TWO_URL, status=200, body=data.MOCK_FILE_TWO_DATA, repeat=True)
        mocked.get(data.FILE_THREE_URL, status=200, body=data.MOCK_FILE_THREE_DATA, repeat=True)
        mocked.get(data.FILE_FOUR_URL, status=200, body=data.MOCK_FILE_FOUR_DATA, repeat=True)

        # Truffle
        mocked.get(
            f"{TRUFFLE_API_URL}/models/{data.ID}",
            status=200,
            payload=data.MOCK_MODEL_1,
            repeat=True,
        )
        mocked.get(
            f"{TRUFFLE_API_URL}/models/{data.ID_2}",
            status=200,
            payload=data.MOCK_MODEL_2,
            repeat=True,
        )
        mocked.get(
            f"{TRUFFLE_API_URL}/models/trending?k=5",
            status=200,
            payload=data.MODELS,
            repeat=True,
        )
        mocked.get(
            f"{TRUFFLE_API_URL}/models/trending?k=4",
            status=200,
            payload=data.MODELS[1:],
            repeat=True,
        )
        mocked.get(
            f"{TRUFFLE_API_URL}/models/3fec7228-04de-485d-9f09-bde6e8ea350f",
            status=200,
            payload=data.MODELS[0],
            repeat=True,
        )
        mocked.get(
            f"{TRUFFLE_API_URL}/models/b438d015-ad45-4e9a-9aba-2e290348b078",
            status=200,
            payload=data.MODELS[1],
            repeat=True,
        )

        mock_head = mocker.patch("aiohttp.ClientSession.head")
        mock_head.return_value.__aenter__.return_value = MagicMock(headers={"Content-Length": 1024})

        yield mocked


@pytest.fixture
def mock_process():
    set_start_method("spawn", force=True)
    proc = Process(target=fake_process)
    proc.start()
    yield proc
