import os
import asyncio
import pytest
from unittest.mock import patch, MagicMock
from uuid import uuid4
import shutil
from pathlib import Path
from aioresponses import aioresponses
from endpoints.model.downloaded.downloaded import is_model_downloaded, get_downloaded_models


# Test the get_downloaded_models logic
# Cases:
# - No models are downloaded
# - One model is downloaded
# - Multiple models are downloaded
# - One model is downloaded, but not fully
# - One model is downloaded fully, another is not downloaded fully


# Mock constants
ID = str(uuid4())
HF_API_URL = "https://huggingface.co/api/models/openai-community/gpt2?"
MOCK_API_RESPONSE = {
    "siblings": [
        {
            "rfilename": "pytorch_model.bin",
        },
        {
            "rfilename": "config.json",
        },
        {
            "rfilename": "onnx/onnx_model.onnx",
        },
        {
            "rfilename": "tf_model/tf_model.pb",
        },
    ]
}


# Helpers
def clear_path():
    if os.path.exists("/tmp/models"):
        shutil.rmtree("/tmp/models")


# Fixtures
@pytest.fixture
def app_data_path_mock():
    with patch("endpoints.model.downloaded.downloaded.get_app_data_path") as mock_path:
        mock_path.return_value = Path("/tmp")
        yield mock_path


@pytest.fixture
def api_mock():
    with aioresponses() as mocked:
        mocked.get(HF_API_URL, status=200,
                   payload=MOCK_API_RESPONSE, repeat=True)
        yield mocked


@pytest.fixture
def mock_aiohttp_head():
    with patch("aiohttp.ClientSession.head") as mock_head:
        yield mock_head


@pytest.fixture
def mock_headers():
    async def _mock_headers(expected_headers):
        mock_resp = MagicMock()
        mock_resp.headers = expected_headers
        return mock_resp

    return _mock_headers


# Tests
@pytest.mark.asyncio
async def test_no_models_downloaded(app_data_path_mock):
    models = await get_downloaded_models()
    assert len(models) == 0


@pytest.mark.asyncio
async def test_one_model_downloaded(app_data_path_mock, api_mock, mock_aiohttp_head, mock_headers):
    clear_path()

    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # Create a model directory
    model_dir = Path(f"/tmp/models/{ID}/base")
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

    models = await get_downloaded_models()
    assert len(models) == 1
    assert models[0].id == ID


@pytest.mark.asyncio
async def test_multiple_models_downloaded(app_data_path_mock, api_mock, mock_aiohttp_head, mock_headers):
    clear_path()

    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # Create a model directory
    model_dir = Path(f"/tmp/models/{ID}/base")
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

    # Create another model directory
    model_dir = Path(f"/tmp/models/{str(uuid4())}/base")
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

    models = await get_downloaded_models()
    assert len(models) == 2


@pytest.mark.asyncio
async def test_one_model_downloaded_not_fully(app_data_path_mock, api_mock, mock_aiohttp_head, mock_headers):
    clear_path()

    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # Create a model directory
    model_dir = Path(f"/tmp/models/{ID}/base")
    model_dir.mkdir(parents=True, exist_ok=True)
    with open(model_dir / "pytorch_model.bin", "wb") as f:
        f.write(os.urandom(1024))
    with open(model_dir / "config.json", "wb") as f:
        f.write(os.urandom(1024))
    onnx_dir = model_dir / "onnx"
    onnx_dir.mkdir(parents=True, exist_ok=True)
    with open(onnx_dir / "onnx_model.onnx", "wb") as f:
        f.write(os.urandom(1024))

    models = await get_downloaded_models()
    assert len(models) == 0


@pytest.mark.asyncio
async def test_one_model_downloaded_fully_another_not_fully(app_data_path_mock, api_mock, mock_aiohttp_head, mock_headers):
    clear_path()

    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # Create a model directory
    model_dir = Path(f"/tmp/models/{ID}/base")
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

    # Create another model directory
    model_dir = Path(f"/tmp/models/{str(uuid4())}/base")
    model_dir.mkdir(parents=True, exist_ok=True)
    with open(model_dir / "pytorch_model.bin", "wb") as f:
        f.write(os.urandom(1024))
    with open(model_dir / "config.json", "wb") as f:
        f.write(os.urandom(1024))
    onnx_dir = model_dir / "onnx"
    onnx_dir.mkdir(parents=True, exist_ok=True)
    with open(onnx_dir / "onnx_model.onnx", "wb") as f:
        f.write(os.urandom(1024))

    models = await get_downloaded_models()
    assert len(models) == 1
    assert models[0].id == ID
