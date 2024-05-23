from pathlib import Path
from python.truffle_types import Quantization
from python.utils import get_disk_usage


class InstallationSystemManager:
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

        if self.current_conversion:
            quantization_dir = Path(
                self.current_conversion["model_path"]) / self.current_conversion["quantization"]

            if quantization_dir.exists():
                quantized_bytes = get_disk_usage(quantization_dir)
                conversion_bytes = self.current_conversion["compressed_size"] - \
                    quantized_bytes

        return download_bytes + conversion_bytes

    def is_models_conversion_turn(self, model_path: str) -> bool:
        return not self.conversion_in_progress and self.conversion_queue and self.conversion_queue[0] == model_path

    def add_to_conversion_queue(self, model_path: str):
        self.conversion_queue.append(model_path)

    def remove_from_conversion_queue(self, quantization: Quantization, compressed_size: int):
        model_path = self.conversion_queue.pop(0)
        self.conversion_in_progress = True
        self.current_conversion = {
            "model_path": model_path,
            "quantization": quantization.value,
            "compressed_size": compressed_size
        }

    def complete_conversion(self):
        self.current_conversion = None
        self.conversion_in_progress = False
