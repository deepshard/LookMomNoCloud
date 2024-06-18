import pytest
import json
from fastapi.testclient import TestClient
from server import app, init_state
from utils import get_app_data_path, get_devices


@pytest.mark.asyncio
async def test_install_devices(test_fixture):
    print(get_devices())
    responses = []
    async with test_fixture.stream(
        "POST",
        "/model/install",
        json={
            "id": "6b99b94e-a4e4-473a-bd31-c0462fcaece9",
            "url": "https://huggingface.co/openai-community/gpt2",
        },
    ) as response:
        assert response.status_code == 200
        async for line in response.aiter_lines():
            if line:
                event_data = json.loads(line.split("data: ", 1)[1])
                responses.append(event_data)
                print(event_data)

    assert responses[0]["status"] == "ACKNOWLEDGED"
    assert responses[1]["status"] == "DOWNLOADING"
    assert responses[-2]["status"] == "INSTALLING"
    assert responses[-1]["status"] == "STOPPED"

    base_path = get_app_data_path() / "models" / "6b99b94e-a4e4-473a-bd31-c0462fcaece9" / "base"
    assert base_path.exists()

    quant_path = get_app_data_path() / "models" / "6b99b94e-a4e4-473a-bd31-c0462fcaece9" / "q0f16"
    assert quant_path.exists()
