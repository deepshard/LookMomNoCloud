import os
import pytest
from endpoints.model.delete import delete_model_handler
from utils import get_app_data_path

# Test the delete model logic
# Cases:
# - Only base weights exist
# - Base and quant weights exist
# - No weights exist

# Mocks
ID = "TEST_1234"
MOCK_FILES = [
    {
        "file_path": "file_one.bin",
        "data": os.urandom(1024)
    },
    {
        "file_path": "file_two.bin",
        "data": os.urandom(1024)
    },
    {
        "file_path": "sub_folder/file_three.bin",
        "data": os.urandom(1024)
    }
]


def test_delete_model_base():
    # Create mock files
    base_path = get_app_data_path() / "models" / ID / "base"
    for file in MOCK_FILES:
        file_path = base_path / file["file_path"]
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(file["data"])

    # Delete the model
    delete_model_handler(ID)

    # Assert that the model directory is deleted
    assert not base_path.exists(), "Model base directory should be deleted"
    assert not (
        base_path / "sub_folder").exists(), "Sub-folder should be deleted"
    assert not (get_app_data_path() / "models" /
                ID).exists(), "Model top-level directory should be deleted"


def test_delete_model_with_quant_dir():
    # Create mock files
    base_path = get_app_data_path() / "models" / ID / "base"
    quant_path = get_app_data_path() / "models" / ID / "INT4"
    for file in MOCK_FILES:
        file_path = base_path / file["file_path"]
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(file["data"])

        file_path = quant_path / file["file_path"]
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(file["data"])

    # Delete the model
    delete_model_handler(ID)

    # Assert that the model directory is deleted
    assert not base_path.exists(), "Model base directory should be deleted"
    assert not quant_path.exists(), "Model quant directory should be deleted"
    assert not (
        base_path / "sub_folder").exists(), "Sub-folder should be deleted"
    assert not (
        quant_path / "sub_folder").exists(), "Sub-folder should be deleted"
    assert not (get_app_data_path() / "models" /
                ID).exists(), "Model top-level directory should be deleted"


def test_delete_model_no_files():
    # Delete the model
    with pytest.raises(FileNotFoundError):
        delete_model_handler(ID)
