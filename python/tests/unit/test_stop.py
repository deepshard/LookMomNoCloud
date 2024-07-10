import pytest
from sqlalchemy import select
from endpoints.model.stop import stop_model_handler, stop_all_models
from db import get_db_session
from models import RunningModel


# Test the stop logic
# Cases:
# - Model instance exists
# - Model instance does not exist
# - Stop all models


# Tests
@pytest.mark.asyncio
async def test_stop_model_instance_exists(mock_process):
    # Add the model to the database
    proc = mock_process()
    mock_model = {
        "id": "TEST_model_1",
        "instance": 1,
        "name": "Test Model 1",
        "size": 8000000000,
        "pid": proc.pid,
        "port": 8899,
        "quantization": "INT4",
    }
    async with get_db_session() as session:
        session.add(RunningModel(**mock_model))
        await session.commit()

    assert proc.is_alive(), "Mock process should be running"
    await stop_model_handler(mock_model["id"], mock_model["instance"])
    assert not proc.is_alive(), "Mock process should be stopped"

    # Check that the model instance was removed from the database
    async with get_db_session() as session:
        result = await session.scalars(
            select(RunningModel).where(
                RunningModel.id == mock_model["id"],
                RunningModel.instance == mock_model["instance"],
            )
        )
        model_instance = result.first()
    assert model_instance is None, "Model instance should be removed from the database"


@pytest.mark.asyncio
async def test_stop_model_instance_not_exists():
    with pytest.raises(ValueError):
        await stop_model_handler("TEST_model_1", 1)


@pytest.mark.asyncio
async def test_stop_all_models(mock_process):
    proc_1 = mock_process()
    proc_2 = mock_process()
    mock_model_1 = {
        "id": "TEST_model_1",
        "instance": 1,
        "name": "Test Model 1",
        "size": 8000000000,
        "pid": proc_1.pid,
        "port": 8899,
        "quantization": "INT4",
    }
    mock_model_2 = {
        "id": "TEST_model_2",
        "instance": 1,
        "name": "Test Model 2",
        "size": 8000000000,
        "pid": proc_2.pid,
        "port": 8899,
        "quantization": "INT4",
    }
    async with get_db_session() as session:
        session.add(RunningModel(**mock_model_1))
        session.add(RunningModel(**mock_model_2))
        await session.commit()

    assert proc_1.is_alive(), "Mock process 1 should be running"
    assert proc_2.is_alive(), "Mock process 2 should be running"
    await stop_all_models()
    assert not proc_1.is_alive(), "Mock process 1 should be stopped"
    assert not proc_2.is_alive(), "Mock process 2 should be stopped"

    # Check that the model instances were removed from the database
    async with get_db_session() as session:
        result = await session.scalars(select(RunningModel))
        model_instances = result.all()
    assert not model_instances, "Model instances should be removed from the database"
