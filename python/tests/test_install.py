import os
import asyncio
import pytest
import aiohttp
from unittest.mock import Mock, patch, AsyncMock, MagicMock
import json
import shutil
from python.endpoints.model.install import install_generator, InstallationSystemManager
from python.endpoints.model.install.install import download_file
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
ID = "123456"
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
MOCK_FILE_ONE_DATA = os.urandom(1024)
MOCK_FILE_TWO_DATA = os.urandom(1024)


def clear_path(path):
    shutil.rmtree(path)


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

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
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

    clear_path(download_path)


@pytest.mark.asyncio
async def test_complete_partial_installation_of_single_model(mock_aiohttp_get, mock_aiohttp_head, mock_response, mock_headers, mocker):
    # Setup mock behavior for download tasks in install_generator
    mock_aiohttp_get.return_value.__aenter__.return_value = await mock_response(MOCK_API_RESPONSE)
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024})

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "python.endpoints.model.install.install.convert_and_quantize", return_value=None)
    manager = InstallationSystemManager()

    # Write one of the files to simulate a partial download
    download_path = get_app_data_path() / "models" / ID / "base"
    download_path.mkdir(parents=True, exist_ok=True)
    with open(download_path / "pytorch_model.bin", "wb") as f:
        f.write(MOCK_FILE_ONE_DATA)

    with patch("python.endpoints.model.install.install.download_file") as mock_download_file:
        mock_download_file.side_effect = download_file

        # Prepare JSON streaming responses as they would be sent from the generator
        progress_stream = install_generator(MODEL_URL, manager)

        # Collect all progress updates
        progress_updates = []
        async for progress in progress_stream:
            progress_updates.append(json.loads(progress[5:]))

        assert mock_download_file.call_count == 1

        # Check that the files were downloaded
        download_path = get_app_data_path() / "models" / \
            progress_updates[0]["id"]
        assert (download_path / "base" / "pytorch_model.bin").exists()
        assert (download_path / "base" / "config.json").exists()

    clear_path(download_path)


@pytest.mark.asyncio
async def test_skip_download_of_already_downloaded_model(mock_aiohttp_get, mock_aiohttp_head, mock_response, mock_headers, mocker):
    # Setup mock behavior for download tasks in install_generator
    mock_aiohttp_get.return_value.__aenter__.return_value = await mock_response(MOCK_API_RESPONSE)
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024})

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "python.endpoints.model.install.install.convert_and_quantize", return_value=None)
    manager = InstallationSystemManager()

    # Write both files to simulate a complete download
    download_path = get_app_data_path() / "models" / ID / "base"
    download_path.mkdir(parents=True, exist_ok=True)
    with open(download_path / "pytorch_model.bin", "wb") as f:
        f.write(MOCK_FILE_ONE_DATA)
    with open(download_path / "config.json", "wb") as f:
        f.write(MOCK_FILE_TWO_DATA)

    with patch("python.endpoints.model.install.install.download_file") as mock_download_file:
        mock_download_file.side_effect = download_file

        # Prepare JSON streaming responses as they would be sent from the generator
        progress_stream = install_generator(MODEL_URL, manager)

        # Collect all progress updates
        progress_updates = []
        async for progress in progress_stream:
            progress_updates.append(json.loads(progress[5:]))

        assert mock_download_file.call_count == 0

        # Check that the files were downloaded
        download_path = get_app_data_path() / "models" / \
            progress_updates[0]["id"]
        assert (download_path / "base" / "pytorch_model.bin").exists()
        assert (download_path / "base" / "config.json").exists()

    clear_path(download_path)


@pytest.mark.asyncio
async def test_model_download_returns_progress_in_expected_format(mock_aiohttp_get, mock_aiohttp_head, mock_response, mock_headers, mocker):
    # Setup mock behavior for download tasks in install_generator
    mock_aiohttp_get.return_value.__aenter__.return_value = await mock_response(MOCK_API_RESPONSE)
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024})

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "python.endpoints.model.install.install.convert_and_quantize", return_value=None)
    manager = InstallationSystemManager()

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(MODEL_URL, manager)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert all(p.keys() == schema["properties"].keys()
               for p in progress_updates)

    clear_path(get_app_data_path() / "models" / progress_updates[0]["id"])
