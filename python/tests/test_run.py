import os
import json
import asyncio
import pytest
from unittest import mock
from unittest.mock import patch, MagicMock
import shutil
from pathlib import Path
from endpoints.model.install import InstallationManager
from endpoints.model.run.run import run_models_generator, get_instances
from db import db
from server import init_db
from truffle_types import Quantization

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


# Test the run endpoint logic
# Cases:
# - Quantization does not exist
# - Quantization exists
# - Multiple models requested
# - There is already an instance running
# - Model is not in a convertable format
# - There is not enough space to convert all of the models
# - Not enough memory to quantize a model
# - Not enough memory to run a model
# - Kills previous models if there is not enough memory for a new model
# - Gets instance count from DB

# Mock Data
model_id_1 = "TEST_model_1"
model_id_2 = "TEST_model_2"
model_id_3 = "TEST_model_3"
model_files = [
    {"file": "pytorch_model.bin", "data": os.urandom(1024)},
    {"file": "config.json", "data": os.urandom(1024)},
]

# Helpers


def clear_path():
    if os.path.exists(Path("/tmp") / "models"):
        shutil.rmtree(Path("/tmp") / "models")


async def clear_db():
    print("Clearing DB")
    async with init_db():
        await db.runningmodels.delete_many()


# Fixtures
@pytest.fixture(autouse=True)
def base_fixture(request):
    # Setup
    asyncio.run(clear_db())
    for model_id in [model_id_1, model_id_2, model_id_3]:
        model_path = Path("/tmp") / "models" / model_id / "base"
        os.makedirs(model_path, exist_ok=True)
        for file in model_files:
            with open(model_path / file["file"], "wb") as f:
                f.write(file["data"])

    # Teardown
    def teardown():
        clear_path()
        asyncio.run(clear_db())

    request.addfinalizer(teardown)


@pytest.fixture
def get_tensor_parallelism_mock():
    with patch(
        "endpoints.model.run.run.get_tensor_parallelism", return_value=1
    ) as get_tensor_parallelism:
        yield get_tensor_parallelism


@pytest.fixture
def get_quant_decision_mock():
    with patch(
        "endpoints.model.run.run.get_adaptive_quantization_decision",
        return_value=[(model_id_1, Quantization.Q0F16)],
    ) as get_adaptive_quantization_decision:
        yield get_adaptive_quantization_decision


@pytest.fixture
def get_app_data_path_mock():
    with patch(
        "endpoints.model.run.run.get_app_data_path", return_value=Path("/tmp")
    ) as get_app_data_path:
        yield get_app_data_path


@pytest.fixture
def get_disk_and_memory_mock():
    with patch(
        "endpoints.model.run.run.install.get_space_check_info",
        return_value=(8192, 8192, 0),
    ) as get_space_check_info, patch(
        "endpoints.model.run.run.get_usable_memory", return_value=8192
    ):
        yield get_space_check_info


@pytest.fixture
def server_mock():
    with patch(
        "endpoints.model.run.run.is_server_running", return_value=True
    ) as is_server_running:
        yield is_server_running


@pytest.fixture
def subprocess_mock():
    # Mock multiprocessing.Process, multiprocessing.Process.start, and multiprocessing.Process.terminate
    with patch("multiprocessing.Process") as Process:
        process = MagicMock()
        process.pid = 1234
        Process.return_value = process
        yield process


@pytest.fixture
def mock_quants():
    with patch(
        "endpoints.model.run.run.does_quantization_exist", return_value=True
    ) as does_quantization_exist:
        for model_id in [model_id_1, model_id_2, model_id_3]:
            quant_path = Path("/tmp") / "models" / model_id / "q0f16"
            os.makedirs(quant_path, exist_ok=True)
            with open(quant_path / "model.bin", "wb") as f:
                f.write("test".encode("utf-8"))

        yield does_quantization_exist


@pytest.fixture
def mlc_mock():
    # Mock convert_quantize_compile, when called write some data to the model's quantization directory
    with patch(
        "endpoints.model.run.run.install.convert_quantize_compile", return_value=None
    ) as cqc:

        def write_data(weights_path, quant_path, quant):
            print(f"Writing data to {quant_path}")
            os.makedirs(quant_path, exist_ok=True)
            with open(quant_path / "model.bin", "wb") as f:
                f.write("test".encode("utf-8"))

        cqc.side_effect = write_data
        yield cqc


# Tests
@pytest.mark.asyncio
async def test_run_quantization_does_not_exist(
    base_fixture,
    get_tensor_parallelism_mock,
    get_quant_decision_mock,
    get_app_data_path_mock,
    server_mock,
    subprocess_mock,
    mlc_mock,
    get_disk_and_memory_mock,
):
    async with init_db():
        manager = InstallationManager()

        # Prepare JSON streaming responses as they would be sent from the generator
        stream = run_models_generator([model_id_1], manager)

        # Collect the responses
        responses = []
        async for response in stream:
            responses.append(json.loads(response[5:]))

        # Check the responses
        assert mlc_mock.call_count == 1
        assert get_quant_decision_mock.call_count == 1
        get_quant_decision_mock.assert_called_with([model_id_1], manager)
        assert len(responses) == 3
        assert responses[0]["id"] == model_id_1
        assert responses[0]["status"] == "ACKNOWLEDGED"
        assert responses[1]["id"] == model_id_1
        assert responses[1]["status"] == "INSTALLING"
        assert responses[2]["id"] == model_id_1
        assert responses[2]["status"] == "RUNNING"
        assert responses[2]["instance"] == 1
        assert responses[2]["port"] == 8899
        assert responses[2]["error"] == None


@pytest.mark.asyncio
async def test_run_quantization_exists(
    base_fixture,
    get_tensor_parallelism_mock,
    get_quant_decision_mock,
    get_app_data_path_mock,
    mock_quants,
    server_mock,
    subprocess_mock,
    mlc_mock,
    get_disk_and_memory_mock,
    mocker,
):
    async with init_db():
        manager = InstallationManager()

        # Prepare JSON streaming responses as they would be sent from the generator
        stream = run_models_generator([model_id_1], manager)

        # Collect the responses
        responses = []
        async for response in stream:
            responses.append(json.loads(response[5:]))

        # Check the responses
        assert mlc_mock.call_count == 0
        assert get_quant_decision_mock.call_count == 1
        get_quant_decision_mock.assert_called_with([model_id_1], manager)
        assert len(responses) == 2
        assert responses[0]["id"] == model_id_1
        assert responses[0]["status"] == "ACKNOWLEDGED"
        assert responses[-1]["id"] == model_id_1
        assert responses[-1]["status"] == "RUNNING"
        assert responses[-1]["instance"] == 1
        assert responses[-1]["port"] == 8899
        assert responses[-1]["error"] == None


@pytest.mark.asyncio
async def test_run_multiple_models(
    base_fixture,
    get_tensor_parallelism_mock,
    get_app_data_path_mock,
    server_mock,
    subprocess_mock,
    mlc_mock,
    get_disk_and_memory_mock,
    mocker,
):
    async with init_db():
        with patch(
            "endpoints.model.run.run.get_adaptive_quantization_decision",
            return_value=[
                (model_id_1, Quantization.Q0F16),
                (model_id_1, Quantization.Q0F16),
                (model_id_2, Quantization.Q0F16),
            ],
        ) as get_quant_decision_mock:
            with patch(
                "endpoints.model.run.run.find_port", return_value=8899
            ) as find_port:
                manager = InstallationManager()

                # Prepare JSON streaming responses as they would be sent from the generator
                stream = run_models_generator(
                    [model_id_1, model_id_1, model_id_2], manager
                )

                # Collect the responses
                responses = []
                async for response in stream:
                    responses.append(json.loads(response[5:]))
                    print(responses[-1])

                    if len(responses) == 6:
                        find_port.return_value = 8900

                    if len(responses) == 7:
                        find_port.return_value = 8901

                # Check the responses
                assert mlc_mock.call_count == 2
                assert get_quant_decision_mock.call_count == 1
                get_quant_decision_mock.assert_called_with(
                    [
                        model_id_1,
                        model_id_1,
                        model_id_2,
                    ],
                    manager,
                )
                assert len(responses) == 8
                assert responses[0] == {
                    "id": model_id_1,
                    "status": "ACKNOWLEDGED",
                    "instance": None,
                    "port": None,
                    "error": None,
                }
                assert responses[1] == {
                    "id": model_id_1,
                    "status": "ACKNOWLEDGED",
                    "instance": None,
                    "port": None,
                    "error": None,
                }
                assert responses[2] == {
                    "id": model_id_2,
                    "status": "ACKNOWLEDGED",
                    "instance": None,
                    "port": None,
                    "error": None,
                }

                assert responses[3] == {
                    "id": model_id_1,
                    "status": "INSTALLING",
                    "instance": None,
                    "port": None,
                    "error": None,
                }
                assert responses[4] == {
                    "id": model_id_2,
                    "status": "INSTALLING",
                    "instance": None,
                    "port": None,
                    "error": None,
                }

                assert responses[5] == {
                    "id": model_id_1,
                    "status": "RUNNING",
                    "instance": 1,
                    "port": 8899,
                    "error": None,
                }
                assert responses[6] == {
                    "id": model_id_1,
                    "status": "RUNNING",
                    "instance": 2,
                    "port": 8900,
                    "error": None,
                }
                assert responses[7] == {
                    "id": model_id_2,
                    "status": "RUNNING",
                    "instance": 1,
                    "port": 8901,
                    "error": None,
                }


@pytest.mark.asyncio
async def test_run_instance_running(
    base_fixture,
    get_tensor_parallelism_mock,
    get_quant_decision_mock,
    get_app_data_path_mock,
    mock_quants,
    server_mock,
    subprocess_mock,
    mlc_mock,
    get_disk_and_memory_mock,
):
    async with init_db():
        manager = InstallationManager()

        # Insert a running model
        await db.runningmodels.create(
            {
                "id": model_id_1,
                "instance": 1,
                "name": "meta-llama/Meta-Llama-3-8B",
                "size": 8000000000,
                "pid": 1234,
                "port": 8899,
                "quantization": "INT4",
            }
        )

        # Prepare JSON streaming responses as they would be sent from the generator
        stream = run_models_generator([model_id_1], manager)

        # Collect the responses
        responses = []
        async for response in stream:
            responses.append(json.loads(response[5:]))

        # Check the responses
        assert mlc_mock.call_count == 0
        assert get_quant_decision_mock.call_count == 1
        get_quant_decision_mock.assert_called_with([model_id_1], manager)
        assert len(responses) == 2
        assert responses[0]["id"] == model_id_1
        assert responses[0]["status"] == "ACKNOWLEDGED"
        assert responses[-1]["id"] == model_id_1
        assert responses[-1]["status"] == "RUNNING"
        assert responses[-1]["instance"] == 2
        assert responses[-1]["port"] == 8899
        assert responses[-1]["error"] == None


@pytest.mark.asyncio
async def test_run_not_convertable_format(
    base_fixture,
    get_tensor_parallelism_mock,
    get_quant_decision_mock,
    get_app_data_path_mock,
    server_mock,
    subprocess_mock,
    mlc_mock,
    get_disk_and_memory_mock,
):
    async with init_db():
        manager = InstallationManager()

        # Rename pytorch_model.bin to something else
        model_path = Path("/tmp") / "models" / model_id_1 / "base"
        os.rename(model_path / "pytorch_model.bin", model_path / "invalid_file.bin")

        # Prepare JSON streaming responses as they would be sent from the generator
        stream = run_models_generator([model_id_1], manager)

        # Collect the responses
        responses = []
        async for response in stream:
            responses.append(json.loads(response[5:]))

        # Check the responses
        assert mlc_mock.call_count == 0
        assert len(responses) == 2
        assert responses[0]["id"] == model_id_1
        assert responses[0]["status"] == "ACKNOWLEDGED"
        assert responses[-1]["id"] == model_id_1
        assert responses[-1]["status"] == "INSTALLING"
        assert responses[-1]["instance"] == None
        assert responses[-1]["port"] == None
        assert responses[-1]["error"] == "Model is not in a convertable format"


@pytest.mark.asyncio
async def test_run_not_enough_space(
    base_fixture,
    get_tensor_parallelism_mock,
    get_quant_decision_mock,
    get_app_data_path_mock,
    server_mock,
    subprocess_mock,
    mlc_mock,
):
    async with init_db():
        manager = InstallationManager()

        # Mock the disk usage
        with patch(
            "endpoints.model.run.run.install.get_space_check_info",
            return_value=(0, 1024, 0),
        ), patch("endpoints.model.run.run.get_usable_memory", return_value=8192):
            # Prepare JSON streaming responses as they would be sent from the generator
            stream = run_models_generator([model_id_1, model_id_2, model_id_3], manager)

            # Collect the responses
            responses = []
            async for response in stream:
                responses.append(json.loads(response[5:]))

            # Check the responses
            assert mlc_mock.call_count == 0
            assert len(responses) == 4
            assert responses[0]["id"] == model_id_1
            assert responses[0]["status"] == "ACKNOWLEDGED"
            assert responses[1]["id"] == model_id_2
            assert responses[1]["status"] == "ACKNOWLEDGED"
            assert responses[2]["id"] == model_id_3
            assert responses[2]["status"] == "ACKNOWLEDGED"
            assert responses[3]["id"] == None
            assert responses[3]["status"] == "INSTALLING"
            assert responses[3]["instance"] == None
            assert responses[3]["port"] == None
            assert (
                responses[-1]["error"]
                == "Not enough space to convert and quantize the models"
            )


@pytest.mark.asyncio
async def test_run_not_enough_memory_quantization(
    base_fixture,
    get_tensor_parallelism_mock,
    get_quant_decision_mock,
    get_app_data_path_mock,
    server_mock,
    subprocess_mock,
    mlc_mock,
):
    async with init_db():
        manager = InstallationManager()

        with patch(
            "endpoints.model.run.run.install.get_space_check_info",
            return_value=(0, 8192, 0),
        ), patch(
            "endpoints.model.run.run.get_usable_memory",
            return_value=0,
        ) as ram_mock:
            # Prepare JSON streaming responses as they would be sent from the generator
            stream = run_models_generator([model_id_1, model_id_2, model_id_3], manager)

            # Collect the responses
            responses = []
            async for response in stream:
                responses.append(json.loads(response[5:]))

            # Check the responses
            assert mlc_mock.call_count == 0
            assert len(responses) == 4
            assert responses[0]["id"] == model_id_1
            assert responses[0]["status"] == "ACKNOWLEDGED"
            assert responses[1]["id"] == model_id_2
            assert responses[1]["status"] == "ACKNOWLEDGED"
            assert responses[2]["id"] == model_id_3
            assert responses[2]["status"] == "ACKNOWLEDGED"
            assert responses[3]["id"] == model_id_1
            assert responses[3]["status"] == "INSTALLING"
            assert responses[3]["instance"] == None
            assert responses[3]["port"] == None
            assert (
                responses[-1]["error"]
                == "Not enough memory to convert and quantize the model"
            )
            assert (
                len(manager.conversion_queue) == 0
            ), "Conversion queue should be cleared"


@pytest.mark.asyncio
async def test_run_not_enough_memory_run(
    base_fixture,
    get_tensor_parallelism_mock,
    get_quant_decision_mock,
    get_app_data_path_mock,
    mock_quants,
    server_mock,
    subprocess_mock,
    mlc_mock,
):
    async with init_db():
        manager = InstallationManager()

        with patch(
            "endpoints.model.run.run.install.get_space_check_info",
            return_value=(0, 8192, 0),
        ), patch(
            "endpoints.model.run.run.get_usable_memory",
            return_value=0,
        ) as ram_mock:
            with patch("os.kill") as kill_mock:
                # Prepare JSON streaming responses as they would be sent from the generator
                stream = run_models_generator([model_id_1], manager)

                # Collect the responses
                responses = []
                async for response in stream:
                    responses.append(json.loads(response[5:]))

                # Check the responses
                assert mlc_mock.call_count == 0
                assert kill_mock.call_count == 0

                assert len(responses) == 2
                assert responses[0]["id"] == model_id_1
                assert responses[0]["status"] == "ACKNOWLEDGED"
                assert responses[-1]["id"] == model_id_1
                assert responses[-1]["status"] == "RUNNING"
                assert responses[-1]["instance"] == 1
                assert responses[-1]["port"] == None
                assert responses[-1]["error"] == "Not enough memory to run the model"


@pytest.mark.asyncio
async def test_run_kill_previous_models(
    base_fixture,
    get_tensor_parallelism_mock,
    get_quant_decision_mock,
    get_app_data_path_mock,
    mock_quants,
    server_mock,
    subprocess_mock,
    mlc_mock,
):
    async with init_db():
        manager = InstallationManager()

        with patch(
            "endpoints.model.run.run.install.get_space_check_info",
            return_value=(0, 8192, 0),
        ), patch("endpoints.model.run.run.get_usable_memory") as ram_mock, patch(
            "endpoints.model.run.run.get_adaptive_quantization_decision",
            return_value=[
                (model_id_1, Quantization.Q0F16),
                (model_id_2, Quantization.Q0F16),
                (model_id_3, Quantization.Q0F16),
            ],
        ):

            def mock_virtual_memory():
                if ram_mock.call_count <= 2:
                    return 8192

                # For model_id_3, there is not enough memory to run the model
                return 0

            ram_mock.side_effect = mock_virtual_memory

            with patch("os.kill") as kill_mock:
                # Prepare JSON streaming responses as they would be sent from the generator
                stream = run_models_generator(
                    [model_id_1, model_id_2, model_id_3], manager
                )

                # Collect the responses
                responses = []
                async for response in stream:
                    responses.append(json.loads(response[5:]))
                    print(responses[-1])

                # Check the responses
                assert mlc_mock.call_count == 0
                assert kill_mock.call_count == 2

                assert len(responses) == 6
                assert responses[0] == {
                    "id": model_id_1,
                    "status": "ACKNOWLEDGED",
                    "instance": None,
                    "port": None,
                    "error": None,
                }
                assert responses[1] == {
                    "id": model_id_2,
                    "status": "ACKNOWLEDGED",
                    "instance": None,
                    "port": None,
                    "error": None,
                }
                assert responses[2] == {
                    "id": model_id_3,
                    "status": "ACKNOWLEDGED",
                    "instance": None,
                    "port": None,
                    "error": None,
                }

                assert responses[3] == {
                    "id": model_id_1,
                    "status": "RUNNING",
                    "instance": 1,
                    "port": 8899,
                    "error": None,
                }
                assert responses[4] == {
                    "id": model_id_2,
                    "status": "RUNNING",
                    "instance": 1,
                    "port": 8899,
                    "error": None,
                }
                assert responses[5] == {
                    "id": model_id_3,
                    "status": "RUNNING",
                    "instance": 1,
                    "port": None,
                    "error": "Not enough memory to run the model",
                }


@pytest.mark.asyncio
async def test_run_get_instance_count(
    base_fixture,
    get_tensor_parallelism_mock,
    get_quant_decision_mock,
    get_app_data_path_mock,
    mock_quants,
    server_mock,
    subprocess_mock,
    mlc_mock,
):
    async with init_db():
        manager = InstallationManager()

        # Insert running models
        data = [
            {
                "id": model_id_1,
                "instance": 1,
                "name": "meta-llama/Meta-Llama-3-8B",
                "size": 8000000000,
                "pid": 1234,
                "port": 8899,
                "quantization": "INT4",
            },
            {
                "id": model_id_1,
                "instance": 2,
                "name": "meta-llama/Meta-Llama-3-8B",
                "size": 8000000000,
                "pid": 1235,
                "port": 8900,
                "quantization": "INT4",
            },
            {
                "id": model_id_2,
                "instance": 1,
                "name": "meta-llama/Meta-Llama-3-8B",
                "size": 8000000000,
                "pid": 1236,
                "port": 8901,
                "quantization": "INT4",
            },
        ]
        for data_item in data:
            await db.runningmodels.create(data_item)

        # Prepare JSON streaming responses as they would be sent from the generator
        instances = await get_instances([model_id_1, model_id_2, model_id_3])
        assert instances == [
            {"model_id": model_id_1, "instance": 3},
            {"model_id": model_id_2, "instance": 2},
            {"model_id": model_id_3, "instance": 1},
        ]
