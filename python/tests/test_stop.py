import pytest
import asyncio
import multiprocessing
from endpoints.model.stop import stop_model_handler
from db import db
from server import init_db


# Test the stop_model_handler logic
# Cases:
# - Model instance exists
# - Model instance does not exist


# Helpers
def fake_process():
    while True:
        asyncio.sleep(10)


async def clear_db():
    async with init_db():
        await db.runningmodels.delete_many()


# Fixtures
@pytest.fixture(autouse=True)
def base_fixture(request):
    def teardown():
        asyncio.run(clear_db())
    request.addfinalizer(teardown)


@pytest.fixture
def mock_process():
    proc = multiprocessing.Process(target=fake_process)
    proc.start()
    print(f"Mock process started with PID {proc.pid}")
    yield proc


# Tests
@pytest.mark.asyncio
async def test_stop_model_instance_exists(base_fixture, mock_process):
    async with init_db():
        # Add the model to the database
        mock_model = {
            "id": "TEST_model_1",
            "instance": 1,
            "name": "Test Model 1",
            "size": 8000000000,
            "pid": mock_process.pid,
            "port": 8899,
            "quantization": "INT4"
        }
        await db.runningmodels.create(mock_model)

        # Assert process is running
        assert mock_process.is_alive(), "Mock process should be running"

        # Stop the model instance
        await stop_model_handler(mock_model["id"], mock_model["instance"])

        # Check that the mock process was stopped
        assert not mock_process.is_alive(), "Mock process should be stopped"

        # Check that the model instance was removed from the database
        model_instance = await db.runningmodels.find_first(where={"id": mock_model["id"], "instance": mock_model["instance"]})
        assert model_instance is None, "Model instance should be removed from the database"


@pytest.mark.asyncio
async def test_stop_model_instance_not_exists(base_fixture):
    async with init_db():
        # Stop a non-existent model instance
        with pytest.raises(ValueError):
            await stop_model_handler("TEST_model_1", 1)
