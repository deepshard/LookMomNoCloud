import pytest
from unittest.mock import MagicMock
from pathlib import Path
from state import global_state_manager
from server import init_state
from truffle_types import Quantization
from tests.data import ID, ID_2


@pytest.fixture(autouse=True)
def mock_mlc(mocker):
    mocker.patch(
        "state.ModelManager.detect_model_type",
        return_value=MagicMock(
            quantize={
                "no-quant": "",
                "group-quant": "",
                "ft-quant": "",
                "awq": "",
                "per-tensor-quant": "",
            }
        ),
    )
    mocker.patch("state.ModelManager.detect_config", return_value=MagicMock())


# Cases:
# - One model, fits in memory (no quantization)
# - One model, doesn't fit in memory (quantization)
# - One model, can't fit in memory (no quantization)
# - Multiple models, all fit in memory (no quantization)
# - Multiple models, larger model gets quantized more (quantization)
@pytest.mark.asyncio
async def test_get_adaptive_quantization_decision_one_model_fits_in_memory_no_quantization(
    session_fixture, is_macos, mocker
):
    # Data
    model_ids = [ID]

    # Mocks
    session_fixture("state.ModelManager")
    mocker.patch(
        "psutil.virtual_memory",
        return_value=MagicMock(total=100000000, available=100000000, wired=0),
    )
    mocker.patch(
        "state.ModelManager.ModelManager.get_expected_memory_consumption", return_value=1000
    )
    mocker.patch("state.ModelManager.ModelManager.get_expected_disk_consumption", return_value=1000)

    # Test
    result = await global_state_manager.model_manager.get_adaptive_quantization_decision(model_ids)
    assert result == [(ID, Quantization.Q0F16)]


@pytest.mark.asyncio
async def test_get_adaptive_quantization_decision_one_model_doesnt_fit_in_memory_quantization(
    session_fixture, is_macos, mocker
):
    # Data
    model_ids = [ID]

    # Mocks
    session_fixture("state.ModelManager")
    mocker.patch("psutil.virtual_memory", return_value=MagicMock(available=500))
    mocker.patch("utils.get_disk_usage", return_value=1000)

    # Test
    result = await global_state_manager.model_manager.get_adaptive_quantization_decision(model_ids)

    assert result == [(ID, Quantization.Q4F16_2)]


@pytest.mark.asyncio
async def test_get_adaptive_quantization_decision_one_model_cant_fit_in_memory_no_quantization(
    session_fixture, is_macos, mocker
):
    # Data
    model_ids = [ID]

    # Mocks
    session_fixture("state.ModelManager")
    mocker.patch("psutil.virtual_memory", return_value=MagicMock(available=500))
    mocker.patch("utils.get_disk_usage", return_value=100000)

    # Test
    with pytest.raises(Exception):
        result = await global_state_manager.model_manager.get_adaptive_quantization_decision(
            model_ids
        )


@pytest.mark.asyncio
async def test_get_adaptive_quantization_decision_multiple_models_all_fit_in_memory_no_quantization(
    session_fixture, is_macos, mocker
):
    # Data
    model_ids = [ID, ID, ID_2]

    # Mocks
    session_fixture("state.ModelManager")
    mocker.patch(
        "psutil.virtual_memory",
        return_value=MagicMock(total=100000000, available=100000000, wired=0),
    )
    mocker.patch(
        "state.ModelManager.ModelManager.get_expected_memory_consumption", return_value=1000
    )
    mocker.patch("state.ModelManager.ModelManager.get_expected_disk_consumption", return_value=1000)

    # Test
    result = await global_state_manager.model_manager.get_adaptive_quantization_decision(model_ids)
    assert result == [
        (ID, Quantization.Q0F16),
        (ID, Quantization.Q0F16),
        (ID_2, Quantization.Q0F16),
    ]


@pytest.mark.asyncio
async def test_get_adaptive_quantization_decision_multiple_models_larger_model_gets_quantized_more(
    session_fixture, is_macos, mocker
):
    # Data
    model_ids = [ID, ID_2]

    # Mocks
    session_fixture("state.ModelManager")
    mocker.patch("psutil.virtual_memory", return_value=MagicMock(available=2000))

    def mock_disk_usage(weights_path):
        if weights_path == Path(f"/tmp/models/{ID}/base"):
            return 500
        if weights_path == Path(f"/tmp/models/{ID_2}/base"):
            return 4000

        return 0

    mocker.patch("utils.get_disk_usage", side_effect=mock_disk_usage)

    # Test
    result = await global_state_manager.model_manager.get_adaptive_quantization_decision(model_ids)
    assert result == [
        (ID, Quantization.Q0F16),
        (ID_2, Quantization.Q4F16_2),
    ]
