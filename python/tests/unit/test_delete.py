import pytest
from pathlib import Path
from sqlalchemy import select
from endpoints import delete_model_handler
from tests.unit.data import ID, MOCK_FILES
from models import RunningModel
from db import get_db_session


# Helpers
def create_files(path: Path):
    for file in MOCK_FILES:
        file_path = path / file["file_path"]
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(file["data"])


# Test the delete model logic
# Cases:
# - Only base weights exist
# - Base and quant weights exist
# - No weights exist


@pytest.mark.asyncio
async def test_delete_model_base(session_fixture):
    # Mocks
    session_fixture("endpoints.model.delete.delete")

    # Create mock files
    base_path = Path("/tmp") / "models" / ID / "base"
    create_files(base_path)

    # Delete the model
    await delete_model_handler(ID)

    # Assert that the model directory is deleted
    assert not base_path.exists(), "Model base directory should be deleted"
    assert not (base_path / "sub_folder").exists(), "Sub-folder should be deleted"
    assert not (
        Path("/tmp") / "models" / ID
    ).exists(), "Model top-level directory should be deleted"


@pytest.mark.asyncio
async def test_delete_model_with_quant_dir(session_fixture):
    # Mocks
    session_fixture("endpoints.model.delete.delete")

    # Create mock files
    base_path = Path("/tmp") / "models" / ID / "base"
    quant_path = Path("/tmp") / "models" / ID / "INT4"
    create_files(base_path)
    create_files(quant_path)

    # Delete the model
    await delete_model_handler(ID)

    # Assert that the model directory is deleted
    assert not base_path.exists(), "Model base directory should be deleted"
    assert not quant_path.exists(), "Model quant directory should be deleted"
    assert not (base_path / "sub_folder").exists(), "Sub-folder should be deleted"
    assert not (quant_path / "sub_folder").exists(), "Sub-folder should be deleted"
    assert not (
        Path("/tmp") / "models" / ID
    ).exists(), "Model top-level directory should be deleted"


@pytest.mark.asyncio
async def test_delete_model_no_files(session_fixture):
    # Mocks
    session_fixture("endpoints.model.delete.delete")

    # Delete the model
    with pytest.raises(FileNotFoundError):
        await delete_model_handler(ID)


@pytest.mark.asyncio
async def test_delete_model_running(session_fixture, mock_process):
    # Mocks
    session_fixture("endpoints.model.delete.delete")

    # Create mock files
    base_path = Path("/tmp") / "models" / ID / "base"
    quant_path = Path("/tmp") / "models" / ID / "INT4"
    create_files(base_path)
    create_files(quant_path)

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

    # Test
    assert proc.is_alive(), "Mock process should be running"
    await delete_model_handler(ID)
    assert not proc.is_alive(), "Mock process should be stopped"

    # Assert that the model directory is deleted
    assert not base_path.exists(), "Model base directory should be deleted"
    assert not quant_path.exists(), "Model quant directory should be deleted"
    assert not (base_path / "sub_folder").exists(), "Sub-folder should be deleted"
    assert not (quant_path / "sub_folder").exists(), "Sub-folder should be deleted"
    assert not (
        Path("/tmp") / "models" / ID
    ).exists(), "Model top-level directory should be deleted"

    # Assert model instance is removed from the database
    async with get_db_session() as session:
        result = await session.scalars(
            select(RunningModel).where(
                RunningModel.id == mock_model["id"],
                RunningModel.instance == mock_model["instance"],
            )
        )
        model_instance = result.first()
    assert model_instance is None, "Model instance should be removed from the database"
