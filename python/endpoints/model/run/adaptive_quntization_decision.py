import itertools
from mlc_llm.support.auto_config import detect_config, detect_model_type
from mlc_llm.quantization import QUANTIZATION
from endpoints.model.install import InstallationManager
from endpoints.model.install.install import get_space_check_info
from truffle_types import Quantization
from utils import (
    get_app_data_path,
    get_model_size_info,
    get_usable_memory,
    does_quantization_exist,
)

quantization_scores = {
    Quantization.Q0F16: 1,
    Quantization.Q4F16_0: 0.89,
    Quantization.Q4F16_1: 0.89,
    Quantization.Q4F16_2: 0.92,
    Quantization.Q4F16_FT: 0.73,
    Quantization.Q3F16_0: 0.68,
    Quantization.Q3F16_1: 0.68,
}


def get_model_size(model_id: str) -> int:
    return 30_000_000_000


def get_model_size_score(model_size: int) -> float:
    # If model >= 70B params, return 0.33
    if model_size >= 70_000_000_000:
        return 0.33

    # If model >= 30B params, return 0.75
    if model_size >= 30_000_000_000:
        return 0.75

    # Else, return 1
    return 1


def get_quantization_time_penalty(model_id: str, quantization: Quantization) -> float:
    if not does_quantization_exist(model_id, quantization):
        model_size = get_model_size(model_id)
        return 0.1 * get_model_size_score(model_size)

    return 0


def get_expected_memory_consumption(models: list[str, Quantization]) -> int:
    total_size = 0
    for model_id, quantization in models:
        base_weights_path = get_app_data_path() / "models" / model_id / "base"
        _, compressed_size = get_model_size_info(base_weights_path, quantization)
        total_size += compressed_size

    return total_size


def get_expected_disk_consumption(models: list[str, Quantization]) -> int:
    total_size = 0
    for model_id, quantization in models:
        if not does_quantization_exist(model_id, quantization):
            base_weights_path = get_app_data_path() / "models" / model_id / "base"
            _, compressed_size = get_model_size_info(base_weights_path, quantization)
            total_size += compressed_size

    return total_size


def get_capabilities_score(model_id: str, quantization: Quantization) -> float:
    model_size = get_model_size(model_id)
    model_size_score = get_model_size_score(model_size)
    quantization_score = quantization_scores[quantization]
    return model_size_score * quantization_score


def get_score(models: list[str, Quantization]) -> dict[str, float]:
    score = 0
    for model_id, quantization in models:
        score += get_capabilities_score(
            model_id, quantization
        ) - get_quantization_time_penalty(model_id, quantization)

    return score


def get_quantization_options(model_id: str) -> list[Quantization]:
    base_weights_path = get_app_data_path() / "models" / model_id / "base"
    config = detect_config(base_weights_path)
    model = detect_model_type("auto", config)

    quantization_kinds = list(model.quantize.keys())
    raw_quantization_options = [
        quant for quant in QUANTIZATION.values() if quant.kind in quantization_kinds
    ]
    quantization_options = [
        quant for quant in Quantization if quant.value in raw_quantization_options
    ]

    return quantization_options


def get_available_configurations(model_ids: list[str]) -> dict[str, list[Quantization]]:
    available_configurations = {}
    for model_id in model_ids:
        base_weights_path = get_app_data_path() / "models" / model_id / "base"
        quantization_options = get_quantization_options(model_id)
        available_configurations[model_id] = quantization_options

    return available_configurations


def get_usable_configurations(
    configurations: dict[str, list[Quantization]],
    installation_manager: InstallationManager,
):
    """
    Create every possible combination of quantization options and return the ones whose
    expected memory consumption and expected disk consumption are less than the system's
    available resources.
    """
    model_ids = list(configurations.keys())
    all_combinations = itertools.product(
        ((model_id, quant) for quant in configurations[model_id])
        for model_id in model_ids
    )

    usable_configurations = []
    for combination in all_combinations:
        models = [(model_id, quant) for model_id, quant in combination]

        expected_memory = get_expected_memory_consumption(models)
        expected_disk = get_expected_disk_consumption(models)

        available_memory, disk_space, bytes_remaining = get_space_check_info(
            installation_manager
        )
        if (
            expected_memory < available_memory
            and expected_disk + bytes_remaining < disk_space
        ):
            usable_configurations.append(models)

    return usable_configurations


def get_adaptive_quantization_decision(
    model_ids: list[str], installation_manager: InstallationManager
) -> list[str, Quantization]:
    available_configurations = get_available_configurations(model_ids)
    usable_configurations = get_usable_configurations(
        available_configurations, installation_manager
    )
    scores = {
        combination: get_score(combination) for combination in usable_configurations
    }

    best_combination = max(scores, key=scores.get)
    return best_combination
