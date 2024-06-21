import asyncio
import pytest
from unittest import mock
from unittest.mock import MagicMock
import json
from pathlib import Path
from state import global_state_manager
from endpoints.model.install.install import (
    install_generator,
    get_hf_name_for_url,
    get_files_to_download,
    download_file,
    get_file_size_hf,
    get_hf_repo_info,
)
from truffle_types import FileInfo, Quantization
from tests.data import (
    ID,
    MODEL_URL,
    MOCK_API_RESPONSE,
    FILE_ONE_URL,
    FILE_TWO_URL,
    FILE_THREE_URL,
    FILE_FOUR_URL,
    MOCK_FILE_ONE_DATA,
    MOCK_FILE_TWO_DATA,
    MOCK_FILE_THREE_DATA,
    MOCK_FILE_FOUR_DATA,
    HF_API_URL,
)

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


# Helpers
def write_full_dir(path):
    path.mkdir(parents=True, exist_ok=True)
    with open(path / "pytorch_model.bin", "wb") as f:
        f.write(MOCK_FILE_ONE_DATA)
    with open(path / "config.json", "wb") as f:
        f.write(MOCK_FILE_TWO_DATA)
    onnx_dir = path / "onnx"
    onnx_dir.mkdir(parents=True, exist_ok=True)
    with open(path / "onnx/onnx_model.onnx", "wb") as f:
        f.write(MOCK_FILE_THREE_DATA)
    tf_dir = path / "tf_model"
    tf_dir.mkdir(parents=True, exist_ok=True)
    with open(path / "tf_model/tf_model.pb", "wb") as f:
        f.write(MOCK_FILE_FOUR_DATA)


def write_partial_dir(path):
    path.mkdir(parents=True, exist_ok=True)
    with open(path / "pytorch_model.bin", "wb") as f:
        f.write(MOCK_FILE_ONE_DATA)


# Fixtures
@pytest.fixture(autouse=True)
def mock_mlc(mocker):
    module = "endpoints.model.install.install"

    mocker.patch(
        f"{module}.detect_model_type",
        return_value=MagicMock(
            quantize={
                "no-quant": "",
                "group-quant": "",
                "ft-quant": "",
                "awq": "",
                "per-tensor-quant": "",
            }
        ),
    )
    mocker.patch(
        "state.ModelManager.detect_model_type",
        return_value=MagicMock(
            quantize={
                "no-quant": "",
                "group-quant": "",
                "ft-quant": "",
                "awq": "",
                "per-tensor-quant": "",
            }
        ),
    )
    mocker.patch(f"{module}.detect_config", return_value=MagicMock())
    mocker.patch("state.ModelManager.detect_config", return_value=MagicMock())
    mocker.patch(f"{module}.detect_weight", return_value=(MagicMock(), MagicMock()))
    mocker.patch(f"{module}.detect_device", return_value=MagicMock())
    mocker.patch(f"{module}.detect_target_and_host", return_value=(MagicMock(), MagicMock()))
    convert_weight = mocker.patch(f"{module}.convert_weight", return_value=MagicMock())
    compile = mocker.patch(f"{module}.compile", return_value=MagicMock())
    gen_config = mocker.patch(f"{module}.gen_config", return_value=MagicMock())

    mocker.patch("json.load", return_value={})

    yield convert_weight, compile, gen_config


@pytest.fixture(autouse=True)
def mock_quant_decision(mocker):
    mocker.patch("state.ModelManager.get_app_data_path", return_value=Path("/tmp"))
    mocker.patch(
        "state.ModelManager.ModelManager.get_expected_memory_consumption", return_value=1000
    )
    mocker.patch("state.ModelManager.ModelManager.get_expected_disk_consumption", return_value=1000)
    quant_decision = mocker.patch(
        "endpoints.model.install.install.global_state_manager.model_manager.get_adaptive_quantization_decision",
        side_effect=global_state_manager.model_manager.get_adaptive_quantization_decision,
    )
    yield quant_decision


@pytest.fixture(autouse=True)
def mock_utils(mocker):
    mocker.patch("endpoints.model.install.install.get_tensor_parallelism", return_value=1)
    mocker.patch("state.ModelManager.get_usable_memory", return_value=8192)
    mocker.patch("endpoints.model.install.install.get_usable_memory", return_value=8192)


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
# - Returns error if there is not enough space or memory to convert and quantize
# - Completion of conversion and quantization returns status transition
# - Gets correct HF name given a URL
# - Correctly selects proper files to download given local and remote file lists


# Tests
@pytest.mark.asyncio
async def test_install_single_model_from_scratch(session_fixture, mock_mlc, mocker):
    # Mocks
    session_fixture("endpoints.model.install.install")
    mock_get_file_sizes = mocker.patch(
        "endpoints.model.install.install.get_file_size_hf",
        side_effect=get_file_size_hf,
    )
    mock_get_hf_repo_info = mocker.patch(
        "endpoints.model.install.install.get_hf_repo_info",
        side_effect=get_hf_repo_info,
    )

    # Test
    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert progress_updates[0]["status"] == "ACKNOWLEDGED"
    assert progress_updates[1]["status"] == "DOWNLOADING"
    assert progress_updates[-2]["status"] == "INSTALLING"
    assert progress_updates[-1]["status"] == "STOPPED"
    assert all(p["progress"] >= 0 and p["progress"] <= 100 for p in progress_updates)

    assert mock_mlc[0].call_count == 1
    assert mock_mlc[1].call_count == 1
    assert mock_mlc[2].call_count == 1

    # Check that the files were downloaded
    download_path = Path("/tmp") / "models" / progress_updates[0]["id"]
    assert (download_path / "base" / "pytorch_model.bin").exists()
    assert (download_path / "base" / "config.json").exists()
    assert (download_path / "base" / "tf_model" / "tf_model.pb").exists()

    # Check that queue is empty
    assert len(global_state_manager.model_manager.conversion_queue) == 0

    # Assert that functions were called with the correct arguments
    mock_get_file_sizes.assert_called_with(MODEL_URL, mock.ANY)
    mock_get_hf_repo_info.assert_called_with("openai-community/gpt2")


@pytest.mark.asyncio
async def test_complete_partial_installation_of_single_model(
    session_fixture,
    mock_mlc,
    mocker,
):
    # Mocks
    session_fixture("endpoints.model.install.install")
    mock_download_file = mocker.patch(
        "endpoints.model.install.install.download_file", side_effect=download_file
    )

    # Write one of the files to simulate a partial download
    download_path = Path("/tmp") / "models" / ID / "base"
    write_partial_dir(download_path)

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert mock_download_file.call_count == 2
    assert mock_mlc[0].call_count == 1
    assert mock_mlc[1].call_count == 1
    assert mock_mlc[2].call_count == 1

    # Assert acknowledgement event was sent
    assert progress_updates[0]["status"] == "ACKNOWLEDGED"

    # Check that the files were downloaded
    download_path = Path("/tmp") / "models" / progress_updates[0]["id"]
    assert (download_path / "base" / "pytorch_model.bin").exists()
    assert (download_path / "base" / "config.json").exists()

    # Check that queue is empty
    assert len(global_state_manager.model_manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_skip_download_of_already_downloaded_model(
    session_fixture,
    mock_mlc,
    mocker,
):
    # Mocks
    session_fixture("endpoints.model.install.install")
    mock_download_file = mocker.patch(
        "endpoints.model.install.install.download_file", side_effect=download_file
    )

    # Write all files to simulate a complete download
    download_path = Path("/tmp") / "models" / ID / "base"
    write_full_dir(download_path)

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert mock_download_file.call_count == 0
    assert mock_mlc[0].call_count == 1
    assert mock_mlc[1].call_count == 1
    assert mock_mlc[2].call_count == 1

    # Assert acknowledgement event was sent
    assert progress_updates[0]["status"] == "ACKNOWLEDGED"

    # Check that the files were downloaded
    download_path = Path("/tmp") / "models" / progress_updates[0]["id"]
    assert (download_path / "base" / "pytorch_model.bin").exists()
    assert (download_path / "base" / "config.json").exists()
    assert (download_path / "base" / "onnx" / "onnx_model.onnx").exists()
    assert (download_path / "base" / "tf_model" / "tf_model.pb").exists()

    # Check that queue is empty
    assert len(global_state_manager.model_manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_model_download_returns_progress_in_expected_format(session_fixture, mocker):
    # Mocks
    session_fixture("endpoints.model.install.install")

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert all(p.keys() == schema["properties"].keys() for p in progress_updates)
    assert all(p["progress"] >= 0 and p["progress"] <= 100 for p in progress_updates)
    assert len(progress_updates) > 3
    assert progress_updates[1]["progress"] >= 0 and progress_updates[1]["progress"] <= 100

    # Assert that acknowledgement event was sent
    assert progress_updates[0]["status"] == "ACKNOWLEDGED"

    # Check that queue is empty
    assert len(global_state_manager.model_manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_returns_error_if_not_enough_space_to_download_single_model(
    session_fixture,
    mocker,
):
    # Mocks
    session_fixture("endpoints.model.install.install")
    mocker.patch("psutil.disk_usage", return_value=MagicMock(total=1024, used=1024, free=0))

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert progress_updates[-1]["status"] == "DOWNLOADING"
    assert progress_updates[-1]["error"] == "Not enough space"

    # Assert that acknowledgement event was sent
    assert progress_updates[0]["status"] == "ACKNOWLEDGED"

    # Check that queue is empty
    assert len(global_state_manager.model_manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_returns_error_if_not_enough_space_to_download_with_model_in_progress(
    session_fixture,
    mocker,
):
    # Mocks
    session_fixture("endpoints.model.install.install")

    global_state_manager.model_manager.set_download("000", 1024)
    mocker.patch("psutil.disk_usage", return_value=MagicMock(total=1024, used=0, free=1024))

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert progress_updates[0]["status"] == "ACKNOWLEDGED"
    assert progress_updates[-1]["status"] == "DOWNLOADING"
    assert progress_updates[-1]["error"] == "Not enough space"

    # Check that queue is empty
    assert len(global_state_manager.model_manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_only_converts_and_quantizes_single_model_at_a_time(
    session_fixture,
    mock_mlc,
    mocker,
):
    # Mocks
    session_fixture("endpoints.model.install.install")

    global_state_manager.model_manager.conversion_in_progress = True
    global_state_manager.model_manager.current_conversion = {
        "model_path": "000",
        "quantization": "INT4",
        "compressed_size": 1024,
    }

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

        # When status switches to installing, check that the conversion is in the queue
        if progress_updates[-1]["status"] == "INSTALLING":
            assert (
                global_state_manager.model_manager.conversion_queue[0]["model_path"]
                == Path("/tmp") / "models" / ID
            )

            # Wait 5 seconds and check that conversion is still in the queue
            await asyncio.sleep(5)

            assert (
                global_state_manager.model_manager.conversion_queue[0]["model_path"]
                == Path("/tmp") / "models" / ID
            )

            # Clear current conversion
            global_state_manager.model_manager.complete_conversion()

    assert progress_updates[0]["status"] == "ACKNOWLEDGED"
    assert progress_updates[1]["status"] == "DOWNLOADING"
    assert progress_updates[-1]["status"] == "STOPPED"
    assert mock_mlc[0].call_count == 1
    assert mock_mlc[1].call_count == 1
    assert mock_mlc[2].call_count == 1

    # Check that queue is empty
    assert len(global_state_manager.model_manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_skips_conversion_and_quantization_of_already_converted_model(
    session_fixture,
    mock_mlc,
    mocker,
):
    # Mocks
    session_fixture("endpoints.model.install.install")
    mocker.patch("endpoints.model.install.install.does_quantization_exist", return_value=True)

    # Write all files to simulate a complete download
    download_path = Path("/tmp") / "models" / ID / "base"

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

    assert progress_updates[0]["status"] == "ACKNOWLEDGED"
    assert progress_updates[-1]["status"] == "STOPPED"
    # Conversion and quantization should be skipped
    assert mock_mlc[0].call_count == 0
    assert mock_mlc[1].call_count == 0
    assert mock_mlc[2].call_count == 0

    # Check that queue is empty
    assert len(global_state_manager.model_manager.conversion_queue) == 0


@pytest.mark.asyncio
async def test_returns_error_if_not_enough_space_to_convert_and_quantize(
    session_fixture,
    mock_mlc,
    mocker,
):
    # Mocks
    session_fixture("endpoints.model.install.install")

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

        if progress_updates[-1]["status"] == "INSTALLING":
            # Mock the disk usage function to return a value that is less than the size of the model
            mocker.patch(
                "psutil.disk_usage",
                return_value=MagicMock(total=1024, used=0, free=0),
            )

    assert progress_updates[-1]["error"] == "Not enough space"

    # Assert that acknowledgement event was sent
    assert progress_updates[0]["status"] == "ACKNOWLEDGED"

    # Check that queue is empty
    assert len(global_state_manager.model_manager.conversion_queue) == 0

    assert mock_mlc[0].call_count == 0
    assert mock_mlc[1].call_count == 0
    assert mock_mlc[2].call_count == 0


@pytest.mark.asyncio
async def test_returns_error_if_not_enough_memory_to_convert_and_quantize(
    session_fixture,
    mock_mlc,
    mocker,
):
    # Mocks
    session_fixture("endpoints.model.install.install")

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

        if progress_updates[-1]["status"] == "INSTALLING":
            # Mock the available RAM information to be less than the required amount
            mocker.patch("state.ModelManager.get_usable_memory", return_value=0)
            mocker.patch("endpoints.model.install.install.get_usable_memory", return_value=0)

    assert progress_updates[-1]["error"] == "Not enough memory"

    # Assert that acknowledgement event was sent
    assert progress_updates[0]["status"] == "ACKNOWLEDGED"

    # Check that queue is empty
    assert len(global_state_manager.model_manager.conversion_queue) == 0

    assert mock_mlc[0].call_count == 0
    assert mock_mlc[1].call_count == 0
    assert mock_mlc[2].call_count == 0


@pytest.mark.asyncio
async def test_completion_of_conversion_and_quantization_returns_status_transition(
    session_fixture,
    mock_mlc,
    mocker,
):
    # Mocks
    session_fixture("endpoints.model.install.install")

    # Prepare JSON streaming responses as they would be sent from the generator
    progress_stream = install_generator(ID, MODEL_URL)

    # Collect all progress updates
    progress_updates = []
    async for progress in progress_stream:
        progress_updates.append(json.loads(progress[5:]))

        if progress_updates[-1]["status"] == "INSTALLING":
            # Complete conversion and quantization
            global_state_manager.model_manager.complete_conversion()

    assert progress_updates[0]["status"] == "ACKNOWLEDGED"
    assert progress_updates[-1]["status"] == "STOPPED"

    # Check that queue is empty
    assert len(global_state_manager.model_manager.conversion_queue) == 0


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


@pytest.mark.asyncio
async def test_correctly_selects_proper_files_to_download_given_local_and_remote_file_lists(
    mocker,
):
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
        mocker.patch("endpoints.model.install.install.get_repo_info", return_value=case["remote"])
        mocker.patch(
            "endpoints.model.install.install.get_local_files",
            return_value=case["local"],
        )
        assert await get_files_to_download(case["remote"], case["local"]) == expected_outcome


# TODO: Fix this test
# @ pytest.mark.asyncio
# async def test_hf_repo_files():
#     files = await get_hf_repo_info("1")
#     assert any(file.file.endswith("bin") for file in files)
#     assert not any(file.file.endswith("tflite") for file in files)
#     assert not any(file.file.endswith("msgpack") for file in files)
#     assert not any(file.file.endswith("bin") for file in files)
#     assert not any(file.file.endswith("h5") for file in files)
#     assert not any(file.file.startswith("onnx") for file in files)

#     files = await get_hf_repo_info("2")
#     assert any(file.file.endswith("safetensors") for file in files)
#     assert not any(file.file.endswith("consolidated.safetensors")
#                    for file in files)
