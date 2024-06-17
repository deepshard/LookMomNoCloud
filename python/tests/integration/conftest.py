import pytest
import pytest_asyncio
import os
import shutil
import asyncio
from httpx import AsyncClient
from pathlib import Path
from fastapi.testclient import TestClient
from db import get_db_session
from state import global_state_manager
from server import init_state, app
from models import RunningModel
from utils import get_app_data_path
from tests.integration.data import models


def clear_path():
    for model in models:
        if os.path.exists(get_app_data_path() / "models" / model["id"]):
            shutil.rmtree(get_app_data_path() / "models" / model["id"])


async def clear_db():
    await RunningModel.delete_all()


# Fixtures
@pytest_asyncio.fixture(autouse=True)
async def test_fixture(request):
    clear_path()
    await clear_db()
    os.makedirs(get_app_data_path() / "models", exist_ok=True)

    async with init_state():
        async with AsyncClient(app=app, base_url="http://testserver") as client:
            yield client

    def teardown():
        asyncio.run(clear_db())
        clear_path()

    request.addfinalizer(teardown)