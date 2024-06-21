import pytest
import json
from utils import get_app_data_path, get_devices
from tests.integration.data import models
from models import RunningModel


@pytest.mark.asyncio
async def test_run(test_fixture, model_downloaded):
    responses = []
    async with test_fixture.stream(
        "POST",
        "/model/run",
        json={
            "ids": [models[0]["id"]],
        }
    ) as response:
        async for line in response.aiter_lines():
            if line:
                event_data = json.loads(line.split("data: ", 1)[1])
                responses.append(event_data)

    if len(get_devices()) == 0:
        assert responses[-1]["error"] == "No usable configurations found"
    else:
        assert responses[0]["status"] == "ACKNOWLEDGED"
        assert responses[1]["status"] == "INSTALLING"
        assert responses[-1]["status"] == "RUNNING"
        assert responses[-1]["instance"] == 1
        assert responses[-1]["port"] == 8899

        running_models = await RunningModel.get_all()
        assert len(running_models) == 1
        assert running_models[0].id == models[0]["id"]
        assert running_models[0].instance == 1
        assert running_models[0].port == 8899


@pytest.mark.asyncio
async def test_run_already_installed(test_fixture, model_installed):
    responses = []
    async with test_fixture.stream(
        "POST",
        "/model/run",
        json={
            "ids": [models[0]["id"]],
        }
    ) as response:
        assert response.status_code == 200
        async for line in response.aiter_lines():
            if line:
                event_data = json.loads(line.split("data: ", 1)[1])
                responses.append(event_data)

    assert responses[0]["status"] == "ACKNOWLEDGED"
    assert responses[1]["status"] == "RUNNING"
    assert responses[1]["instance"] == 1
    assert responses[1]["port"] == 8899

    running_models = await RunningModel.get_all()
    assert len(running_models) == 1
    assert running_models[0].id == models[0]["id"]
    assert running_models[0].instance == 1
    assert running_models[0].port == 8899


@pytest.mark.asyncio
async def test_run_multiple_models(test_fixture, model_installed):
    responses = []
    async with test_fixture.stream(
        "POST",
        "/model/run",
        json={
            "ids": [models[0]["id"], models[0]["id"]],
        }
    ) as response:
        assert response.status_code == 200
        async for line in response.aiter_lines():
            if line:
                event_data = json.loads(line.split("data: ", 1)[1])
                responses.append(event_data)

    if len(get_devices()) == 0:
        assert responses[-1]["error"] == "No usable configurations found"
    else:
        assert responses[0]["id"] == models[0]["id"]
        assert responses[0]["status"] == "ACKNOWLEDGED"

        assert responses[1]["id"] == models[0]["id"]
        assert responses[1]["status"] == "ACKNOWLEDGED"

        assert responses[-2]["id"] == models[0]["id"]
        assert responses[-2]["status"] == "RUNNING"
        assert responses[-2]["instance"] == 1
        assert responses[-2]["port"] == 8899

        assert responses[-1]["id"] == models[0]["id"]
        assert responses[-1]["status"] == "RUNNING"
        assert responses[-1]["instance"] == 2
        assert responses[-1]["port"] == 8900

        running_models = await RunningModel.get_all()
        assert len(running_models) == 2
        assert running_models[0].id == models[0]["id"]
        assert running_models[0].instance == 1
        assert running_models[0].port == 8899
        assert running_models[1].id == models[0]["id"]
        assert running_models[1].instance == 2
        assert running_models[1].port == 8900
