import os
import pytest
from pathlib import Path
from state import global_state_manager
from server import init_state
from endpoints.highlights.highlights import get_highlights
from truffle_types import ModelStatus
from tests.unit.data import MODELS
from db import get_db_session
from models import RunningModel


# Helpers
def create_model_dir(model_id: str):
    model_dir = Path(f"/tmp/models/{model_id}/base")
    model_dir.mkdir(parents=True, exist_ok=True)
    with open(model_dir / "pytorch_model.bin", "wb") as f:
        f.write(os.urandom(1024))
    with open(model_dir / "config.json", "wb") as f:
        f.write(os.urandom(1024))
    onnx_dir = model_dir / "onnx"
    onnx_dir.mkdir(parents=True, exist_ok=True)
    with open(onnx_dir / "onnx_model.onnx", "wb") as f:
        f.write(os.urandom(1024))
    tf_dir = model_dir / "tf_model"
    tf_dir.mkdir(parents=True, exist_ok=True)
    with open(tf_dir / "tf_model.pb", "wb") as f:
        f.write(os.urandom(1024))


@pytest.mark.asyncio
async def test_get_highlights_new_user(session_fixture):
    # Mocks
    session_fixture("endpoints.highlights.highlights")

    # Test
    models = await get_highlights()
    assert len(models) == 5
    assert models[0].status == ModelStatus.NOT_DOWNLOADED
    assert models[1].status == ModelStatus.NOT_DOWNLOADED
    assert models[2].status == ModelStatus.NOT_DOWNLOADED
    assert models[3].status == ModelStatus.NOT_DOWNLOADED
    assert models[4].status == ModelStatus.NOT_DOWNLOADED


@pytest.mark.asyncio
async def test_get_highlights_models_running(session_fixture):
    # Mocks
    session_fixture("endpoints.highlights.highlights")
    mock_model = {
        "id": MODELS[0]["id"],
        "instance": 1,
        "name": "Test Model 1",
        "size": 8000000000,
        "pid": 1234,
        "port": 32423,
        "quantization": "INT4",
    }
    async with get_db_session() as session:
        session.add(RunningModel(**mock_model))
        await session.commit()

    # Test
    models = await get_highlights()
    assert len(models) == 5
    assert models[0].status == ModelStatus.RUNNING
    assert models[1].status == ModelStatus.NOT_DOWNLOADED
    assert models[2].status == ModelStatus.NOT_DOWNLOADED
    assert models[3].status == ModelStatus.NOT_DOWNLOADED
    assert models[4].status == ModelStatus.NOT_DOWNLOADED
    assert models[0].id != models[1].id


@pytest.mark.asyncio
async def test_get_highlights_models_downloaded_and_running(session_fixture, mocker):
    # Downloaded mocks
    session_fixture("endpoints.highlights.highlights")
    mocker.patch(
        "endpoints.model.downloaded.downloaded.get_app_data_path", return_value=Path("/tmp")
    )
    base_dir = Path("/tmp/models")
    create_model_dir(MODELS[0]["id"])
    create_model_dir(MODELS[1]["id"])

    # Running mock
    mock_model = {
        "id": MODELS[0]["id"],
        "instance": 1,
        "name": "Test Model 1",
        "size": 8000000000,
        "pid": 1234,
        "port": 32423,
        "quantization": "INT4",
    }
    async with get_db_session() as session:
        session.add(RunningModel(**mock_model))
        await session.commit()

    # Test
    models = await get_highlights()
    assert len(models) == 5
    assert models[0].status == ModelStatus.RUNNING
    assert models[1].status == ModelStatus.STOPPED
    assert models[2].status == ModelStatus.NOT_DOWNLOADED
    assert models[3].status == ModelStatus.NOT_DOWNLOADED
    assert models[4].status == ModelStatus.NOT_DOWNLOADED
    assert models[0].id != models[2].id
    assert models[1].id != models[2].id
