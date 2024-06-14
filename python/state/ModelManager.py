import itertools
import psutil
from pathlib import Path
from mlc_llm.support.auto_config import detect_config, detect_model_type
from mlc_llm.quantization import QUANTIZATION
from truffle_types import Quantization
from utils import (
    get_disk_usage,
    get_app_data_path,
    get_model_size_info,
    get_usable_memory,
    does_quantization_exist,
)
from constants import TRUFFLE_API_URL


class ModelManager:
    """Manages the download and conversion of models, as well as the adaptive quantization decision system."""

    def __init__(self, session):
        self.session = session
        self.downloads = {}
        self.conversion_queue = []
        self.current_conversion = None
        self.conversion_in_progress = False

        self.quantization_scores = {
            Quantization.Q0F16: 1,
            Quantization.Q4F16_0: 0.94,
            Quantization.Q4F16_1: 0.94,
            Quantization.Q4F16_2: 0.96,
            Quantization.Q4F16_FT: 0.68,
            Quantization.Q3F16_0: 0.72,
            Quantization.Q3F16_1: 0.72,
        }

    ### Download and Conversion System ###
    def set_download(self, id: str, bytes_remaining: int):
        """Set the number of bytes remaining for a download."""

        self.downloads[id] = bytes_remaining

    def clear_download(self, id: str):
        """Clear the number of bytes remaining for a download."""

        self.downloads.pop(id, None)

    def get_total_bytes_remaining(self) -> int:
        """Return the total number of bytes remaining to be processed for all downloads and conversions."""

        download_bytes = sum(self.downloads.values())
        conversion_bytes = 0

        for model in self.conversion_queue:
            conversion_bytes += model["compressed_size"]

        if self.current_conversion:
            quantization_dir = (
                Path(self.current_conversion["model_path"])
                / self.current_conversion["quantization"]
            )

            if quantization_dir.exists():
                quantized_bytes = get_disk_usage(quantization_dir)
                conversion_bytes += (
                    self.current_conversion["compressed_size"] - quantized_bytes
                )

        return download_bytes + conversion_bytes

    def is_models_conversion_turn(
        self, model_path: str, quantization: Quantization
    ) -> bool:
        """Check if the model is next in line for conversion and the prior conversion has completed."""

        return (
            not self.conversion_in_progress
            and self.conversion_queue
            and self.conversion_queue[0]["model_path"] == model_path
            and self.conversion_queue[0]["quantization"] == quantization.value
        )

    def add_to_conversion_queue(
        self, model_path: str, quantization: Quantization, compressed_size: int
    ):
        """Add a model to the conversion queue."""

        self.conversion_queue.append(
            {
                "model_path": model_path,
                "quantization": quantization.value,
                "compressed_size": compressed_size,
            }
        )

    def remove_from_conversion_queue(self):
        """Remove the model from the front of the conversion queue."""

        model = self.conversion_queue.pop(0)
        self.conversion_in_progress = True
        self.current_conversion = model

    def complete_conversion(self):
        """Mark the current conversion as complete so the next conversion can begin processing."""

        self.current_conversion = None
        self.conversion_in_progress = False

    def cancel_conversions(self, models: list[dict]):
        """Cancel conversions for a list of models."""

        cancel_set = {
            (model["model_path"], model["quantization"].value) for model in models
        }
        self.conversion_queue = [
            queued_model
            for queued_model in self.conversion_queue
            if (queued_model["model_path"], queued_model["quantization"])
            not in cancel_set
        ]

    def get_space_check_info(self, run: bool = False) -> tuple[int, int, int]:
        """Return the available RAM, disk space, and total bytes remaining for processing."""

        available_ram = get_usable_memory(run)
        disk_space = psutil.disk_usage("/").free
        bytes_remaining = self.get_total_bytes_remaining()
        return available_ram, disk_space, bytes_remaining

    ### Adaptive Quantization Decision System ###
    async def get_model_size(self, model_id: str) -> int:
        """Fetch the size (param count) of a model from the Truffle API."""

        async with self.session.get(
            f"{TRUFFLE_API_URL}/models?id={model_id}&filter=id,name,title,size,author,downloads,likes,intro,capabilities,risks,evalId,hfLink,bg_image_url"
        ) as response:
            assert response.status == 200, f"Failed to fetch model size for {model_id}"
            model = await response.json()
            return model["size"]

    def get_model_size_score(self, model_size: int) -> float:
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
        self, model_id: str, quantization: Quantization
    ) -> float:
        """
        If a model has not been quantized, then there is a 10% penalty based on its size.
        Quantizing a model takes time, so we want to penalize the score for models that
        are not ready to be served immediately.
        """

        if not does_quantization_exist(model_id, quantization):
            model_size = await self.get_model_size(model_id)
            return 0.1 * self.get_model_size_score(model_size)

        return 0

    def get_expected_memory_consumption(self, models: list[str, Quantization]) -> int:
        """Estimates the expected memory consumption of a list of model configurations."""

        total_size = 0
        for model_id, quantization in models:
            base_weights_path = get_app_data_path() / "models" / model_id / "base"
            _, compressed_size = get_model_size_info(base_weights_path, quantization)
            total_size += compressed_size

        return total_size

    def get_expected_disk_consumption(self, models: list[str, Quantization]) -> int:
        """Estimates the expected disk consumption of a list of model configurations."""

        total_size = 0
        for model_id, quantization in models:
            if not does_quantization_exist(model_id, quantization):
                base_weights_path = get_app_data_path() / "models" / model_id / "base"
                _, compressed_size = get_model_size_info(
                    base_weights_path, quantization
                )
                total_size += compressed_size

        return total_size

    async def get_capabilities_score(
        self, model_id: str, quantization: Quantization
    ) -> float:
        """
        Returns a capabilities score based on the model's size and the expected impact of
        quantization on model downstream performance.
        """

        model_size = await self.get_model_size(model_id)
        model_size_score = self.get_model_size_score(model_size)
        quantization_score = self.quantization_scores[quantization]
        return model_size_score * quantization_score

    async def get_score(self, models) -> dict[str, float]:
        """Returns an overall score taking into account capabilities and quantization time penalty."""

        score = 0
        for configuration in models:
            capabilities_score = await self.get_capabilities_score(
                configuration[0], configuration[1]
            )
            quantization_time_penalty = await self.get_quantization_time_penalty(
                configuration[0], configuration[1]
            )
            score += capabilities_score - quantization_time_penalty

        return score

    def get_quantization_options(self, model_id: str) -> list[Quantization]:
        """Returns the quantization options available for a model and converts them to Quantization enum."""

        # Collect information necessary for identifying available quantization kinds
        base_weights_path = get_app_data_path() / "models" / model_id / "base"
        print(get_app_data_path)
        print(detect_config)
        config = detect_config(base_weights_path)
        model = detect_model_type("auto", config)

        # Get the quantization options available for the model then convert them to Quantization enum
        quantization_kinds = list(model.quantize.keys())
        raw_quantization_options = [
            quant.name
            for quant in QUANTIZATION.values()
            if quant.kind in quantization_kinds
        ]
        quantization_options = [
            quant for quant in Quantization if quant.value in raw_quantization_options
        ]
        return quantization_options

    def get_available_configurations(
        self, model_ids: list[str]
    ) -> list[tuple[str, list[Quantization]]]:
        """Returns the available quantization options for a list of model IDs."""

        available_configurations = []
        for model_id in model_ids:
            quantization_options = self.get_quantization_options(model_id)
            available_configurations.append((model_id, quantization_options))

        return available_configurations

    def get_usable_configurations(
        self, configurations: list[tuple[str, list[Quantization]]]
    ):
        """
        Create every possible combination of model x quantization options and return the ones whose
        expected memory consumption and expected disk consumption are less than the system's
        available resources.
        """

        # Create a list of all possible combinations of model x quantization options
        quant_options = []
        for model_id, quant in configurations:
            quant_options.append([(model_id, quant) for quant in quant])
        all_combinations = itertools.product(*quant_options)

        usable_configurations = []
        for combination in all_combinations:
            models = [(model_id, quant) for model_id, quant in combination]

            # Collect expected memory and disk consumption for the combination
            expected_memory = self.get_expected_memory_consumption(models)
            expected_disk = self.get_expected_disk_consumption(models)

            # Check if the combination is usable based on available resources
            available_memory, disk_space, bytes_remaining = self.get_space_check_info(
                True
            )
            if (
                expected_memory < available_memory
                and expected_disk + bytes_remaining < disk_space
            ):
                usable_configurations.append(models)

        return usable_configurations

    async def get_adaptive_quantization_decision(
        self, model_ids: list[str]
    ) -> list[str, Quantization]:
        """
        Returns the best combination of models and quantization options based on the available
        configurations and the system's available resources.
        Args:
            model_ids: List of model IDs to take into account for adaptive quantization.
        """

        available_configurations = self.get_available_configurations(model_ids)
        usable_configurations = self.get_usable_configurations(available_configurations)

        if len(usable_configurations) == 0:
            raise Exception("No usable configurations found")

        best_combination = None
        max_score = 0
        for combination in usable_configurations:
            score = await self.get_score(combination)
            if score > max_score:
                max_score = score
                best_combination = combination

        return best_combination
