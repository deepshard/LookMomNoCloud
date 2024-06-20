import pytest
import json
from fastapi.testclient import TestClient
from server import app, init_state
from utils import get_app_data_path, get_devices
from tests.integration.data import models


@pytest.mark.asyncio
async def test_install(test_fixture):
    responses = []
    async with test_fixture.stream(
        "POST",
        "/model/install",
        json=models[0],
    ) as response:
        assert response.status_code == 200
        async for line in response.aiter_lines():
            if line:
                event_data = json.loads(line.split("data: ", 1)[1])
                responses.append(event_data)
                print(event_data)

    if len(get_devices()) == 0:
        assert responses[-1]["error"] == "No usable configurations found"
    else:
        assert responses[0]["status"] == "ACKNOWLEDGED"
        assert responses[1]["status"] == "DOWNLOADING"
        assert responses[-2]["status"] == "INSTALLING"
        assert responses[-1]["status"] == "STOPPED"

        model_id = models[0]["id"]

        base_path = get_app_data_path() / "models" / model_id / "base"
        assert base_path.exists()

        quant_path = get_app_data_path() / "models" / model_id / "q0f16"
        assert quant_path.exists()


@pytest.mark.asyncio
async def test_install_already_downloaded(test_fixture, model_downloaded):
    responses = []
    async with test_fixture.stream(
        "POST",
        "/model/install",
        json=models[0],
    ) as response:
        assert response.status_code == 200
        async for line in response.aiter_lines():
            if line:
                event_data = json.loads(line.split("data: ", 1)[1])
                responses.append(event_data)

    if len(get_devices()) == 0:
        assert responses[-1]["error"] == "No usable configurations found"
    else:
        assert responses[0]["status"] == "ACKNOWLEDGED"
        assert responses[1]["status"] == "DOWNLOADING"
        assert responses[-2]["status"] == "INSTALLING"
        assert responses[-1]["status"] == "STOPPED"

        model_id = models[0]["id"]

        base_path = get_app_data_path() / "models" / model_id / "base"
        assert base_path.exists()

        quant_path = get_app_data_path() / "models" / model_id / "q0f16"
        assert quant_path.exists()
