import pytest
import json
from utils import get_app_data_path, get_devices
from tests.integration.data import models


@pytest.mark.asyncio
async def test_delete(test_fixture, model_downloaded):
    model_id = models[0]["id"]
    response = await test_fixture.delete(f"/model/{model_id}")
    assert response.status_code == 200
    assert not (get_app_data_path() / "models" / model_id).exists()


@pytest.mark.asyncio
async def test_delete_non_existent(test_fixture):
    model_id = models[0]["id"]
    response = await test_fixture.delete(f"/model/{model_id}")
    assert response.status_code == 400
