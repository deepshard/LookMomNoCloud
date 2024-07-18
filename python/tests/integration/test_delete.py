import pytest
from utils import get_app_data_path
from models import RunningModel
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
    assert response.status_code == 500


@pytest.mark.asyncio
async def test_delete_running_model(test_fixture, model_installed):
    # Run the model and confirm it is running
    response = await test_fixture.post(
        "/model/run",
        json={
            "ids": [models[0]["id"]],
        },
    )
    assert response.status_code == 200
    running_models = await RunningModel.get_all()
    assert len(running_models) == 1

    model_id = models[0]["id"]
    response = await test_fixture.delete(f"/model/{model_id}")
    assert response.status_code == 200
    assert not (get_app_data_path() / "models" / model_id).exists()
    running_models = await RunningModel.get_all()
    assert len(running_models) == 0
