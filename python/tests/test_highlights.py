import os
import asyncio
import pytest
from unittest.mock import patch, MagicMock
from uuid import uuid4
import shutil
from pathlib import Path
from aioresponses import aioresponses
from endpoints.highlights.highlights import get_highlights
from truffle_types import ModelStatus
from server import init_db
from db import db


async def clear_db():
    async with init_db():
        await db.runningmodels.delete_many()


# Fixtures
@pytest.fixture(autouse=True)
def base_fixture(request):
    def teardown():
        asyncio.run(clear_db())

    request.addfinalizer(teardown)


@pytest.mark.asyncio
async def test_get_highlights_new_user():
    async with init_db():
        models = await get_highlights()
        assert len(models) == 5
        assert models[0].status == ModelStatus.NOT_DOWNLOADED
        assert models[1].status == ModelStatus.NOT_DOWNLOADED
        assert models[2].status == ModelStatus.NOT_DOWNLOADED
        assert models[3].status == ModelStatus.NOT_DOWNLOADED
        assert models[4].status == ModelStatus.NOT_DOWNLOADED


@pytest.mark.asyncio
async def test_get_highlights_models_running():
    async with init_db():
        mock_model = {
            "id": "5ffca129-7c4f-426d-a8ff-ad588ccb3037",
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
