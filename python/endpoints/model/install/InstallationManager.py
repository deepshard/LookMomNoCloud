from pathlib import Path
from truffle_types import Quantization
from utils import get_disk_usage


class InstallationManager:
    """ Manages global state of the installation system. """

    def __init__(self):
        self.downloads = {}
        self.conversion_queue = []
        self.current_conversion = None
        self.conversion_in_progress = False

    def set_download(self, id: str, bytes_remaining: int):
        self.downloads[id] = bytes_remaining

    def clear_download(self, id: str):
        self.downloads.pop(id, None)

    def get_total_bytes_remaining(self) -> int:
        download_bytes = sum(self.downloads.values())
        conversion_bytes = 0

        for model in self.conversion_queue:
            conversion_bytes += model["compressed_size"]

        if self.current_conversion:
            quantization_dir = Path(
                self.current_conversion["model_path"]) / self.current_conversion["quantization"]

            if quantization_dir.exists():
                quantized_bytes = get_disk_usage(quantization_dir)
                conversion_bytes = self.current_conversion["compressed_size"] - \
                    quantized_bytes

        return download_bytes + conversion_bytes

    def is_models_conversion_turn(self, model_path: str, quantization: Quantization) -> bool:
        return not self.conversion_in_progress and self.conversion_queue and self.conversion_queue[0]["model_path"] == model_path and self.conversion_queue[0]["quantization"] == quantization.value

    def add_to_conversion_queue(self, model_path: str, quantization: Quantization, compressed_size: int):
        self.conversion_queue.append({
            "model_path": model_path,
            "quantization": quantization.value,
            "compressed_size": compressed_size
        })

    def remove_from_conversion_queue(self):
        model = self.conversion_queue.pop(0)
        self.conversion_in_progress = True
        self.current_conversion = model

    def complete_conversion(self):
        self.current_conversion = None
        self.conversion_in_progress = False

    def cancel_conversion(self, model_path: str, quantization: Quantization):
        self.conversion_queue = [
            model for model in self.conversion_queue if model["model_path"] != model_path and model["quantization"] != quantization.value]

    def cancel_conversions(self, models: list[dict]):
        for model in models:
            self.cancel_conversion(model["model_path"], model["quantization"])
