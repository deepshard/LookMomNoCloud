import os
import platform
import socket
from pathlib import Path
from truffle_types import Quantization


def get_disk_usage(folder_path: str) -> int:
    total_size = 0
    with os.scandir(folder_path) as dir_entries:
        for entry in dir_entries:
            if entry.is_file():
                total_size += entry.stat().st_size
            elif entry.is_dir():
                total_size += get_disk_usage(entry.path)
    return total_size


def get_app_data_path() -> Path:
    system = platform.system()

    if system == "Windows":
        return Path(os.getenv("APPDATA")) / "truffle-app"
    elif system == "Darwin":
        return Path(os.path.expanduser("~/Library/Application Support")) / "truffle-app"
    elif system == "Linux":
        return Path(os.path.expanduser("~/.config")) / "truffle-app"
    else:
        raise ValueError(f"Unsupported system: {system}")


def find_port(port: int = 8899) -> int:
    """Find an open port."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(("localhost", port)) == 0:
            return find_port(port + 1)
        return port


def does_quantization_exist(model_id: str, quantization: Quantization) -> bool:
    quant_path = get_app_data_path() / "models" / model_id / quantization.value
    return quant_path.exists() and len(os.listdir(quant_path)) > 0


def get_quantization_compression(quant: Quantization) -> float:
    # NOTE: We can replace this with a more sophisticated calculation later
    quantization_compression_table = {
        Quantization.INT3: 0.25,
        Quantization.INT4: 0.33,
        Quantization.INT8: 0.55,
    }
    return quantization_compression_table[quant]


def is_convertable_format(base_weights_path: str) -> bool:
    pytorch_json_path = os.path.join(base_weights_path, "pytorch_model.bin.index.json")
    pytorch_bin_path = os.path.join(base_weights_path, "pytorch_model.bin")
    safetensors_path = os.path.join(base_weights_path, "model.safetensors.index.json")
    safetensors_bin_path = os.path.join(base_weights_path, "model.safetensors")

    if (
        os.path.exists(pytorch_json_path)
        or os.path.exists(pytorch_bin_path)
        or os.path.exists(safetensors_path)
        or os.path.exists(safetensors_bin_path)
    ):
        return True

    return False


def get_model_size_info(
    weights_path: str, quantization: Quantization
) -> tuple[int, float]:
    model_size = get_disk_usage(weights_path)
    compression_rate = get_quantization_compression(quantization)
    compressed_size = model_size * compression_rate
    return model_size, compressed_size
