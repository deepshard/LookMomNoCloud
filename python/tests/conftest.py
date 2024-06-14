import sys
import pytest
import pytest_asyncio
import os
import shutil
import asyncio
from pathlib import Path
import tests.data as data
from unittest import mock
from unittest.mock import MagicMock, patch
from aioresponses import aioresponses
from db import get_db_session
from state import global_state_manager
from server import init_state
from constants import TRUFFLE_API_URL
from utils import get_app_data_path
from models import RunningModel

# Helpers


def clear_path():
    if os.path.exists("/tmp/models"):
        shutil.rmtree("/tmp/models")


async def clear_db():
    await RunningModel.delete_all()


# Fixtures
@pytest_asyncio.fixture(autouse=True)
async def session_fixture(request, mocker):
    def _patcher(module):
        mocker.patch(f"{module}.get_app_data_path", return_value=Path("/tmp"))

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


@pytest.fixture
def is_windows(mocker):
    platform_module = sys.modules["platform"]
    mocker.patch.object(platform_module, "system", return_value="Windows")


@pytest.fixture
def is_linux(mocker):
    platform_module = sys.modules["platform"]
    mocker.patch.object(platform_module, "system", return_value="Linux")


@pytest.fixture
def is_macos(mocker):
    platform_module = sys.modules["platform"]
    mocker.patch.object(platform_module, "system", return_value="Darwin")


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
            f"{TRUFFLE_API_URL}/models?id={data.ID}&filter=id,name,title,size,author,downloads,likes,intro,capabilities,risks,evalId,hfLink,bg_image_url",
            status=200,
            payload=data.MOCK_MODEL_1,
            repeat=True,
        )
        mocked.get(
            f"{TRUFFLE_API_URL}/models?id={data.ID_2}&filter=id,name,title,size,author,downloads,likes,intro,capabilities,risks,evalId,hfLink,bg_image_url",
            status=200,
            payload=data.MOCK_MODEL_2,
            repeat=True,
        )
        mocked.get(
            f"{TRUFFLE_API_URL}/models/trending?k=5&filter=id,name,title,size,author,downloads,likes,intro,capabilities,risks,evalId,hfLink,bg_image_url",
            status=200,
            payload=data.MODELS,
            repeat=True,
        )
        mocked.get(
            f"{TRUFFLE_API_URL}/models/trending?k=4&filter=id,name,title,size,author,downloads,likes,intro,capabilities,risks,evalId,hfLink,bg_image_url",
            status=200,
            payload=data.MODELS[1:],
            repeat=True,
        )
        mocked.get(
            f"{TRUFFLE_API_URL}/models?id=3fec7228-04de-485d-9f09-bde6e8ea350f&filter=id,name,title,size,author,downloads,likes,intro,capabilities,risks,evalId,hfLink,bg_image_url",
            status=200,
            payload=data.MODELS[0],
            repeat=True,
        )

        mock_head = mocker.patch("aiohttp.ClientSession.head")
        mock_head.return_value.__aenter__.return_value = MagicMock(headers={"Content-Length": 1024})

        yield mocked
