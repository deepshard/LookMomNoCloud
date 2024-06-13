import os
import pytest
from unittest import mock
from unittest.mock import patch, MagicMock
from aioresponses import aioresponses
from pathlib import Path
from state import global_state_manager
from server import init_state
from truffle_types import Quantization
import utils
from constants import TRUFFLE_API_URL


# Data
MOCK_MODEL_1 = {
    "id": 1,
    "name": "test",
    "title": "test",
    "size": 30_000_000_000,
    "author": "test",
    "downloads": 1,
    "likes": 1,
    "intro": "test",
    "capabilities": "test",
    "risks": "test",
    "hfLink": "https://huggingface.co/api/models/openai-community/gpt2",
    "evalId": "test",
    "backgroundImage": "test",
}


# Fixtures
@pytest.fixture
def api_mock():
    with aioresponses() as mocked:
        mocked.get(
            TRUFFLE_API_URL + "/models?id=1",
            status=200,
            payload=MOCK_MODEL_1,
            repeat=True,
        )
        mocked.get(
            TRUFFLE_API_URL + "/models?id=2",
            status=200,
            payload=MOCK_MODEL_1,
            repeat=True,
        )
        mocked.get(
            TRUFFLE_API_URL + "/models?id=3",
            status=200,
            payload=MOCK_MODEL_1,
            repeat=True,
        )
        yield mocked


# Cases:
# - One model, fits in memory (no quantization)
# - One model, doesn't fit in memory (quantization)
# - One model, can't fit in memory (no quantization)
# - Multiple models, all fit in memory (no quantization)
# - Multiple models, larger model gets quantized more (quantization)
@pytest.mark.asyncio
async def test_get_adaptive_quantization_decision_one_model_fits_in_memory_no_quantization(
    api_mock,
):
    async with init_state():
        model_ids = ["1"]

        with patch(
            "state.global_state_manager.model_manager.get_quantization_options",
            return_value=[
                Quantization.Q0F16,
                Quantization.Q4F16_0,
                Quantization.Q4F16_1,
                Quantization.Q3F16_0,
            ],
        ):
            with patch(
                "state.global_state_manager.model_manager.get_expected_memory_consumption",
                return_value=1000,
            ):
                with patch(
                    "state.global_state_manager.model_manager.get_expected_disk_consumption",
                    return_value=1000,
                ):
                    with patch(
                        "state.global_state_manager.model_manager.get_space_check_info",
                        return_value=(2000, 2000, 0),
                    ):
                        result = await global_state_manager.model_manager.get_adaptive_quantization_decision(
                            model_ids
                        )

                        assert result == [("1", Quantization.Q0F16)]


@pytest.mark.asyncio
async def test_get_adaptive_quantization_decision_one_model_doesnt_fit_in_memory_quantization(
    api_mock,
):
    async with init_state():
        model_ids = ["1"]

        with patch(
            "state.global_state_manager.model_manager.get_quantization_options",
            return_value=[
                Quantization.Q0F16,
                Quantization.Q4F16_0,
                Quantization.Q4F16_1,
                Quantization.Q3F16_0,
            ],
        ):
            with patch("utils.get_disk_usage", return_value=1000):
                with patch(
                    "state.global_state_manager.model_manager.get_space_check_info",
                    return_value=(500, 2000, 0),
                ):
                    result = await global_state_manager.model_manager.get_adaptive_quantization_decision(
                        model_ids
                    )

                    assert result == [("1", Quantization.Q4F16_0)]


@pytest.mark.asyncio
async def test_get_adaptive_quantization_decision_one_model_cant_fit_in_memory_no_quantization(
    api_mock,
):
    async with init_state():
        model_ids = ["1"]

        with patch(
            "state.global_state_manager.model_manager.get_quantization_options",
            return_value=[
                Quantization.Q0F16,
                Quantization.Q4F16_0,
                Quantization.Q4F16_1,
                Quantization.Q3F16_0,
            ],
        ):
            with patch("utils.get_disk_usage", return_value=100000):
                with patch(
                    "state.global_state_manager.model_manager.get_space_check_info",
                    return_value=(500, 500, 0),
                ):
                    with pytest.raises(Exception):
                        result = await global_state_manager.model_manager.get_adaptive_quantization_decision(
                            model_ids
                        )


@pytest.mark.asyncio
async def test_get_adaptive_quantization_decision_multiple_models_all_fit_in_memory_no_quantization(
    api_mock,
):
    async with init_state():
        model_ids = ["1", "2", "3"]

        with patch(
            "state.global_state_manager.model_manager.get_quantization_options",
            return_value=[
                Quantization.Q0F16,
                Quantization.Q4F16_0,
                Quantization.Q4F16_1,
                Quantization.Q3F16_0,
            ],
        ):
            with patch(
                "state.global_state_manager.model_manager.get_expected_memory_consumption",
                return_value=1000,
            ):
                with patch(
                    "state.global_state_manager.model_manager.get_expected_disk_consumption",
                    return_value=1000,
                ):
                    with patch(
                        "state.global_state_manager.model_manager.get_space_check_info",
                        return_value=(2000, 2000, 0),
                    ):
                        result = await global_state_manager.model_manager.get_adaptive_quantization_decision(
                            model_ids
                        )

                        assert result == [
                            ("1", Quantization.Q0F16),
                            ("2", Quantization.Q0F16),
                            ("3", Quantization.Q0F16),
                        ]


@pytest.mark.asyncio
async def test_get_adaptive_quantization_decision_multiple_models_larger_model_gets_quantized_more(
    api_mock,
):
    async with init_state():
        model_ids = ["1", "2", "3"]

        with patch(
            "state.global_state_manager.model_manager.get_quantization_options",
            return_value=[
                Quantization.Q0F16,
                Quantization.Q4F16_0,
                Quantization.Q4F16_1,
                Quantization.Q3F16_0,
            ],
        ):
            with patch(
                "utils.get_app_data_path",
                return_value=Path("/tmp"),
            ):
                with patch("utils.get_disk_usage") as mock_get_disk_usage:

                    def mock_disk_usage(weights_path):
                        if weights_path == Path("/tmp/models/1/base"):
                            return 1000
                        if weights_path == Path("/tmp/models/2/base"):
                            return 2000
                        if weights_path == Path("/tmp/models/3/base"):
                            return 3000

                        return 0

                    mock_get_disk_usage.side_effect = mock_disk_usage

                    with patch(
                        "state.global_state_manager.model_manager.get_space_check_info",
                        return_value=(2500, 2500, 0),
                    ):
                        result = await global_state_manager.model_manager.get_adaptive_quantization_decision(
                            model_ids
                        )

                        assert result == [
                            ("1", Quantization.Q0F16),
                            ("2", Quantization.Q4F16_0),
                            ("3", Quantization.Q4F16_0),
                        ]
