import json
import os
import asyncio
import uuid
import aiohttp
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4
import shutil
from pathlib import Path
from aioresponses import aioresponses
from endpoints.highlights.highlights import get_highlights
from truffle_types import ModelStatus
from server import init_db
from db import db
import re


async def clear_db():
    async with init_db():
        await db.runningmodels.delete_many()


# Fixtures
@pytest.fixture(autouse=True)
def base_fixture(request):
    def teardown():
        asyncio.run(clear_db())

    request.addfinalizer(teardown)


# todo: fix this once we have deployed the highlights api
HIGHLIGHTS_URL = "https://api.deepshard.org"

MODELS = [
    {
        "id": "3fec7228-04de-485d-9f09-bde6e8ea350f",
        "name": "test",
        "title": "test",
        "size": 1,
        "author": "test",
        "downloads": 1,
        "likes": 1,
        "intro": "test",
        "capabilities": "test",
        "risks": "test",
        "hfLink": "test",
        "evalId": "test",
        "backgroundImage": "test",
    },
    {
        "id": "b438d015-ad45-4e9a-9aba-2e290348b078",
        "name": "test",
        "title": "test",
        "size": 1,
        "author": "test",
        "downloads": 1,
        "likes": 1,
        "intro": "test",
        "capabilities": "test",
        "risks": "test",
        "hfLink": "test",
        "evalId": "test",
        "backgroundImage": "test",
    },
    {
        "id": "e1b7a151-ad5a-4929-b9a2-20e42f629c4c",
        "name": "test",
        "title": "test",
        "size": 1,
        "author": "test",
        "downloads": 1,
        "likes": 1,
        "intro": "test",
        "capabilities": "test",
        "risks": "test",
        "hfLink": "test",
        "evalId": "test",
        "backgroundImage": "test",
    },
    {
        "id": "c081e038-a74c-4a7d-87d6-f36bbf7ff373",
        "name": "test",
        "title": "test",
        "size": 1,
        "author": "test",
        "downloads": 1,
        "likes": 1,
        "intro": "test",
        "capabilities": "test",
        "risks": "test",
        "hfLink": "test",
        "evalId": "test",
        "backgroundImage": "test",
    },
    {
        "id": "da05e829-9e9b-43d8-8c26-6141318700cb",
        "name": "test",
        "title": "test",
        "size": 1,
        "author": "test",
        "downloads": 1,
        "likes": 1,
        "intro": "test",
        "capabilities": "test",
        "risks": "test",
        "hfLink": "test",
        "evalId": "test",
        "backgroundImage": "test",
    },
]


@pytest.fixture
def trending_5_mock():
    with aioresponses() as mocked:
        mocked.get(
            f"{HIGHLIGHTS_URL}/models/trending?k=5",
            status=200,
            payload=MODELS,
            repeat=True,
        )
        yield mocked


@pytest.fixture
def trending_running_mock():
    with aioresponses() as mocked:
        mocked.get(
            f"{HIGHLIGHTS_URL}/models/trending?k=4",
            status=200,
            payload=MODELS[1:],
            repeat=True,
        )
        mocked.get(
            f"{HIGHLIGHTS_URL}/models?id=3fec7228-04de-485d-9f09-bde6e8ea350f",
            status=200,
            payload=MODELS[0],
            repeat=True,
        )
        yield mocked


@pytest.mark.asyncio
async def test_get_highlights_new_user(trending_5_mock):
    async with init_db():
        models = await get_highlights()
        assert len(models) == 5
        assert models[0].status == ModelStatus.NOT_DOWNLOADED
        assert models[1].status == ModelStatus.NOT_DOWNLOADED
        assert models[2].status == ModelStatus.NOT_DOWNLOADED
        assert models[3].status == ModelStatus.NOT_DOWNLOADED
        assert models[4].status == ModelStatus.NOT_DOWNLOADED


@pytest.mark.asyncio
async def test_get_highlights_models_running(trending_running_mock):
    async with init_db():
        mock_model = {
            "id": MODELS[0]["id"],
            "instance": 1,
            "name": "Test Model 1",
            "size": 8000000000,
            "pid": 1234,
            "port": 32423,
            "quantization": "INT4",
        }
        await db.runningmodels.create(mock_model)
        models = await get_highlights()

        assert len(models) == 5
        assert models[0].status == ModelStatus.RUNNING
        assert models[1].status == ModelStatus.NOT_DOWNLOADED
        assert models[2].status == ModelStatus.NOT_DOWNLOADED
        assert models[3].status == ModelStatus.NOT_DOWNLOADED
        assert models[4].status == ModelStatus.NOT_DOWNLOADED
