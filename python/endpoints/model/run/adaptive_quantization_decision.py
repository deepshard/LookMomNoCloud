import itertools
import aiohttp
from mlc_llm.support.auto_config import detect_config, detect_model_type
from mlc_llm.quantization import QUANTIZATION
import endpoints.model.install.InstallationManager as InstallationManager
import endpoints.model.install.install as install
from truffle_types import Quantization
from utils import (
    get_app_data_path,
    get_model_size_info,
    get_usable_memory,
    does_quantization_exist,
)
from constants import TRUFFLE_API_URL

quantization_scores = {
    Quantization.Q0F16: 1,
    Quantization.Q4F16_0: 0.89,
    Quantization.Q4F16_1: 0.89,
    Quantization.Q4F16_2: 0.92,
    Quantization.Q4F16_FT: 0.73,
    Quantization.Q3F16_0: 0.68,
    Quantization.Q3F16_1: 0.68,
}


async def get_model_size(model_id: str) -> int:
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{TRUFFLE_API_URL}/models?id={model_id}") as response:
            assert response.status == 200, f"Failed to fetch model {model_id}"
            model = await response.json()
            print(model)
            return model["size"]


def get_model_size_score(model_size: int) -> float:
    """
    Returns a score based on the model's size. The larger the model, the lower
    the score because it has a higher default performance level, therefore it
    can handle more quantization.
    """

    # If model >= 70B params, return 0.33
    if model_size >= 70_000_000_000:
        return 0.33

    # If model >= 30B params, return 0.75
    if model_size >= 30_000_000_000:
        return 0.75

    # Else, return 1
    return 1


async def get_quantization_time_penalty(
    model_id: str, quantization: Quantization
) -> float:
    """
    If a model has not been quantized, then there is a 10% penalty based on its size.
    Quantizing a model takes time, so we want to penalize the score for models that
    are not ready to be served immediately.
    """

    if not does_quantization_exist(model_id, quantization):
        model_size = await get_model_size(model_id)
        return 0.1 * get_model_size_score(model_size)

    return 0


def get_expected_memory_consumption(models: list[str, Quantization]) -> int:
    """Estimates the expected memory consumption of a list of model configurations."""

    total_size = 0
    for model_id, quantization in models:
        base_weights_path = get_app_data_path() / "models" / model_id / "base"
        _, compressed_size = get_model_size_info(base_weights_path, quantization)
        total_size += compressed_size

    return total_size


def get_expected_disk_consumption(models: list[str, Quantization]) -> int:
    """Estimates the expected disk consumption of a list of model configurations."""

    total_size = 0
    for model_id, quantization in models:
        if not does_quantization_exist(model_id, quantization):
            base_weights_path = get_app_data_path() / "models" / model_id / "base"
            _, compressed_size = get_model_size_info(base_weights_path, quantization)
            total_size += compressed_size

    return total_size


async def get_capabilities_score(model_id: str, quantization: Quantization) -> float:
    """
    Returns a capabilities score based on the model's size and the expected impact of
    quantization on model downstream performance.
    """

    model_size = await get_model_size(model_id)
    model_size_score = get_model_size_score(model_size)
    quantization_score = quantization_scores[quantization]
    return model_size_score * quantization_score


async def get_score(models) -> dict[str, float]:
    """Returns an overall score taking into account capabilities and quantization time penalty."""

    score = 0
    for configuration in models:
        capabilities_score = await get_capabilities_score(
            configuration[0], configuration[1]
        )
        quantization_time_penalty = await get_quantization_time_penalty(
            configuration[0], configuration[1]
        )
        score += capabilities_score - quantization_time_penalty

    return score


def get_quantization_options(model_id: str) -> list[Quantization]:
    # Collect information necessary for identifying available quantization kinds
    base_weights_path = get_app_data_path() / "models" / model_id / "base"
    config = detect_config(base_weights_path)
    model = detect_model_type("auto", config)

    # Get the quantization options available for the model then convert them to Quantization enum
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
        quantization_options = get_quantization_options(model_id)
        available_configurations[model_id] = quantization_options

    return available_configurations


def get_usable_configurations(
    configurations: dict[str, list[Quantization]],
    installation_manager: InstallationManager,
):
    """
    Create every possible combination of model x quantization options and return the ones whose
    expected memory consumption and expected disk consumption are less than the system's
    available resources.
    """

    # Create a list of all possible combinations of model x quantization options
    model_ids = list(configurations.keys())
    quant_options = quant_options = [
        [(model_id, quant) for quant in configurations[model_id]]
        for model_id in model_ids
    ]
    all_combinations = itertools.product(*quant_options)

    usable_configurations = []
    for combination in all_combinations:
        models = [(model_id, quant) for model_id, quant in combination]

        # Collect expected memory and disk consumption for the combination
        expected_memory = get_expected_memory_consumption(models)
        expected_disk = get_expected_disk_consumption(models)

        # Check if the combination is usable based on available resources
        available_memory, disk_space, bytes_remaining = install.get_space_check_info(
            installation_manager
        )
        if (
            expected_memory < available_memory
            and expected_disk + bytes_remaining < disk_space
        ):
            usable_configurations.append(models)

    return usable_configurations


async def get_adaptive_quantization_decision(
    model_ids: list[str], installation_manager: InstallationManager
) -> list[str, Quantization]:
    """
    Returns the best combination of models and quantization options based on the available
    configurations and the system's available resources.

    Args:
        model_ids: List of model IDs
        installation_manager: InstallationManager object
    """

    available_configurations = get_available_configurations(model_ids)
    usable_configurations = get_usable_configurations(
        available_configurations, installation_manager
    )

    if len(usable_configurations) == 0:
        raise Exception("No usable configurations found")

    best_combination = None
    max_score = 0
    for combination in usable_configurations:
        score = await get_score(combination)
        if score > max_score:
            max_score = score
            best_combination = combination

    return best_combination
