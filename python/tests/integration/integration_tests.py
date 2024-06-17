import pytest
import json
from fastapi.testclient import TestClient
from server import app, init_state
from utils import get_app_data_path, get_devices


@pytest.mark.asyncio
async def test_install_no_devices(test_fixture):
    if len(get_devices()) > 0:
        pytest.skip("Devices available")

    async with test_fixture.stream(
        "POST",
        "/model/install",
        json={
            "id": "8933c0e6-c7d5-41f8-a02e-936a1e03afb9",
            "url": "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct",
        },
    ) as response:
        assert response.status_code == 400


@pytest.mark.asyncio
async def test_install_devices(test_fixture):
    if len(get_devices()) == 0:
        pytest.skip("No devices available")

    responses = []
    async with test_fixture.stream(
        "POST",
        "/model/install",
        json={
            "id": "8933c0e6-c7d5-41f8-a02e-936a1e03afb9",
            "url": "https://huggingface.co/microsoft/Phi-3-mini-4k-instruct",
        },
    ) as response:
        assert response.status_code == 200
        async for line in response.aiter_lines():
            if line:
                event_data = json.loads(line.split('data: ', 1)[1])
                responses.append(event_data)
                print(responses[-1])

    assert responses[0]["status"] == "ACKNOWLEDGED"
    assert responses[1]["status"] == "DOWNLOADING"
    assert responses[-2]["status"] == "INSTALLING"
    assert responses[-1]["status"] == "STOPPED"

    base_path = get_app_data_path() / "models" / "8933c0e6-c7d5-41f8-a02e-936a1e03afb9" / "base"
    assert base_path.exists()

    quant_path = get_app_data_path() / "models" / "8933c0e6-c7d5-41f8-a02e-936a1e03afb9" / "q0f16"
    assert quant_path.exists()
