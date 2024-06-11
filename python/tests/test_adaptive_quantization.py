import os
import pytest
from unittest import mock
from unittest.mock import patch, MagicMock
from pathlib import Path
from endpoints.model.install.InstallationManager import InstallationManager
from endpoints.model.run.adaptive_quantization_decision import (
    get_adaptive_quantization_decision,
)
from truffle_types import Quantization
import utils

# Cases:
# - One model, fits in memory (no quantization)
# - One model, doesn't fit in memory (quantization)
# - One model, can't fit in memory (no quantization)
# - Multiple models, all fit in memory (no quantization)
# - Multiple models, larger model gets quantized more (quantization)


def test_get_adaptive_quantization_decision_one_model_fits_in_memory_no_quantization():
    model_ids = ["1"]
    installation_manager = InstallationManager()

    with patch(
        "endpoints.model.run.adaptive_quantization_decision.get_quantization_options",
        return_value=[
            Quantization.Q0F16,
            Quantization.Q4F16_0,
            Quantization.Q4F16_1,
            Quantization.Q3F16_0,
        ],
    ):
        with patch(
            "endpoints.model.run.adaptive_quantization_decision.get_expected_memory_consumption",
            return_value=1000,
        ):
            with patch(
                "endpoints.model.run.adaptive_quantization_decision.get_expected_disk_consumption",
                return_value=1000,
            ):
                with patch(
                    "endpoints.model.run.adaptive_quantization_decision.install.get_space_check_info",
                    return_value=(2000, 2000, 0),
                ):
                    result = get_adaptive_quantization_decision(
                        model_ids, installation_manager
                    )

                    assert result == [("1", Quantization.Q0F16)]


def test_get_adaptive_quantization_decision_one_model_doesnt_fit_in_memory_quantization():
    model_ids = ["1"]
    installation_manager = InstallationManager()

    with patch(
        "endpoints.model.run.adaptive_quantization_decision.get_quantization_options",
        return_value=[
            Quantization.Q0F16,
            Quantization.Q4F16_0,
            Quantization.Q4F16_1,
            Quantization.Q3F16_0,
        ],
    ):
        with patch("utils.get_disk_usage", return_value=1000):
            with patch(
                "endpoints.model.run.adaptive_quantization_decision.install.get_space_check_info",
                return_value=(500, 2000, 0),
            ):
                result = get_adaptive_quantization_decision(
                    model_ids, installation_manager
                )

                assert result == [("1", Quantization.Q4F16_0)]


def test_get_adaptive_quantization_decision_one_model_cant_fit_in_memory_no_quantization():
    model_ids = ["1"]
    installation_manager = InstallationManager()

    with patch(
        "endpoints.model.run.adaptive_quantization_decision.get_quantization_options",
        return_value=[
            Quantization.Q0F16,
            Quantization.Q4F16_0,
            Quantization.Q4F16_1,
            Quantization.Q3F16_0,
        ],
    ):
        with patch("utils.get_disk_usage", return_value=100000):
            with patch(
                "endpoints.model.run.adaptive_quantization_decision.install.get_space_check_info",
                return_value=(500, 500, 0),
            ):
                with pytest.raises(Exception):
                    result = get_adaptive_quantization_decision(
                        model_ids, installation_manager
                    )


def test_get_adaptive_quantization_decision_multiple_models_all_fit_in_memory_no_quantization():
    model_ids = ["1", "2", "3"]
    installation_manager = InstallationManager()

    with patch(
        "endpoints.model.run.adaptive_quantization_decision.get_quantization_options",
        return_value=[
            Quantization.Q0F16,
            Quantization.Q4F16_0,
            Quantization.Q4F16_1,
            Quantization.Q3F16_0,
        ],
    ):
        with patch(
            "endpoints.model.run.adaptive_quantization_decision.get_expected_memory_consumption",
            return_value=1000,
        ):
            with patch(
                "endpoints.model.run.adaptive_quantization_decision.get_expected_disk_consumption",
                return_value=1000,
            ):
                with patch(
                    "endpoints.model.run.adaptive_quantization_decision.install.get_space_check_info",
                    return_value=(2000, 2000, 0),
                ):
                    result = get_adaptive_quantization_decision(
                        model_ids, installation_manager
                    )

                    assert result == [
                        ("1", Quantization.Q0F16),
                        ("2", Quantization.Q0F16),
                        ("3", Quantization.Q0F16),
                    ]


def test_get_adaptive_quantization_decision_multiple_models_larger_model_gets_quantized_more():
    model_ids = ["1", "2", "3"]
    installation_manager = InstallationManager()

    with patch(
        "endpoints.model.run.adaptive_quantization_decision.get_quantization_options",
        return_value=[
            Quantization.Q0F16,
            Quantization.Q4F16_0,
            Quantization.Q4F16_1,
            Quantization.Q3F16_0,
        ],
    ):
        with patch(
            "endpoints.model.run.adaptive_quantization_decision.get_app_data_path",
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
                    "endpoints.model.run.adaptive_quantization_decision.install.get_space_check_info",
                    return_value=(2500, 2500, 0),
                ):
                    result = get_adaptive_quantization_decision(
                        model_ids, installation_manager
                    )

                    assert result == [
                        ("1", Quantization.Q0F16),
                        ("2", Quantization.Q4F16_0),
                        ("3", Quantization.Q4F16_0),
                    ]
