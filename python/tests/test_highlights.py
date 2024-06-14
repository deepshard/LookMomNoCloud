import pytest
from state import global_state_manager
from server import init_state
from endpoints.highlights.highlights import get_highlights
from truffle_types import ModelStatus
from tests.data import MODELS
from db import get_db_session
from models import RunningModel


@pytest.mark.asyncio
async def test_get_highlights_new_user():
    async with init_state():
        # Test
        models = await get_highlights()
        assert len(models) == 5
        assert models[0].status == ModelStatus.NOT_DOWNLOADED
        assert models[1].status == ModelStatus.NOT_DOWNLOADED
        assert models[2].status == ModelStatus.NOT_DOWNLOADED
        assert models[3].status == ModelStatus.NOT_DOWNLOADED
        assert models[4].status == ModelStatus.NOT_DOWNLOADED


@pytest.mark.asyncio
async def test_get_highlights_models_running():
    async with init_state():
        # Mocks
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
