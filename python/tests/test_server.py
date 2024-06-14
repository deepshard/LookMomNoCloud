import pytest
import unittest.mock as mock
from unittest.mock import patch
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def mock_generators(mocker):
    mock_sysinfo_generator = mocker.patch("server.sysinfo_generator")
    mock_delete_model_handler = mocker.patch("server.delete_model_handler")
    mock_install_generator = mocker.patch("server.install_generator")
    mock_run_models_generator = mocker.patch("server.run_models_generator")
    mock_stop_model_handler = mocker.patch("server.stop_model_handler")
    mock_get_highlights = mocker.patch("server.get_highlights", return_value=[])
    mock_get_new = mocker.patch("server.get_new")

    yield (
        mock_sysinfo_generator,
        mock_delete_model_handler,
        mock_install_generator,
        mock_run_models_generator,
        mock_stop_model_handler,
        mock_get_highlights,
        mock_get_new,
    )


def test_sysinfo(mock_generators):
    mock_sysinfo_generator, _, _, _, _, _, _ = mock_generators
    response = client.get("/sysinfo")
    assert response.status_code == 200
    assert response.headers["Content-Type"] == "text/event-stream"
    assert response.headers["Cache-Control"] == "no-cache"
    assert response.headers["Connection"] == "keep-alive"
    mock_sysinfo_generator.assert_called_once()
    mock_sysinfo_generator.assert_called_with()


def test_highlights(mock_generators):
    _, _, _, _, _, mock_get_highlights, _ = mock_generators
    response = client.get("/highlights")
    assert response.status_code == 200
    mock_get_highlights.assert_called_once()
    mock_get_highlights.assert_called_with()


def test_new(mock_generators):
    _, _, _, _, _, _, mock_get_new = mock_generators
    response = client.get("/new")
    assert response.status_code == 200
    mock_get_new.assert_called_once()
    mock_get_new.assert_called_with()


def test_install_model(mock_generators):
    _, _, mock_install_generator, _, _, _, _ = mock_generators
    response = client.post(
        "/model/install",
        json={"id": "aaaa-bbbb-cccc-dddd", "url": "https://example.com/model.zip"},
    )
    assert response.status_code == 200
    assert response.headers["Cache-Control"] == "no-cache"
    assert response.headers["Connection"] == "keep-alive"
    mock_install_generator.assert_called_once()
    mock_install_generator.assert_called_with(
        "aaaa-bbbb-cccc-dddd", "https://example.com/model.zip"
    )


def test_run_model(mock_generators):
    _, _, _, mock_run_models_generator, _, _, _ = mock_generators
    response = client.post(
        "/model/run", json={"ids": ["aaaa-bbbb-cccc-dddd", "eeee-ffff-gggg-hhhh"]}
    )
    assert response.status_code == 200
    assert response.headers["Cache-Control"] == "no-cache"
    assert response.headers["Connection"] == "keep-alive"
    mock_run_models_generator.assert_called_once()
    mock_run_models_generator.assert_called_with(["aaaa-bbbb-cccc-dddd", "eeee-ffff-gggg-hhhh"])


def test_stop_model(mock_generators):
    _, _, _, _, mock_stop_model_handler, _, _ = mock_generators
    response = client.post("/model/stop", json={"id": "aaaa-bbbb-cccc-dddd", "instance": 1})
    assert response.status_code == 200
    mock_stop_model_handler.assert_called_once()
    mock_stop_model_handler.assert_called_with("aaaa-bbbb-cccc-dddd", 1)


def test_delete_model(mock_generators):
    _, mock_delete_model_handler, _, _, _, _, _ = mock_generators
    response = client.delete("/model/aaaa-bbbb-cccc-dddd")
    assert response.status_code == 200
    mock_delete_model_handler.assert_called_once()
    mock_delete_model_handler.assert_called_with("aaaa-bbbb-cccc-dddd")
