import pytest
from pathlib import Path
from endpoints import delete_model_handler
from tests.data import ID, MOCK_FILES


# Helpers
def create_files(path: Path):
    for file in MOCK_FILES:
        file_path = path / file["file_path"]
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(file["data"])


# Test the delete model logic
# Cases:
# - Only base weights exist
# - Base and quant weights exist
# - No weights exist


def test_delete_model_base(session_fixture):
    # Mocks
    session_fixture("endpoints.model.delete.delete")

    # Create mock files
    base_path = Path("/tmp") / "models" / ID / "base"
    create_files(base_path)

    # Delete the model
    delete_model_handler(ID)

    # Assert that the model directory is deleted
    assert not base_path.exists(), "Model base directory should be deleted"
    assert not (base_path / "sub_folder").exists(), "Sub-folder should be deleted"
    assert not (
        Path("/tmp") / "models" / ID
    ).exists(), "Model top-level directory should be deleted"


def test_delete_model_with_quant_dir(session_fixture):
    # Mocks
    session_fixture("endpoints.model.delete.delete")

    # Create mock files
    base_path = Path("/tmp") / "models" / ID / "base"
    quant_path = Path("/tmp") / "models" / ID / "INT4"
    create_files(base_path)
    create_files(quant_path)

    # Delete the model
    delete_model_handler(ID)

    # Assert that the model directory is deleted
    assert not base_path.exists(), "Model base directory should be deleted"
    assert not quant_path.exists(), "Model quant directory should be deleted"
    assert not (base_path / "sub_folder").exists(), "Sub-folder should be deleted"
    assert not (quant_path / "sub_folder").exists(), "Sub-folder should be deleted"
    assert not (
        Path("/tmp") / "models" / ID
    ).exists(), "Model top-level directory should be deleted"


def test_delete_model_no_files(session_fixture):
    # Mocks
    session_fixture("endpoints.model.delete.delete")

    # Delete the model
    with pytest.raises(FileNotFoundError):
        delete_model_handler(ID)
