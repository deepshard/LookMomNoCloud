import pytest
import json
from utils import get_app_data_path, get_devices
from tests.integration.data import models


@pytest.mark.asyncio
async def test_highlights(test_fixture):
    response = await test_fixture.get("/model/highlights")
    assert response.status_code == 200

    assert len(response.json()) == 5
    for i in range(5):
        assert response.json()[i]["status"] == "NOT_DOWNLOADED"


@pytest.mark.asyncio
async def test_highlights_downloaded(test_fixture, model_downloaded):
    response = await test_fixture.get("/model/highlights")
    assert response.status_code == 200

    assert len(response.json()) == 5
    assert response.json()[0]["status"] == "STOPPED"


@pytest.mark.asyncio
async def test_highlights_running(test_fixture, model_running):
    response = await test_fixture.get("/model/highlights")
    assert response.status_code == 200

    assert len(response.json()) == 5
    assert response.json()[0]["status"] == "RUNNING"
    assert response.json()[0]["instance"] == 1
