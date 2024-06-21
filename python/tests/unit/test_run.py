import os
import json
import pytest
from unittest.mock import MagicMock
from pathlib import Path
from state import global_state_manager
from endpoints.model.run.run import run_models_generator, get_instances
from models import RunningModel
from db import get_db_session
from tests.unit.data import ID, ID_2, MOCK_VALID_FILES

schema = {
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "status": {"type": "string"},
        "instance": {"type": "integer"},
        "port": {"type": "integer"},
        "error": {"type": "string"},
    },
}


# Helpers
def create_quants():
    for model_id in [ID, ID_2]:
        quant_path = Path("/tmp") / "models" / model_id / "q0f16"
        os.makedirs(quant_path, exist_ok=True)
        with open(quant_path / "mlc-chat-config.json", "wb") as f:
            f.write("test".encode("utf-8"))
        with open(quant_path / "ndarray-cache.json", "wb") as f:
            f.write("test".encode("utf-8"))
        with open(quant_path / "tokenizer_config.json", "wb") as f:
            f.write("test".encode("utf-8"))
        with open(quant_path / "tokenizer.json", "wb") as f:
            f.write("test".encode("utf-8"))
        with open(quant_path / "params_shard_0.bin", "wb") as f:
            f.write("test".encode("utf-8"))


# Test the run endpoint logic
# Cases:
# - Quantization does not exist
# - Quantization exists
# - Multiple models requested
# - There is already an instance running
# - Model is not in a convertable format
# - There is not enough space to convert all of the models
# - Not enough memory to quantize a model
# - Kills previous models if there is not enough memory for a new model
# - Gets instance count from DB


@pytest.fixture(autouse=True)
def utils_mock(mocker):
    mocker.patch("utils.get_app_data_path", return_value=Path("/tmp"))
    mocker.patch("endpoints.model.run.run.get_tensor_parallelism", return_value=1)
    mocker.patch("endpoints.model.run.run.is_server_running", return_value=True)
    mocker.patch("multiprocessing.Process", return_value=MagicMock(pid=1234))
    mocker.patch("state.ModelManager.get_usable_memory", return_value=8192)
    mocker.patch("endpoints.model.run.run.get_usable_memory", return_value=8192)


@pytest.fixture(autouse=True)
def mock_mlc(mocker):
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
    mocker.patch("state.ModelManager.detect_config", return_value=MagicMock())
    mocker.patch("endpoints.model.run.run.serve")

    def create_quants_wrapper(*args, **kwargs):
        create_quants()

    cqc = mocker.patch(
        "endpoints.model.run.run.convert_quantize_compile", side_effect=create_quants_wrapper
    )

    yield cqc


@pytest.fixture(autouse=True)
def mock_quant_decision(mocker):
    mocker.patch("state.ModelManager.get_app_data_path", return_value=Path("/tmp"))
    mocker.patch(
        "state.ModelManager.ModelManager.get_expected_memory_consumption", return_value=1000
    )
    mocker.patch("state.ModelManager.ModelManager.get_expected_disk_consumption", return_value=1000)
    quant_decision = mocker.patch(
        "endpoints.model.run.run.global_state_manager.model_manager.get_adaptive_quantization_decision",
        side_effect=global_state_manager.model_manager.get_adaptive_quantization_decision,
    )
    yield quant_decision


@pytest.fixture
def model_weights():
    for model_id in [ID, ID_2]:
        model_path = Path("/tmp") / "models" / model_id / "base"
        os.makedirs(model_path, exist_ok=True)
        for file in MOCK_VALID_FILES:
            with open(model_path / file["file"], "wb") as f:
                f.write(file["data"])


# Tests
@pytest.mark.asyncio
async def test_run_quantization_does_not_exist(session_fixture, mock_mlc, model_weights, mocker):
    # Mocks
    session_fixture("endpoints.model.run.run")

    # Prepare JSON streaming responses as they would be sent from the generator
    stream = run_models_generator([ID])

    # Collect the responses
    responses = []
    async for response in stream:
        responses.append(json.loads(response[5:]))

    # Check the responses
    assert mock_mlc.call_count == 1
    assert len(responses) == 3
    assert responses[0]["id"] == ID
    assert responses[0]["status"] == "ACKNOWLEDGED"
    assert responses[1]["id"] == ID
    assert responses[1]["status"] == "INSTALLING"
    assert responses[2]["id"] == ID
    assert responses[2]["status"] == "RUNNING"
    assert responses[2]["instance"] == 1
    assert responses[2]["port"] == 8899
    assert responses[2]["error"] == None


@pytest.mark.asyncio
async def test_run_quantization_exists(session_fixture, mock_mlc, model_weights, mocker):
    # Mocks
    session_fixture("endpoints.model.run.run")
    create_quants()

    # Prepare JSON streaming responses as they would be sent from the generator
    stream = run_models_generator([ID])

    # Collect the responses
    responses = []
    async for response in stream:
        responses.append(json.loads(response[5:]))

    # Check the responses
    assert mock_mlc.call_count == 0
    assert len(responses) == 2
    assert responses[0]["id"] == ID
    assert responses[0]["status"] == "ACKNOWLEDGED"
    assert responses[-1]["id"] == ID
    assert responses[-1]["status"] == "RUNNING"
    assert responses[-1]["instance"] == 1
    assert responses[-1]["port"] == 8899
    assert responses[-1]["error"] == None


@pytest.mark.asyncio
async def test_run_multiple_models(session_fixture, mock_mlc, model_weights, mocker):
    # Mocks
    session_fixture("endpoints.model.run.run")
    find_port = mocker.patch("endpoints.model.run.run.find_port", return_value=8899)

    # Prepare JSON streaming responses as they would be sent from the generator
    stream = run_models_generator([ID, ID, ID_2])

    # Collect the responses
    responses = []
    async for response in stream:
        responses.append(json.loads(response[5:]))

        if len(responses) == 6:
            find_port.return_value = 8900

        if len(responses) == 7:
            find_port.return_value = 8901

    # Check the responses
    assert mock_mlc.call_count == 2
    assert len(responses) == 8
    assert responses[0] == {
        "id": ID,
        "status": "ACKNOWLEDGED",
        "instance": None,
        "port": None,
        "error": None,
    }
    assert responses[1] == {
        "id": ID,
        "status": "ACKNOWLEDGED",
        "instance": None,
        "port": None,
        "error": None,
    }
    assert responses[2] == {
        "id": ID_2,
        "status": "ACKNOWLEDGED",
        "instance": None,
        "port": None,
        "error": None,
    }

    assert responses[3] == {
        "id": ID,
        "status": "INSTALLING",
        "instance": None,
        "port": None,
        "error": None,
    }
    assert responses[4] == {
        "id": ID_2,
        "status": "INSTALLING",
        "instance": None,
        "port": None,
        "error": None,
    }

    assert responses[5] == {
        "id": ID,
        "status": "RUNNING",
        "instance": 1,
        "port": 8899,
        "error": None,
    }
    assert responses[6] == {
        "id": ID,
        "status": "RUNNING",
        "instance": 2,
        "port": 8900,
        "error": None,
    }
    assert responses[7] == {
        "id": ID_2,
        "status": "RUNNING",
        "instance": 1,
        "port": 8901,
        "error": None,
    }


@pytest.mark.asyncio
async def test_run_instance_running(session_fixture, mock_mlc, model_weights, mocker):
    async with get_db_session() as session:
        # Mocks
        session_fixture("endpoints.model.run.run")
        create_quants()
        session.add(
            RunningModel(
                **{
                    "id": ID,
                    "instance": 1,
                    "name": "meta-llama/Meta-Llama-3-8B",
                    "size": 8000000000,
                    "pid": 1234,
                    "port": 8899,
                    "quantization": "INT4",
                }
            )
        )
        await session.commit()

    # Prepare JSON streaming responses as they would be sent from the generator
    stream = run_models_generator([ID])

    # Collect the responses
    responses = []
    async for response in stream:
        responses.append(json.loads(response[5:]))

    # Check the responses
    assert mock_mlc.call_count == 0
    assert len(responses) == 2
    assert responses[0]["id"] == ID
    assert responses[0]["status"] == "ACKNOWLEDGED"
    assert responses[-1]["id"] == ID
    assert responses[-1]["status"] == "RUNNING"
    assert responses[-1]["instance"] == 2
    assert responses[-1]["port"] == 8899
    assert responses[-1]["error"] == None


@pytest.mark.asyncio
async def test_run_not_convertable_format(session_fixture, mock_mlc, mocker):
    # Mock
    session_fixture("endpoints.model.run.run")

    # Prepare JSON streaming responses as they would be sent from the generator
    stream = run_models_generator([ID])

    # Collect the responses
    responses = []
    async for response in stream:
        responses.append(json.loads(response[5:]))

    # Check the responses
    assert mock_mlc.call_count == 0
    assert len(responses) == 2
    assert responses[0]["id"] == ID
    assert responses[0]["status"] == "ACKNOWLEDGED"
    assert responses[-1]["id"] == ID
    assert responses[-1]["status"] == "INSTALLING"
    assert responses[-1]["instance"] == None
    assert responses[-1]["port"] == None
    assert responses[-1]["error"] == "Model is not in a convertable format"


@pytest.mark.asyncio
async def test_run_not_enough_space(session_fixture, mock_mlc, model_weights, mocker):
    # Mocks
    session_fixture("endpoints.model.run.run")
    mocker.patch("state.ModelManager.get_usable_memory", return_value=8192)
    mocker.patch("state.ModelManager.ModelManager.get_expected_disk_consumption", return_value=0)
    mocker.patch("endpoints.model.run.run.get_usable_memory", return_value=8192)
    mocker.patch("psutil.disk_usage", return_value=MagicMock(free=1024))

    # Prepare JSON streaming responses as they would be sent from the generator
    stream = run_models_generator([ID, ID, ID_2])

    # Collect the responses
    responses = []
    async for response in stream:
        responses.append(json.loads(response[5:]))

    # Check the responses
    assert mock_mlc.call_count == 0
    assert len(responses) == 4
    assert responses[0]["id"] == ID
    assert responses[0]["status"] == "ACKNOWLEDGED"
    assert responses[1]["id"] == ID
    assert responses[1]["status"] == "ACKNOWLEDGED"
    assert responses[2]["id"] == ID_2
    assert responses[2]["status"] == "ACKNOWLEDGED"
    assert responses[3]["id"] == None
    assert responses[3]["status"] == "INSTALLING"
    assert responses[3]["instance"] == None
    assert responses[3]["port"] == None
    assert responses[-1]["error"] == "Not enough space"


@pytest.mark.asyncio
async def test_run_not_enough_memory_quantization(session_fixture, model_weights, mocker):
    # Mocks
    session_fixture("endpoints.model.run.run")
    mocker.patch("state.ModelManager.get_usable_memory", return_value=0)
    mocker.patch("psutil.disk_usage", return_value=MagicMock(free=8192))

    # Prepare JSON streaming responses as they would be sent from the generator
    stream = run_models_generator([ID, ID, ID_2])

    # Collect the responses
    responses = []
    async for response in stream:
        responses.append(json.loads(response[5:]))

    # Check the responses
    assert len(responses) == 4
    assert responses[0]["id"] == ID
    assert responses[0]["status"] == "ACKNOWLEDGED"
    assert responses[1]["id"] == ID
    assert responses[1]["status"] == "ACKNOWLEDGED"
    assert responses[2]["id"] == ID_2
    assert responses[2]["status"] == "ACKNOWLEDGED"
    assert responses[3]["id"] == None
    assert responses[3]["status"] == "INSTALLING"
    assert responses[3]["instance"] == None
    assert responses[3]["port"] == None
    assert responses[-1]["error"] == "No usable configurations found"
    assert (
        len(global_state_manager.model_manager.conversion_queue) == 0
    ), "Conversion queue should be cleared"


@pytest.mark.asyncio
async def test_run_kill_previous_models(session_fixture, mock_mlc, model_weights, mocker):
    # Mocks
    session_fixture("endpoints.model.run.run")
    mocker.patch("psutil.disk_usage", return_value=MagicMock(free=8192))
    kill_mock = mocker.patch("os.kill")
    mocker.patch("state.ModelManager.get_usable_memory", return_value=8192)
    ram_mock = mocker.patch("endpoints.model.run.run.get_usable_memory", return_value=8192)
    create_quants()

    # Prepare JSON streaming responses as they would be sent from the generator
    stream = run_models_generator([ID, ID, ID_2])

    # Collect the responses
    responses = []
    async for response in stream:
        responses.append(json.loads(response[5:]))
        if len(responses) == 5:
            ram_mock.return_value = 0

    # Check the responses
    assert kill_mock.call_count == 2

    assert len(responses) == 6
    assert responses[0] == {
        "id": ID,
        "status": "ACKNOWLEDGED",
        "instance": None,
        "port": None,
        "error": None,
    }
    assert responses[1] == {
        "id": ID,
        "status": "ACKNOWLEDGED",
        "instance": None,
        "port": None,
        "error": None,
    }
    assert responses[2] == {
        "id": ID_2,
        "status": "ACKNOWLEDGED",
        "instance": None,
        "port": None,
        "error": None,
    }
    assert responses[3] == {
        "id": ID,
        "status": "RUNNING",
        "instance": 1,
        "port": 8899,
        "error": None,
    }
    assert responses[4] == {
        "id": ID,
        "status": "RUNNING",
        "instance": 2,
        "port": 8899,
        "error": None,
    }
    assert responses[5] == {
        "id": ID_2,
        "status": "RUNNING",
        "instance": 1,
        "port": None,
        "error": "Not enough memory",
    }


@pytest.mark.asyncio
async def test_run_get_instance_count(session_fixture, model_weights, mocker):
    # Mocks
    session_fixture("endpoints.model.run.run")
    create_quants()

    # Insert running models
    data = [
        {
            "id": ID,
            "instance": 1,
            "name": "meta-llama/Meta-Llama-3-8B",
            "size": 8000000000,
            "pid": 1234,
            "port": 8899,
            "quantization": "INT4",
        },
        {
            "id": ID,
            "instance": 2,
            "name": "meta-llama/Meta-Llama-3-8B",
            "size": 8000000000,
            "pid": 1235,
            "port": 8900,
            "quantization": "INT4",
        },
        {
            "id": ID_2,
            "instance": 1,
            "name": "meta-llama/Meta-Llama-3-8B",
            "size": 8000000000,
            "pid": 1236,
            "port": 8901,
            "quantization": "INT4",
        },
    ]
    async with get_db_session() as session:
        for data_item in data:
            session.add(RunningModel(**data_item))
        await session.commit()

    # Prepare JSON streaming responses as they would be sent from the generator
    instances = await get_instances([ID, ID, ID_2, "new_model"])
    assert instances == [
        {"model_id": ID, "instance": 3},
        {"model_id": ID, "instance": 4},
        {"model_id": ID_2, "instance": 2},
        {"model_id": "new_model", "instance": 1},
    ]
