import pytest
from tests.integration.data import models


@pytest.mark.asyncio
async def test_downloaded(test_fixture, model_downloaded):
    response = await test_fixture.get("/model/downloaded")
    assert response.status_code == 200

    assert len(response.json()) == 1
    assert response.json()[0]["id"] == models[0]["id"]


@pytest.mark.asyncio
async def test_downloaded_empty(test_fixture):
    response = await test_fixture.get("/model/downloaded")
    assert response.status_code == 200
    assert response.json() == []
