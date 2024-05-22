import asyncio
import pytest
import aiohttp
from unittest.mock import Mock, patch, AsyncMock, MagicMock
import json
from python.endpoints.model.install import install_generator, InstallationSystemManager
from python.utils import get_app_data_path

schema = {
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "status": {"type": "string", "enum": ["DOWNLOADING", "INSTALLING", "DONE"]},
        "progress": {"type": "integer"},
        "error": {"type": "string"},
    }
}


# Test the install endpoint logic
# Cases:
# - Install single model from scratch
# - Complete partial installation of single model
# - Skip download of already downloaded model
# - Model download doesn't block starting another download
# - Model download returns progress in expected format
# - Returns error if there is not enough space to download (single model)
# - Returns error if there is not enough space to download (with a model already in progress)
# - Converting and quantizing a model from scratch
# - Skips conversion and quantization of already converted model
# - Only converts and quantizes a single model at a time
# - Returns error if model weights are not in the expected format
# - Returns error if there is not enough space or memory to convert and quantize
# - Start of conversion and quantization returns status transition
# - Completion of conversion and quantization returns status transition


# Mock constants
MODEL_URL = "https://huggingface.co/meta-llama/Meta-Llama-3-8B"
HF_API_URL = "https://huggingface.co/api/models/meta-llama/Meta-Llama-3-8B?"
FILE_ONE_URL = "https://huggingface.co/meta-llama/Meta-Llama-3-8B/resolve/main/pytorch_model.bin"
FILE_TWO_URL = "https://huggingface.co/meta-llama/Meta-Llama-3-8B/resolve/main/config.json"
MOCK_API_RESPONSE = {
    "siblings": [
        {
            "rfilename": "pytorch_model.bin",
        },
        {
            "rfilename": "config.json",
        },
    ]
}
MOCK_FILE_ONE_DATA = b'Mock binary data for testing'
MOCK_FILE_TWO_DATA = '{"key": "value"}'

# Set up testing utils
# Mock request responses


@pytest.fixture
def mock_aiohttp_get():
    with patch("aiohttp.ClientSession.get") as mock_get:
        yield mock_get


@pytest.fixture
def mock_aiohttp_head():
    with patch("aiohttp.ClientSession.head") as mock_head:
        yield mock_head


@pytest.fixture
def mock_response():
    async def _mock_response(expected_response):
        mock_resp = MagicMock()
        mock_resp.json = AsyncMock(return_value=expected_response)
        mock_resp.raise_for_status = MagicMock()
        return mock_resp
    return _mock_response


@pytest.fixture
def mock_headers():
    async def _mock_headers(expected_headers):
        mock_resp = MagicMock()
        mock_resp.headers = expected_headers
        return mock_resp
    return _mock_headers


@pytest.mark.asyncio
async def test_install_single_model_from_scratch(mock_aiohttp_get, mock_aiohttp_head, mock_response, mock_headers, mocker):
    # Setup mock behavior for download tasks in install_generator
    mock_aiohttp_get.return_value.__aenter__.return_value = await mock_response(MOCK_API_RESPONSE)
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024})
    mock_mlc = mocker.patch(
        "python.endpoints.model.install.install.convert_and_quantize", return_value=None)
    manager = InstallationSystemManager()

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(MODEL_URL, manager)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))
        print(progress_updates[-1])

    assert progress_updates[0]['status'] == 'DOWNLOADING'
    assert progress_updates[-2]["status"] == 'INSTALLING'
    assert progress_updates[-1]['status'] == 'DONE'
    assert all(p['progress'] >= 0 and p['progress']
               <= 100 for p in progress_updates)

    assert mock_mlc.call_count == 1

    # Check that the files were downloaded
    download_path = get_app_data_path() / "models" / progress_updates[0]["id"]
    assert (download_path / "base" / "pytorch_model.bin").exists()
    assert (download_path / "base" / "config.json").exists()
