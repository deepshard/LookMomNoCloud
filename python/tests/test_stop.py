import pytest
import asyncio
from multiprocessing import Process, set_start_method

from sqlalchemy import select
from state import global_state_manager
from server import init_state
from endpoints.model.stop import stop_model_handler
from db import get_db_session
from models import RunningModel


# Test the stop_model_handler logic
# Cases:
# - Model instance exists
# - Model instance does not exist


# Helpers
async def fake_process():
    while True:
        await asyncio.sleep(10)


async def clear_db():
    async with init_state():
        await RunningModel.delete_all()


# Fixtures
@pytest.fixture(autouse=True)
def base_fixture(request):
    def teardown():
        asyncio.run(clear_db())

    request.addfinalizer(teardown)


@pytest.fixture
def mock_process():
    set_start_method("spawn")
    proc = Process(target=fake_process)
    proc.start()
    print(f"Mock process started with PID {proc.pid}")
    yield proc


# Tests
@pytest.mark.asyncio
async def test_stop_model_instance_exists(base_fixture, mock_process):
    async with init_state():
        # Add the model to the database
        mock_model = {
            "id": "TEST_model_1",
            "instance": 1,
            "name": "Test Model 1",
            "size": 8000000000,
            "pid": mock_process.pid,
            "port": 8899,
            "quantization": "INT4",
        }
        async with get_db_session() as session:
            session.add(RunningModel(**mock_model))
            await session.commit()

        # Assert process is running
        assert mock_process.is_alive(), "Mock process should be running"

        # Stop the model instance
        await stop_model_handler(mock_model["id"], mock_model["instance"])

        # Check that the mock process was stopped
        assert not mock_process.is_alive(), "Mock process should be stopped"

        # Check that the model instance was removed from the database
        async with get_db_session() as session:
            result = await session.scalars(
                select(RunningModel).where(
                    RunningModel.id == mock_model["id"],
                    RunningModel.instance == mock_model["instance"],
                )
            )
            model_instance = result.first()
        assert (
            model_instance is None
        ), "Model instance should be removed from the database"


@pytest.mark.asyncio
async def test_stop_model_instance_not_exists(base_fixture):
    async with init_state():
        # Stop a non-existent model instance
        with pytest.raises(ValueError):
            await stop_model_handler("TEST_model_1", 1)
