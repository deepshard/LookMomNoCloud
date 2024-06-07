import os
import asyncio
import pytest
from uuid import uuid4
from unittest import mock
from unittest.mock import patch, MagicMock
import json
import shutil
from pathlib import Path
from aioresponses import aioresponses
from endpoints.model.install.install import (
    install_generator,
    InstallationManager,
    get_hf_name_for_url,
    get_files_to_download,
    download_file,
    get_file_size_hf,
    get_hf_repo_info,
)
from truffle_types import FileInfo, Quantization

schema = {
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "status": {
            "type": "string",
            "enum": ["ACKNOWLEDGED", "DOWNLOADING", "INSTALLING", "STOPPED"],
        },
        "progress": {"type": "integer"},
        "error": {"type": "string"},
    },
}


# Test the install endpoint logic
# Cases:
# - Install single model from scratch
# - Complete partial installation of single model
# - Skip download of already downloaded model
# - Model download returns progress in expected format
# - Returns error if there is not enough space to download (single model)
# - Returns error if there is not enough space to download (with a model already in progress)
# - Only converts and quantizes a single model at a time
# - Skips conversion and quantization of already converted model
# - Returns error if model weights are not in the expected format
# - Returns error if there is not enough space or memory to convert and quantize
# - Completion of conversion and quantization returns status transition
# - Gets correct HF name given a URL
# - Correctly selects proper files to download given local and remote file lists


# Mock constants
ID = str(uuid4())
MODEL_URL = "https://huggingface.co/meta-llama/Meta-Llama-3-8B"
HF_API_URL = "https://huggingface.co/api/models/meta-llama/Meta-Llama-3-8B?"
FILE_ONE_URL = (
    "https://huggingface.co/meta-llama/Meta-Llama-3-8B/resolve/main/pytorch_model.bin"
)
FILE_TWO_URL = (
    "https://huggingface.co/meta-llama/Meta-Llama-3-8B/resolve/main/config.json"
)
FILE_THREE_URL = "https://huggingface.co/meta-llama/Meta-Llama-3-8B/resolve/main/onnx/onnx_model.onnx"
FILE_FOUR_URL = "https://huggingface.co/meta-llama/Meta-Llama-3-8B/resolve/main/tf_model/tf_model.pb"
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
MOCK_FILE_ONE_DATA = os.urandom(1024)
MOCK_FILE_TWO_DATA = os.urandom(1024)
MOCK_FILE_THREE_DATA = os.urandom(1024)
MOCK_FILE_FOUR_DATA = os.urandom(1024)


# Helpers
def clear_path():
    if os.path.exists("/tmp/models"):
        shutil.rmtree("/tmp/models")


# Fixtures
@pytest.fixture
def app_data_path_mock():
    with patch(
        "endpoints.model.install.install.get_app_data_path"
    ) as mock_app_data_path:
        mock_app_data_path.return_value = Path("/tmp")
        yield mock_app_data_path


@pytest.fixture
def standard_aiohttp_get_mocks():
    with aioresponses() as mocked:
        mocked.get(HF_API_URL, status=200, payload=MOCK_API_RESPONSE)
        mocked.get(FILE_ONE_URL, status=200, body=MOCK_FILE_ONE_DATA)
        mocked.get(FILE_TWO_URL, status=200, body=MOCK_FILE_TWO_DATA)
        mocked.get(FILE_THREE_URL, status=200, body=MOCK_FILE_THREE_DATA)
        mocked.get(FILE_FOUR_URL, status=200, body=MOCK_FILE_FOUR_DATA)
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
async def test_install_single_model_from_scratch(
    app_data_path_mock,
    standard_aiohttp_get_mocks,
    mock_aiohttp_head,
    mock_headers,
    mocker,
):
    clear_path()

    # Mocks setup
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "endpoints.model.install.install.convert_quantize_compile", return_value=None
    )
    mock_get_file_sizes = mocker.patch(
        "endpoints.model.install.install.get_file_size_hf"
    )
    mock_get_file_sizes.side_effect = get_file_size_hf
    mock_get_hf_repo_info = mocker.patch(
        "endpoints.model.install.install.get_hf_repo_info"
    )
    mock_get_hf_repo_info.side_effect = get_hf_repo_info
    manager = InstallationManager()

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL, manager)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert progress_updates[0]["status"] == "ACKNOWLEDGED"
    assert progress_updates[1]["status"] == "DOWNLOADING"
    assert progress_updates[-2]["status"] == "INSTALLING"
    assert progress_updates[-1]["status"] == "STOPPED"
    assert all(p["progress"] >= 0 and p["progress"] <= 100 for p in progress_updates)

    assert mock_mlc.call_count == 1

    # Check that the files were downloaded
    download_path = Path("/tmp") / "models" / progress_updates[0]["id"]
    assert (download_path / "base" / "pytorch_model.bin").exists()
    assert (download_path / "base" / "config.json").exists()
    assert (download_path / "base" / "tf_model" / "tf_model.pb").exists()

    # Check that queue is empty
    assert len(manager.conversion_queue) == 0

    # Assert that functions were called with the correct arguments
    mock_get_file_sizes.assert_called_with(MODEL_URL, mock.ANY)
    mock_get_hf_repo_info.assert_called_with("meta-llama/Meta-Llama-3-8B")
    mock_mlc.assert_called_with(
        download_path / "base", download_path / "INT4", Quantization.INT4
    )


@pytest.mark.asyncio
async def test_complete_partial_installation_of_single_model(
    app_data_path_mock,
    standard_aiohttp_get_mocks,
    mock_aiohttp_head,
    mock_headers,
    mocker,
):
    clear_path()

    # Mocks setup
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "endpoints.model.install.install.convert_quantize_compile", return_value=None
    )
    manager = InstallationManager()

    # Write one of the files to simulate a partial download
    download_path = Path("/tmp") / "models" / ID / "base"
    download_path.mkdir(parents=True, exist_ok=True)
    with open(download_path / "pytorch_model.bin", "wb") as f:
        f.write(MOCK_FILE_ONE_DATA)

    # Create wrapper around download_file function so we can track how many times it was called
    with patch("endpoints.model.install.install.download_file") as mock_download_file:
        mock_download_file.side_effect = download_file

        # Prepare JSON streaming responses as they would be sent from the generator
        progress_stream = install_generator(ID, MODEL_URL, manager)

        # Collect all progress updates
        progress_updates = []
        async for progress in progress_stream:
            progress_updates.append(json.loads(progress[5:]))

        assert mock_download_file.call_count == 2

        # Assert acknowledgement event was sent
        assert progress_updates[0]["status"] == "ACKNOWLEDGED"

        # Check that the files were downloaded
        download_path = Path("/tmp") / "models" / progress_updates[0]["id"]
        assert (download_path / "base" / "pytorch_model.bin").exists()
        assert (download_path / "base" / "config.json").exists()

        # Check that queue is empty
        assert len(manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_skip_download_of_already_downloaded_model(
    app_data_path_mock,
    standard_aiohttp_get_mocks,
    mock_aiohttp_head,
    mock_headers,
    mocker,
):
    clear_path()

    # Mocks setup
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "endpoints.model.install.install.convert_quantize_compile", return_value=None
    )
    manager = InstallationManager()

    # Write all files to simulate a complete download
    download_path = Path("/tmp") / "models" / ID / "base"
    download_path.mkdir(parents=True, exist_ok=True)
    with open(download_path / "pytorch_model.bin", "wb") as f:
        f.write(MOCK_FILE_ONE_DATA)
    with open(download_path / "config.json", "wb") as f:
        f.write(MOCK_FILE_TWO_DATA)
    onnx_dir = download_path / "onnx"
    onnx_dir.mkdir(parents=True, exist_ok=True)
    with open(download_path / "onnx/onnx_model.onnx", "wb") as f:
        f.write(MOCK_FILE_THREE_DATA)
    tf_dir = download_path / "tf_model"
    tf_dir.mkdir(parents=True, exist_ok=True)
    with open(download_path / "tf_model/tf_model.pb", "wb") as f:
        f.write(MOCK_FILE_FOUR_DATA)

    # Create wrapper around download_file function so we can track how many times it was called
    with patch("endpoints.model.install.install.download_file") as mock_download_file:
        mock_download_file.side_effect = download_file

        # Prepare JSON streaming responses as they would be sent from the generator
        progress_stream = install_generator(ID, MODEL_URL, manager)

        # Collect all progress updates
        progress_updates = []
        async for progress in progress_stream:
            progress_updates.append(json.loads(progress[5:]))

        assert mock_download_file.call_count == 0

        # Assert acknowledgement event was sent
        assert progress_updates[0]["status"] == "ACKNOWLEDGED"

        # Check that the files were downloaded
        download_path = Path("/tmp") / "models" / progress_updates[0]["id"]
        assert (download_path / "base" / "pytorch_model.bin").exists()
        assert (download_path / "base" / "config.json").exists()
        assert (download_path / "base" / "onnx" / "onnx_model.onnx").exists()
        assert (download_path / "base" / "tf_model" / "tf_model.pb").exists()

        # Check that queue is empty
        assert len(manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_model_download_returns_progress_in_expected_format(
    app_data_path_mock, mock_aiohttp_head, mock_headers, mocker
):
    clear_path()

    with aioresponses() as mocked:
        # Setup mock behavior for download tasks in install_generator
        mocked.get(HF_API_URL, status=200, payload=MOCK_API_RESPONSE)
        mocked.get(FILE_ONE_URL, status=200, body=os.urandom(100000000))  # 100 MB
        mocked.get(FILE_TWO_URL, status=200, body=os.urandom(100000000))  # 100 MB
        mocked.get(FILE_THREE_URL, status=200, body=os.urandom(100000000))  # 100 MB
        mocked.get(FILE_FOUR_URL, status=200, body=os.urandom(100000000))
        mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
            {"Content-Length": 100000000}
        )

        # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
        mock_mlc = mocker.patch(
            "endpoints.model.install.install.convert_quantize_compile",
            return_value=None,
        )
        manager = InstallationManager()

        # Prepare JSON streaming responses as they would be sent from the generator
        progress_stream = install_generator(ID, MODEL_URL, manager)

        # Collect all progress updates
        progress_updates = []
        async for progress in progress_stream:
            progress_updates.append(json.loads(progress[5:]))

        assert all(p.keys() == schema["properties"].keys() for p in progress_updates)
        assert all(
            p["progress"] >= 0 and p["progress"] <= 100 for p in progress_updates
        )
        assert len(progress_updates) > 3
        assert (
            progress_updates[1]["progress"] >= 0
            and progress_updates[1]["progress"] <= 100
        )

        # Assert that acknowledgement event was sent
        assert progress_updates[0]["status"] == "ACKNOWLEDGED"

        # Check that queue is empty
        assert len(manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_returns_error_if_not_enough_space_to_download_single_model(
    app_data_path_mock,
    standard_aiohttp_get_mocks,
    mock_aiohttp_head,
    mock_headers,
    mocker,
):
    clear_path()

    # Mocks setup
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "endpoints.model.install.install.convert_quantize_compile", return_value=None
    )
    manager = InstallationManager()

    # Mock the disk usage function to return a value that is less than the size of the model
    mocker.patch(
        "psutil.disk_usage", return_value=MagicMock(total=1024, used=1024, free=0)
    )

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL, manager)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert progress_updates[-1]["status"] == "DOWNLOADING"
    assert progress_updates[-1]["error"] == "Not enough space to download the model"

    # Assert that acknowledgement event was sent
    assert progress_updates[0]["status"] == "ACKNOWLEDGED"

    # Check that queue is empty
    assert len(manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_returns_error_if_not_enough_space_to_download_with_model_in_progress(
    app_data_path_mock,
    standard_aiohttp_get_mocks,
    mock_aiohttp_head,
    mock_headers,
    mocker,
):
    clear_path()

    # Mocks setup
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "endpoints.model.install.install.convert_quantize_compile", return_value=None
    )

    # Mock manager to return bytes remaining for a model in progress
    manager = InstallationManager()
    manager.set_download("000", 1024)

    # Mock the disk usage function to return a value that is less than the size of the model
    mocker.patch(
        "psutil.disk_usage", return_value=MagicMock(total=1024, used=0, free=1024)
    )

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL, manager)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert progress_updates[0]["status"] == "ACKNOWLEDGED"
    assert progress_updates[-1]["status"] == "DOWNLOADING"
    assert progress_updates[-1]["error"] == "Not enough space to download the model"

    # Check that queue is empty
    assert len(manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_only_converts_and_quantizes_single_model_at_a_time(
    app_data_path_mock,
    standard_aiohttp_get_mocks,
    mock_aiohttp_head,
    mock_headers,
    mocker,
):
    clear_path()

    # Mocks setup
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "endpoints.model.install.install.convert_quantize_compile", return_value=None
    )
    manager = InstallationManager()

    # Mock a conversion in progress
    manager.conversion_in_progress = True
    manager.current_conversion = {
        "model_path": "000",
        "quantization": "INT4",
        "compressed_size": 1024,
    }

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL, manager)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

        # When status switches to installing, check that the conversion is in the queue
        if progress_updates[-1]["status"] == "INSTALLING":
            assert (
                manager.conversion_queue[0]["model_path"]
                == Path("/tmp") / "models" / ID
            )

            # Wait 5 seconds and check that conversion is still in the queue
            await asyncio.sleep(5)

            assert (
                manager.conversion_queue[0]["model_path"]
                == Path("/tmp") / "models" / ID
            )

            # Clear current conversion
            manager.complete_conversion()

    assert progress_updates[0]["status"] == "ACKNOWLEDGED"
    assert progress_updates[1]["status"] == "DOWNLOADING"
    assert progress_updates[-1]["status"] == "STOPPED"
    assert mock_mlc.call_count == 1

    # Check that queue is empty
    assert len(manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_skips_conversion_and_quantization_of_already_converted_model(
    app_data_path_mock,
    standard_aiohttp_get_mocks,
    mock_aiohttp_head,
    mock_headers,
    mocker,
):
    clear_path()

    # Mocks setup
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    mocker.patch(
        "endpoints.model.install.install.does_quantization_exist", return_value=True
    )

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "endpoints.model.install.install.convert_quantize_compile", return_value=None
    )
    manager = InstallationManager()

    # Write all files to simulate a complete download
    download_path = Path("/tmp") / "models" / ID / "base"
    download_path.mkdir(parents=True, exist_ok=True)
    with open(download_path / "pytorch_model.bin", "wb") as f:
        f.write(MOCK_FILE_ONE_DATA)
    with open(download_path / "config.json", "wb") as f:
        f.write(MOCK_FILE_TWO_DATA)
    onnx_dir = download_path / "onnx"
    onnx_dir.mkdir(parents=True, exist_ok=True)
    with open(download_path / "onnx/onnx_model.onnx", "wb") as f:
        f.write(MOCK_FILE_THREE_DATA)
    tf_dir = download_path / "tf_model"
    tf_dir.mkdir(parents=True, exist_ok=True)
    with open(download_path / "tf_model/tf_model.pb", "wb") as f:
        f.write(MOCK_FILE_FOUR_DATA)

    # Create a non-empty INT4 quantization directory
    quantization_dir = Path("/tmp") / "models" / ID / "INT4"
    quantization_dir.mkdir(parents=True, exist_ok=True)
    with open(quantization_dir / "pytorch_model.bin", "wb") as f:
        f.write(MOCK_FILE_ONE_DATA)

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL, manager)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert progress_updates[0]["status"] == "ACKNOWLEDGED"
    assert progress_updates[-1]["status"] == "STOPPED"
    assert mock_mlc.call_count == 0  # Conversion and quantization should be skipped

    # Check that queue is empty
    assert len(manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_returns_error_if_model_weights_are_not_in_expected_format(
    app_data_path_mock, mock_aiohttp_head, mock_headers, mocker
):
    clear_path()

    with aioresponses() as mocked:
        # Setup mock behavior for download tasks in install_generator
        # Change API response to not have the correct pytorch_model.bin file
        API_RESPONSE = {
            "siblings": [
                {
                    "rfilename": "config.json",
                },
            ]
        }
        mocked.get(HF_API_URL, status=200, payload=API_RESPONSE)
        mocked.get(FILE_TWO_URL, status=200, body=MOCK_FILE_TWO_DATA)
        mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
            {"Content-Length": 1024}
        )

        # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
        mock_mlc = mocker.patch(
            "endpoints.model.install.install.convert_quantize_compile",
            return_value=None,
        )
        manager = InstallationManager()

        # Write the file to simulate a complete download
        download_path = Path("/tmp") / "models" / ID / "base"
        download_path.mkdir(parents=True, exist_ok=True)
        with open(download_path / "config.json", "wb") as f:
            f.write(MOCK_FILE_TWO_DATA)

        # Prepare JSON streaming responses as they would be sent from the generator
        progress_stream = install_generator(ID, MODEL_URL, manager)

        # Collect all progress updates
        progress_updates = []
        async for progress in progress_stream:
            progress_updates.append(json.loads(progress[5:]))

        assert (
            progress_updates[-1]["error"]
            == f"Unsupported model format for {download_path}"
        )

        # Assert that acknowledgement event was sent
        assert progress_updates[0]["status"] == "ACKNOWLEDGED"

        # Check that queue is empty
        assert len(manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_returns_error_if_not_enough_space_to_convert_and_quantize(
    app_data_path_mock,
    standard_aiohttp_get_mocks,
    mock_aiohttp_head,
    mock_headers,
    mocker,
):
    clear_path()

    # Mocks setup
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "endpoints.model.install.install.convert_quantize_compile", return_value=None
    )
    manager = InstallationManager()

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL, manager)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

        if progress_updates[-1]["status"] == "INSTALLING":
            # Mock the disk usage function to return a value that is less than the size of the model
            mocker.patch(
                "psutil.disk_usage", return_value=MagicMock(total=1024, used=0, free=0)
            )

    assert (
        progress_updates[-1]["error"]
        == "Not enough space or memory to convert and quantize the model"
    )

    # Assert that acknowledgement event was sent
    assert progress_updates[0]["status"] == "ACKNOWLEDGED"

    # Check that queue is empty
    assert len(manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_returns_error_if_not_enough_memory_to_convert_and_quantize(
    app_data_path_mock,
    standard_aiohttp_get_mocks,
    mock_aiohttp_head,
    mock_headers,
    mocker,
):
    clear_path()

    # Mocks setup
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "endpoints.model.install.install.convert_quantize_compile", return_value=None
    )
    manager = InstallationManager()

    # Mock the disk usage function to return a value that is less than the size of the model
    mocker.patch(
        "psutil.virtual_memory",
        return_value=MagicMock(total=1024, used=1024, available=0),
    )

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL, manager)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert (
        progress_updates[-1]["error"]
        == "Not enough space or memory to convert and quantize the model"
    )

    # Assert that acknowledgement event was sent
    assert progress_updates[0]["status"] == "ACKNOWLEDGED"

    # Check that queue is empty
    assert len(manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_completion_of_conversion_and_quantization_returns_status_transition(
    app_data_path_mock,
    standard_aiohttp_get_mocks,
    mock_aiohttp_head,
    mock_headers,
    mocker,
):
    clear_path()

    # Mocks setup
    mock_aiohttp_head.return_value.__aenter__.return_value = await mock_headers(
        {"Content-Length": 1024}
    )

    # It is relatively safe to mock this because it is exclusively a wrapper around calls to external libraries
    mock_mlc = mocker.patch(
        "endpoints.model.install.install.convert_quantize_compile", return_value=None
    )
    manager = InstallationManager()

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL, manager)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

        if progress_updates[-1]["status"] == "INSTALLING":
            # Complete conversion and quantization
            manager.complete_conversion()

    assert progress_updates[0]["status"] == "ACKNOWLEDGED"
    assert progress_updates[-1]["status"] == "STOPPED"

    # Check that queue is empty
    assert len(manager.conversion_queue) == 0


def test_get_hf_name_for_url():
    urls = [
        "https://huggingface.co/meta-llama/Meta-Llama-3-8B",
        "https://huggingface.co/openbmb/MiniCPM-Llama3-V-2_5",
        "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0",
    ]
    expected_names = [
        "meta-llama/Meta-Llama-3-8B",
        "openbmb/MiniCPM-Llama3-V-2_5",
        "stabilityai/stable-diffusion-xl-base-1.0",
    ]

    for url, expected_name in zip(urls, expected_names):
        assert get_hf_name_for_url(url) == expected_name


def test_correctly_selects_proper_files_to_download_given_local_and_remote_file_lists():
    cases = [
        {
            "remote": [
                FileInfo("pytorch_model.bin", 1024),
                FileInfo("config.json", 1024),
            ],
            "local": [
                FileInfo("pytorch_model.bin", 1024),
                FileInfo("config.json", 1024),
            ],
        },
        {
            "remote": [
                FileInfo("pytorch_model.bin", 1024),
                FileInfo("config.json", 1024),
            ],
            "local": [
                FileInfo("pytorch_model.bin", 1024),
            ],
        },
        {
            "remote": [
                FileInfo("pytorch_model.bin", 1024),
                FileInfo("config.json", 1024),
            ],
            "local": [
                FileInfo("pytorch_model.bin", 1024),
                FileInfo("config.json", 512),
            ],
        },
        {
            "remote": [
                FileInfo("pytorch_model.bin", 1024),
                FileInfo("config.json", 1024),
            ],
            "local": [],
        },
        {
            "remote": [
                FileInfo("pytorch_model.bin", 1024),
                FileInfo("config.json", 1024),
                FileInfo("onnx/onnx_model.onnx", 1024),
                FileInfo("tf_model/tf_model.pb", 1024),
            ],
            "local": [
                FileInfo("pytorch_model.bin", 1024),
                FileInfo("config.json", 1024),
            ],
        },
        {
            "remote": [
                FileInfo("pytorch_model.bin", 1024),
                FileInfo("config.json", 1024),
                FileInfo("onnx/onnx_model.onnx", 1024),
                FileInfo("tf_model/tf_model.pb", 1024),
            ],
            "local": [
                FileInfo("pytorch_model.bin", 1024),
                FileInfo("config.json", 1024),
                FileInfo("onnx/onnx_model.onnx", 1024),
                FileInfo("tf_model/tf_model.pb", 1024),
            ],
        },
        {
            "remote": [
                FileInfo("pytorch_model.bin", 1024),
                FileInfo("config.json", 1024),
                FileInfo("onnx/onnx_model.onnx", 1024),
                FileInfo("tf_model/tf_model.pb", 1024),
            ],
            "local": [],
        },
    ]
    expected_outcomes = [
        [],
        [FileInfo("config.json", 1024)],
        [FileInfo("config.json", 1024)],
        [FileInfo("pytorch_model.bin", 1024), FileInfo("config.json", 1024)],
        [
            FileInfo("onnx/onnx_model.onnx", 1024),
            FileInfo("tf_model/tf_model.pb", 1024),
        ],
        [],
        [
            FileInfo("pytorch_model.bin", 1024),
            FileInfo("config.json", 1024),
            FileInfo("onnx/onnx_model.onnx", 1024),
            FileInfo("tf_model/tf_model.pb", 1024),
        ],
    ]

    for case, expected_outcome in zip(cases, expected_outcomes):
        assert get_files_to_download(case["remote"], case["local"]) == expected_outcome


@pytest.mark.asyncio
async def test_hf_repo_files():
    files = await get_hf_repo_info("mistralai/Codestral-22B-v0.1")
    assert any(file.file.endswith("safetensors") for file in files)
    assert not any(file.file.endswith("consolidated.safetensors") for file in files)

    files = await get_hf_repo_info("meta-llama/Meta-Llama-3-8B")
    assert any(file.file.endswith("safetensors") for file in files)
    assert not any(file.file.endswith(".pth") for file in files)

    files = await get_hf_repo_info("mistralai/Mixtral-8x7B-Instruct-v0.1")
    assert any(file.file.endswith("safetensors") for file in files)
    assert not any(file.file.endswith(".pt") for file in files)

    files = await get_hf_repo_info("openai-community/gpt2")
    assert any(file.file.endswith("safetensors") for file in files)
    assert not any(file.file.endswith("tflite") for file in files)
    assert not any(file.file.endswith("msgpack") for file in files)
    assert not any(file.file.endswith("bin") for file in files)
    assert not any(file.file.endswith("h5") for file in files)
    assert not any(file.file.startswith("onnx") for file in files)
