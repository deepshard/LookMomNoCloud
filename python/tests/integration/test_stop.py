import pytest
import json
from utils import get_app_data_path, get_devices
from tests.integration.data import models
from models import RunningModel


@pytest.mark.asyncio
async def test_stop(test_fixture, model_running):
    model_id = models[0]["id"]
    response = await test_fixture.post(f"/model/{model_id}/stop")
    assert response.status_code == 200

    running_models = await RunningModel.get_all()
    assert len(running_models) == 0
