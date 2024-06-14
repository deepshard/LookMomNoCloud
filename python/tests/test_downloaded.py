import os
import asyncio
import pytest
from unittest.mock import patch, MagicMock
from uuid import uuid4
import shutil
from pathlib import Path
from aioresponses import aioresponses
from state import global_state_manager
from server import init_state
from endpoints.model.downloaded.downloaded import get_downloaded_models
from constants import TRUFFLE_API_URL
from tests.data import ID, ID_2


# Helpers
def create_model_dir(model_id: str):
    model_dir = Path(f"/tmp/models/{model_id}/base")
    model_dir.mkdir(parents=True, exist_ok=True)
    with open(model_dir / "pytorch_model.bin", "wb") as f:
        f.write(os.urandom(1024))
    with open(model_dir / "config.json", "wb") as f:
        f.write(os.urandom(1024))
    onnx_dir = model_dir / "onnx"
    onnx_dir.mkdir(parents=True, exist_ok=True)
    with open(onnx_dir / "onnx_model.onnx", "wb") as f:
        f.write(os.urandom(1024))
    tf_dir = model_dir / "tf_model"
    tf_dir.mkdir(parents=True, exist_ok=True)
    with open(tf_dir / "tf_model.pb", "wb") as f:
        f.write(os.urandom(1024))


def create_partial_model_dir(model_id: str):
    model_dir = Path(f"/tmp/models/{model_id}/base")
    model_dir.mkdir(parents=True, exist_ok=True)
    with open(model_dir / "pytorch_model.bin", "wb") as f:
        f.write(os.urandom(1024))
    with open(model_dir / "config.json", "wb") as f:
        f.write(os.urandom(1024))
    onnx_dir = model_dir / "onnx"
    onnx_dir.mkdir(parents=True, exist_ok=True)
    with open(onnx_dir / "onnx_model.onnx", "wb") as f:
        f.write(os.urandom(1024))


# Test the get_downloaded_models logic
# Cases:
# - No models are downloaded
# - One model is downloaded
# - Multiple models are downloaded
# - One model is downloaded, but not fully
# - One model is downloaded fully, another is not downloaded fully


# Tests
@pytest.mark.asyncio
async def test_no_models_downloaded(session_fixture):
    # Mocks
    session_fixture("endpoints.model.downloaded.downloaded")

    # Test
    models = await get_downloaded_models()
    assert len(models) == 0


@pytest.mark.asyncio
async def test_one_model_downloaded(session_fixture):
    # Mocks
    session_fixture("endpoints.model.downloaded.downloaded")

    # Create a model directory
    create_model_dir(ID)

    # Test
    models = await get_downloaded_models()
    assert len(models) == 1
    assert models[0].id == ID


@pytest.mark.asyncio
async def test_multiple_models_downloaded(session_fixture):
    # Mocks
    session_fixture("endpoints.model.downloaded.downloaded")

    # Create model directories
    create_model_dir(ID)
    create_model_dir(ID_2)

    # Test
    models = await get_downloaded_models()
    assert len(models) == 2


@pytest.mark.asyncio
async def test_one_model_downloaded_not_fully(session_fixture):
    # Mocks
    session_fixture("endpoints.model.downloaded.downloaded")

    # Create a partial model directory
    create_partial_model_dir(ID)

    # Test
    models = await get_downloaded_models()
    assert len(models) == 0


@pytest.mark.asyncio
async def test_one_model_downloaded_fully_another_not_fully(session_fixture):
    # Mocks
    session_fixture("endpoints.model.downloaded.downloaded")

    # Create a model directories
    create_model_dir(ID)
    create_partial_model_dir(ID_2)

    models = await get_downloaded_models()
    assert len(models) == 1
    assert models[0].id == ID
