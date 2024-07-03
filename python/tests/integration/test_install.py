import pytest
import json
import asyncio
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


@pytest.mark.asyncio
async def test_install_sequential_requests(test_fixture):
    async def install_model(model):
        responses = []
        async with test_fixture.stream(
            "POST",
            "/model/install",
            json=model,
        ) as response:
            assert response.status_code == 200
            async for line in response.aiter_lines():
                if line:
                    event_data = json.loads(line.split("data: ", 1)[1])
                    responses.append(event_data)
        return responses

    tasks = [install_model(model) for model in models]
    results = await asyncio.gather(*tasks)
    responses = [response for task_result in results for response in task_result]

    if len(get_devices()) == 0:
        assert responses[-1]["error"] == "No usable configurations found"
    else:
        model_id = models[0]["id"]
        model_id_2 = models[1]["id"]

        base_path = get_app_data_path() / "models" / model_id / "base"
        assert base_path.exists()

        quant_path = get_app_data_path() / "models" / model_id / "q0f16"
        assert quant_path.exists()

        base_path_2 = get_app_data_path() / "models" / model_id_2 / "base"
        assert base_path_2.exists()

        quant_path_2 = get_app_data_path() / "models" / model_id_2 / "q0f16"
        assert quant_path_2.exists()


@pytest.mark.asyncio
async def test_install_model_running(test_fixture, model_installed):
    # Run the model
    await test_fixture.post(
        "/model/run",
        json={
            "ids": [models[0]["id"]],
        },
    )

    responses = []
    async with test_fixture.stream(
        "POST",
        "/model/install",
        json=models[1],
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

        model_id = models[1]["id"]

        base_path = get_app_data_path() / "models" / model_id / "base"
        assert base_path.exists()

        quant_path = get_app_data_path() / "models" / model_id / "q0f16"
        assert quant_path.exists()
